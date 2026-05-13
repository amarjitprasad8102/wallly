import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
import DOMPurify from "https://esm.sh/isomorphic-dompurify@2.16.0";

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

const ALLOWED_TAGS = ["h1","h2","h3","h4","p","a","strong","em","b","i","u","br","hr","ul","ol","li","div","span","img","table","thead","tbody","tr","td","th","blockquote","pre","code"];
const ALLOWED_ATTR = ["href","src","alt","title","style","class","width","height","target","rel"];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID")?.trim();
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")?.trim();
    const region = Deno.env.get("AWS_SES_REGION")?.trim() || "us-east-1";
    const fromEmail = Deno.env.get("SES_FROM_EMAIL")?.trim();

    if (!accessKeyId || !secretAccessKey || !fromEmail) {
      console.error("AWS SES credentials not configured");
      return new Response(
        JSON.stringify({ error: "Email service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate caller and require admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const sentByUserId = user.id;

    const { to, subject, html, text, templateUsed }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize HTML on the server before sending
    const safeHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });

    const recipients = Array.isArray(to) ? to : [to];

    const aws = new AwsClient({ accessKeyId, secretAccessKey });
    const endpoint = `https://email.${region}.amazonaws.com/`;
    const results: EmailResult[] = [];

    for (const recipient of recipients) {
      try {
        const params = new URLSearchParams();
        params.append("Action", "SendEmail");
        params.append("Version", "2010-12-01");
        params.append("Source", fromEmail);
        params.append("Destination.ToAddresses.member.1", recipient);
        params.append("Message.Subject.Data", subject);
        params.append("Message.Subject.Charset", "UTF-8");
        params.append("Message.Body.Html.Data", safeHtml);
        params.append("Message.Body.Html.Charset", "UTF-8");

        if (text) {
          params.append("Message.Body.Text.Data", text);
          params.append("Message.Body.Text.Charset", "UTF-8");
        }

        const response = await aws.fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });

        const responseText = await response.text();

        if (!response.ok) {
          console.error(`SES send failure for ${recipient}: status ${response.status}`, responseText);
          results.push({ email: recipient, success: false, error: "Send failed" });

          await supabase.from("email_logs").insert([{
            sent_by: sentByUserId,
            recipients: [recipient],
            subject,
            content: safeHtml,
            template_used: templateUsed || null,
            status: "failed",
            message_id: null,
            error_message: "Send failed",
          }]);
        } else {
          const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
          const messageId = messageIdMatch ? messageIdMatch[1] : null;

          results.push({ email: recipient, success: true, messageId: messageId || undefined });

          await supabase.from("email_logs").insert([{
            sent_by: sentByUserId,
            recipients: [recipient],
            subject,
            content: safeHtml,
            template_used: templateUsed || null,
            status: "sent",
            message_id: messageId,
            error_message: null,
          }]);
        }

        if (recipients.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (emailError: any) {
        console.error(`Error sending to ${recipient}:`, emailError?.message);
        results.push({ email: recipient, success: false, error: "Send failed" });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        totalSent: successCount,
        totalFailed: failCount,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-ses-email function:", error);
    return new Response(
      JSON.stringify({ error: "Operation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
