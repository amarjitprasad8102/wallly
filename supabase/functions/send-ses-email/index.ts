import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

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
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID")?.trim();
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")?.trim();
    const region = Deno.env.get("AWS_SES_REGION")?.trim() || "us-east-1";
    const fromEmail = Deno.env.get("SES_FROM_EMAIL")?.trim();

    console.log("AWS Config - Region:", region);
    console.log("AWS Config - From Email:", fromEmail);
    console.log("AWS Config - Access Key ID length:", accessKeyId?.length || 0);
    console.log("AWS Config - Secret Key length:", secretAccessKey?.length || 0);

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

    // Initialize AWS client - service is inferred from the URL
    const aws = new AwsClient({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });

    // Build SES API request parameters
    const params = new URLSearchParams();
    params.append("Action", "SendEmail");
    params.append("Version", "2010-12-01");
    params.append("Source", fromEmail);
    
    recipients.forEach((recipient, index) => {
      params.append(`Destination.ToAddresses.member.${index + 1}`, recipient);
    });
    
    params.append("Message.Subject.Data", subject);
    params.append("Message.Subject.Charset", "UTF-8");
    params.append("Message.Body.Html.Data", html);
    params.append("Message.Body.Html.Charset", "UTF-8");
    
    if (text) {
      params.append("Message.Body.Text.Data", text);
      params.append("Message.Body.Text.Charset", "UTF-8");
    }

    const body = params.toString();
    const endpoint = `https://email.${region}.amazonaws.com/`;

    console.log("Sending request to AWS SES...");

    // Sign and send the request
    const response = await aws.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    });

    const responseText = await response.text();
    console.log("SES Response status:", response.status);
    console.log("SES Response:", responseText);

    if (!response.ok) {
      // Log the failed email
      if (sentByUserId) {
        await supabase.from('email_logs').insert([{
          sent_by: sentByUserId,
          recipients: recipients,
          subject: subject,
          content: html,
          template_used: templateUsed || null,
          status: 'failed',
          message_id: null,
          error_message: responseText,
        }]);
      }
      throw new Error(`SES Error: ${responseText}`);
    }

    // Extract MessageId from response
    const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : null;

    // Log the successful email
    if (sentByUserId) {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert([{
          sent_by: sentByUserId,
          recipients: recipients,
          subject: subject,
          content: html,
          template_used: templateUsed || null,
          status: 'sent',
          message_id: messageId,
          error_message: null,
        }]);

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
