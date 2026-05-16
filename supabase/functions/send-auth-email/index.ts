import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";
import { EmailTemplates, getPlainTextVersion } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailPayload {
  user: {
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!accessKeyId || !secretAccessKey || !fromEmail) {
      console.error("AWS SES credentials not configured");
      throw new Error("AWS SES credentials not configured");
    }

    // Verify Supabase Auth webhook secret (Standard Webhooks format)
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    const rawBody = await req.text();
    if (hookSecret) {
      const wh_id = req.headers.get("webhook-id");
      const wh_timestamp = req.headers.get("webhook-timestamp");
      const wh_signature = req.headers.get("webhook-signature");
      if (!wh_id || !wh_timestamp || !wh_signature) {
        return new Response(JSON.stringify({ error: "Missing webhook signature" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const secretBytes = Uint8Array.from(atob(hookSecret.replace(/^v1,whsec_/, "").replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
      const toSign = `${wh_id}.${wh_timestamp}.${rawBody}`;
      const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(toSign));
      const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
      const provided = wh_signature.split(" ").map(s => s.split(",")[1]).filter(Boolean);
      if (!provided.includes(expected)) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else {
      console.warn("SEND_EMAIL_HOOK_SECRET not set — webhook signature verification disabled");
    }

    const payload: AuthEmailPayload = JSON.parse(rawBody);
    const { user, email_data } = payload;

    // Validate email_action_type strictly
    const allowedActions = ["signup", "email_change", "recovery", "reset_password", "magic_link", "invite"];
    if (!allowedActions.includes(email_data.email_action_type)) {
      return new Response(JSON.stringify({ error: "Invalid email_action_type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Processing auth email for: ${user.email}, type: ${email_data.email_action_type}`);

    // Build the action URL
    const actionUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    let html: string;
    let subject: string;

    const templateParams = {
      userName: user.user_metadata?.name,
      userEmail: user.email,
      actionUrl,
      token: email_data.token,
      siteUrl: email_data.site_url || "https://wallly.corevia.in",
    };

    // Select template based on email type
    switch (email_data.email_action_type) {
      case "signup":
      case "email_change":
        html = EmailTemplates.emailVerification(templateParams);
        subject = "🔐 Verify your email for Wallly";
        break;
      case "recovery":
      case "reset_password":
        html = EmailTemplates.passwordReset(templateParams);
        subject = "🔑 Reset your Wallly password";
        break;
      case "magic_link":
        html = EmailTemplates.emailVerification({
          ...templateParams,
          actionUrl,
        });
        subject = "🔗 Your Wallly magic link";
        break;
      case "invite":
        html = EmailTemplates.welcome(templateParams);
        subject = "🎉 You're invited to Wallly!";
        break;
      default:
        html = EmailTemplates.emailVerification(templateParams);
        subject = "Wallly - Action Required";
    }

    const aws = new AwsClient({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });

    const params = new URLSearchParams();
    params.append("Action", "SendEmail");
    params.append("Version", "2010-12-01");
    params.append("Source", fromEmail);
    params.append("Destination.ToAddresses.member.1", user.email);
    params.append("Message.Subject.Data", subject);
    params.append("Message.Subject.Charset", "UTF-8");
    params.append("Message.Body.Html.Data", html);
    params.append("Message.Body.Html.Charset", "UTF-8");
    params.append("Message.Body.Text.Data", getPlainTextVersion(html));
    params.append("Message.Body.Text.Charset", "UTF-8");

    const endpoint = `https://email.${region}.amazonaws.com/`;

    console.log("Sending auth email via AWS SES...");

    const response = await aws.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    console.log("SES Response status:", response.status);

    if (!response.ok) {
      console.error("SES Error:", responseText);
      throw new Error(`SES Error: ${responseText}`);
    }

    console.log("Auth email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
