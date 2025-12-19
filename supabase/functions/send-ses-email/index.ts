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

interface EmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
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
    console.log(`Sending emails to ${recipients.length} recipient(s) individually`);

    // Initialize AWS client
    const aws = new AwsClient({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });

    const endpoint = `https://email.${region}.amazonaws.com/`;
    const results: EmailResult[] = [];

    // Send emails one by one to each recipient
    for (const recipient of recipients) {
      try {
        console.log(`Sending email to: ${recipient}`);

        const params = new URLSearchParams();
        params.append("Action", "SendEmail");
        params.append("Version", "2010-12-01");
        params.append("Source", fromEmail);
        // Only ONE recipient per email - they won't see other recipients
        params.append("Destination.ToAddresses.member.1", recipient);
        params.append("Message.Subject.Data", subject);
        params.append("Message.Subject.Charset", "UTF-8");
        params.append("Message.Body.Html.Data", html);
        params.append("Message.Body.Html.Charset", "UTF-8");

        if (text) {
          params.append("Message.Body.Text.Data", text);
          params.append("Message.Body.Text.Charset", "UTF-8");
        }

        const response = await aws.fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const responseText = await response.text();
        console.log(`SES Response for ${recipient}: status ${response.status}`);

        if (!response.ok) {
          console.error(`Failed to send to ${recipient}:`, responseText);
          results.push({
            email: recipient,
            success: false,
            error: responseText,
          });

          // Log failed email individually
          if (sentByUserId) {
            await supabase.from('email_logs').insert([{
              sent_by: sentByUserId,
              recipients: [recipient],
              subject: subject,
              content: html,
              template_used: templateUsed || null,
              status: 'failed',
              message_id: null,
              error_message: responseText,
            }]);
          }
        } else {
          // Extract MessageId from response
          const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
          const messageId = messageIdMatch ? messageIdMatch[1] : null;

          console.log(`Email sent successfully to ${recipient}, messageId: ${messageId}`);
          results.push({
            email: recipient,
            success: true,
            messageId: messageId || undefined,
          });

          // Log successful email individually
          if (sentByUserId) {
            await supabase.from('email_logs').insert([{
              sent_by: sentByUserId,
              recipients: [recipient],
              subject: subject,
              content: html,
              template_used: templateUsed || null,
              status: 'sent',
              message_id: messageId,
              error_message: null,
            }]);
          }
        }

        // Small delay between emails to avoid rate limiting
        if (recipients.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (emailError: any) {
        console.error(`Error sending to ${recipient}:`, emailError.message);
        results.push({
          email: recipient,
          success: false,
          error: emailError.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Bulk email complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: failCount === 0, 
        totalSent: successCount,
        totalFailed: failCount,
        results: results,
      }),
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
