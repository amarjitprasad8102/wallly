import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SESClient, SendEmailCommand } from "https://esm.sh/@aws-sdk/client-ses@3.699.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  templateUsed?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const region = Deno.env.get("AWS_SES_REGION") || "us-east-1";
    const fromEmail = Deno.env.get("SES_FROM_EMAIL");

    if (!accessKeyId || !secretAccessKey || !fromEmail) {
      console.error("AWS SES credentials not configured");
      throw new Error("AWS SES credentials not configured");
    }

    // Get auth token to identify admin
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let sentByUserId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      sentByUserId = user?.id || null;
    }

    const { to, subject, html, text, templateUsed }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, html");
    }

    const recipients = Array.isArray(to) ? to : [to];
    console.log(`Sending email to: ${recipients.join(", ")}, subject: ${subject}`);

    // Initialize AWS SES client
    const sesClient = new SESClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
      },
    });

    // Create and send the email
    const sendEmailCommand = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
          ...(text && {
            Text: {
              Data: text,
              Charset: "UTF-8",
            },
          }),
        },
      },
    });

    const response = await sesClient.send(sendEmailCommand);
    console.log("SES Response:", response);

    const messageId = response.MessageId || null;

    // Log the email
    if (sentByUserId) {
      const logData = {
        sent_by: sentByUserId,
        recipients: recipients,
        subject: subject,
        content: html,
        template_used: templateUsed || null,
        status: 'sent',
        message_id: messageId,
        error_message: null,
      };

      const { error: logError } = await supabase
        .from('email_logs')
        .insert([logData]);

      if (logError) {
        console.error("Failed to log email:", logError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, messageId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-ses-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
