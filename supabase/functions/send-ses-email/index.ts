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

// SHA-256 hash function using Web Crypto API
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// HMAC-SHA256 using Web Crypto API
async function hmacSha256(key: BufferSource, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const encoder = new TextEncoder();
  return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const kDate = await hmacSha256(encoder.encode("AWS4" + key), dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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

    // Build SES API request
    const host = `email.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;
    const service = "ses";
    const method = "POST";

    // Build form data for SendEmail action
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
    const contentType = "application/x-www-form-urlencoded";

    // Create date strings
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "").substring(0, 15) + "Z";
    const dateStamp = amzDate.substring(0, 8);

    // Create canonical request
    const payloadHash = await sha256(body);
    
    const canonicalHeaders = 
      `content-type:${contentType}\n` +
      `host:${host}\n` +
      `x-amz-date:${amzDate}\n`;
    
    const signedHeaders = "content-type;host;x-amz-date";
    
    const canonicalRequest = 
      `${method}\n` +
      `/\n` +
      `\n` +
      `${canonicalHeaders}\n` +
      `${signedHeaders}\n` +
      `${payloadHash}`;

    // Create string to sign
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = await sha256(canonicalRequest);
    
    const stringToSign = 
      `${algorithm}\n` +
      `${amzDate}\n` +
      `${credentialScope}\n` +
      `${canonicalRequestHash}`;

    // Calculate signature
    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signatureBuffer = await hmacSha256(signingKey, stringToSign);
    const signature = toHex(signatureBuffer);

    // Create authorization header
    const authorizationHeader = 
      `${algorithm} ` +
      `Credential=${accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, ` +
      `Signature=${signature}`;

    console.log("Sending request to AWS SES...");

    // Make the request
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": contentType,
        "Host": host,
        "X-Amz-Date": amzDate,
        "Authorization": authorizationHeader,
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
