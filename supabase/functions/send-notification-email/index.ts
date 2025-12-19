import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
import { EmailTemplates, getPlainTextVersion, EmailTemplateParams } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 
  | "welcome"
  | "connection_request"
  | "connection_accepted"
  | "new_message"
  | "premium_upgrade"
  | "account_warning"
  | "community_join"
  | "newsletter";

interface NotificationRequest {
  type: NotificationType;
  recipientEmail: string;
  recipientUserId?: string;
  params?: EmailTemplateParams;
}

const templateMap: Record<NotificationType, keyof typeof EmailTemplates> = {
  welcome: "welcome",
  connection_request: "connectionRequest",
  connection_accepted: "connectionAccepted",
  new_message: "newMessage",
  premium_upgrade: "premiumUpgrade",
  account_warning: "accountWarning",
  community_join: "communityJoin",
  newsletter: "newsletter",
};

const subjectMap: Record<NotificationType, string> = {
  welcome: "🎉 Welcome to Wallly!",
  connection_request: "🤝 New Connection Request on Wallly",
  connection_accepted: "✅ Your Connection Request was Accepted!",
  new_message: "💬 You have a new message on Wallly",
  premium_upgrade: "⭐ Welcome to Wallly Premium!",
  account_warning: "⚠️ Important Notice About Your Account",
  community_join: "👥 Welcome to the Community!",
  newsletter: "📰 Wallly Weekly Update",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID")?.trim();
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")?.trim();
    const region = Deno.env.get("AWS_SES_REGION")?.trim() || "us-east-1";
    const fromEmail = Deno.env.get("SES_FROM_EMAIL")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!accessKeyId || !secretAccessKey || !fromEmail) {
      console.error("AWS SES credentials not configured");
      throw new Error("AWS SES credentials not configured");
    }

    // Get auth token to identify sender
    const authHeader = req.headers.get("authorization");
    const supabase = createClient(supabaseUrl, supabaseKey);

    let sentByUserId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      sentByUserId = user?.id || null;
    }

    const { type, recipientEmail, recipientUserId, params = {} }: NotificationRequest = await req.json();

    if (!type || !recipientEmail) {
      throw new Error("Missing required fields: type, recipientEmail");
    }

    // Get recipient's profile for personalization
    let recipientName = params.userName;
    if (recipientUserId && !recipientName) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", recipientUserId)
        .single();
      
      if (profile?.name) {
        recipientName = profile.name;
      }
    }

    const templateName = templateMap[type];
    if (!templateName) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const templateParams: EmailTemplateParams = {
      ...params,
      userName: recipientName,
      userEmail: recipientEmail,
      siteUrl: "https://wallly.corevia.in",
    };

    const html = EmailTemplates[templateName](templateParams);
    const subject = params.customMessage ? `Wallly: ${params.customMessage.substring(0, 50)}` : subjectMap[type];

    console.log(`Sending ${type} notification to: ${recipientEmail}`);

    const aws = new AwsClient({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });

    const sesParams = new URLSearchParams();
    sesParams.append("Action", "SendEmail");
    sesParams.append("Version", "2010-12-01");
    sesParams.append("Source", fromEmail);
    sesParams.append("Destination.ToAddresses.member.1", recipientEmail);
    sesParams.append("Message.Subject.Data", subject);
    sesParams.append("Message.Subject.Charset", "UTF-8");
    sesParams.append("Message.Body.Html.Data", html);
    sesParams.append("Message.Body.Html.Charset", "UTF-8");
    sesParams.append("Message.Body.Text.Data", getPlainTextVersion(html));
    sesParams.append("Message.Body.Text.Charset", "UTF-8");

    const endpoint = `https://email.${region}.amazonaws.com/`;

    const response = await aws.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sesParams.toString(),
    });

    const responseText = await response.text();
    console.log("SES Response status:", response.status);

    if (!response.ok) {
      // Log failed email
      if (sentByUserId) {
        await supabase.from("email_logs").insert([{
          sent_by: sentByUserId,
          recipients: [recipientEmail],
          subject: subject,
          content: html,
          template_used: type,
          status: "failed",
          error_message: responseText,
        }]);
      }
      throw new Error(`SES Error: ${responseText}`);
    }

    // Extract MessageId
    const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : null;

    // Log successful email
    if (sentByUserId) {
      await supabase.from("email_logs").insert([{
        sent_by: sentByUserId,
        recipients: [recipientEmail],
        subject: subject,
        content: html,
        template_used: type,
        status: "sent",
        message_id: messageId,
      }]);
    }

    console.log(`Notification email sent successfully: ${type}`);

    return new Response(
      JSON.stringify({ success: true, messageId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
