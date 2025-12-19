import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Create the SES API request
    const endpoint = `https://email.${region}.amazonaws.com/`;
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);

    // Build the request body for SendEmail action
    const params = new URLSearchParams();
    params.append("Action", "SendEmail");
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
    
    params.append("Version", "2010-12-01");

    const body = params.toString();
    const host = `email.${region}.amazonaws.com`;

    // Create canonical request
    const method = "POST";
    const canonicalUri = "/";
    const canonicalQuerystring = "";
    const contentType = "application/x-www-form-urlencoded";
    
    const payloadHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(body)
    );
    const payloadHashHex = Array.from(new Uint8Array(payloadHash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const canonicalHeaders = 
      `content-type:${contentType}\n` +
      `host:${host}\n` +
      `x-amz-date:${amzDate}\n`;
    
    const signedHeaders = "content-type;host;x-amz-date";

    const canonicalRequest = 
      `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHashHex}`;

    // Create string to sign
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/ses/aws4_request`;
    
    const canonicalRequestHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonicalRequest)
    );
    const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const stringToSign = 
      `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

    // Calculate signature
    const getSignatureKey = async (
      key: string,
      dateStamp: string,
      regionName: string,
      serviceName: string
    ) => {
      const enc = new TextEncoder();
      const kDate = await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
          "raw",
          enc.encode(`AWS4${key}`),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        ),
        enc.encode(dateStamp)
      );
      const kRegion = await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
          "raw",
          new Uint8Array(kDate),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        ),
        enc.encode(regionName)
      );
      const kService = await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
          "raw",
          new Uint8Array(kRegion),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        ),
        enc.encode(serviceName)
      );
      const kSigning = await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
          "raw",
          new Uint8Array(kService),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        ),
        enc.encode("aws4_request")
      );
      return new Uint8Array(kSigning);
    };

    const signingKey = await getSignatureKey(
      secretAccessKey,
      dateStamp,
      region,
      "ses"
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        signingKey,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      new TextEncoder().encode(stringToSign)
    );
    
    const signatureHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const authorizationHeader = 
      `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

    // Send the request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "Host": host,
        "X-Amz-Date": amzDate,
        "Authorization": authorizationHeader,
      },
      body: body,
    });

    const responseText = await response.text();
    console.log("SES Response:", response.status, responseText);

    // Parse message ID from response
    const messageIdMatch = responseText.match(/<MessageId>(.+?)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : null;

    // Log the email
    if (sentByUserId) {
      const logData = {
        sent_by: sentByUserId,
        recipients: recipients,
        subject: subject,
        content: html,
        template_used: templateUsed || null,
        status: response.ok ? 'sent' : 'failed',
        message_id: messageId,
        error_message: response.ok ? null : responseText,
      };

      const { error: logError } = await supabase
        .from('email_logs')
        .insert([logData]);

      if (logError) {
        console.error("Failed to log email:", logError);
      }
    }

    if (!response.ok) {
      throw new Error(`SES Error: ${responseText}`);
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
