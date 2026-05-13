import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SUBJECT = "👋 A friendly check-in from Wallly";
const DEFAULT_BODY = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:22px;margin:0 0 12px">Where the walls end, you find a friend.</h1>
    <p style="font-size:15px;line-height:1.6;color:#444">
      Hey there 👋 — just a little nudge from <strong>Wallly</strong>. Someone new is waiting on the other side of a wall right now. Hop back in and say hi.
    </p>
    <p style="margin:24px 0">
      <a href="https://wallly.in" style="background:#6d28d9;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">Open Wallly</a>
    </p>
    <p style="font-size:12px;color:#888;margin-top:32px">You're getting this because you have a Wallly account.</p>
  </div>
`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID")?.trim();
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")?.trim();
    const region = Deno.env.get("AWS_SES_REGION")?.trim() || "us-east-1";
    const fromEmail = Deno.env.get("SES_FROM_EMAIL")?.trim();
    if (!accessKeyId || !secretAccessKey || !fromEmail) {
      throw new Error("AWS SES credentials not configured");
    }

    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const subject: string = body.subject || DEFAULT_SUBJECT;
    const bodyHtml: string = body.bodyHtml || DEFAULT_BODY;
    const triggeredBy: string = body.triggeredBy || "cron";

    // Verify admin caller if not cron
    if (triggeredBy !== "cron") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!roleRow) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Fetch all profiles with email
    const { data: profiles, error: pErr } = await supabase.from("profiles").select("id, email").not("email", "is", null);
    if (pErr) throw pErr;
    const recipients = (profiles || []).filter(p => p.email);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ success: true, totalSent: 0, message: "No recipients" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create blast row
    const { data: blast, error: bErr } = await supabase.from("email_blasts").insert({
      subject, body_html: bodyHtml, total_recipients: recipients.length, triggered_by: triggeredBy,
    }).select().single();
    if (bErr) throw bErr;

    // Insert recipient rows (tracking_token auto-generated)
    const recipientRows = recipients.map(r => ({ blast_id: blast.id, user_id: r.id, email: r.email }));
    const { data: insertedRecipients, error: rErr } = await supabase.from("email_blast_recipients").insert(recipientRows).select();
    if (rErr) throw rErr;

    const aws = new AwsClient({ accessKeyId, secretAccessKey });
    const endpoint = `https://email.${region}.amazonaws.com/`;
    const trackBaseUrl = `${supabaseUrl}/functions/v1/track-email-open`;
    let sent = 0, failed = 0;

    for (const rec of insertedRecipients!) {
      try {
        const pixel = `<img src="${trackBaseUrl}?t=${rec.tracking_token}" width="1" height="1" style="display:none" alt="" />`;
        const html = bodyHtml + pixel;

        const params = new URLSearchParams();
        params.append("Action", "SendEmail");
        params.append("Version", "2010-12-01");
        params.append("Source", fromEmail);
        params.append("Destination.ToAddresses.member.1", rec.email);
        params.append("Message.Subject.Data", subject);
        params.append("Message.Subject.Charset", "UTF-8");
        params.append("Message.Body.Html.Data", html);
        params.append("Message.Body.Html.Charset", "UTF-8");

        const response = await aws.fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
        const respText = await response.text();
        if (!response.ok) {
          failed++;
          await supabase.from("email_blast_recipients").update({ send_status: "failed", send_error: respText.slice(0, 500) }).eq("id", rec.id);
        } else {
          sent++;
          await supabase.from("email_blast_recipients").update({ send_status: "sent", sent_at: new Date().toISOString() }).eq("id", rec.id);
        }
        await new Promise(r => setTimeout(r, 100));
      } catch (e: any) {
        failed++;
        await supabase.from("email_blast_recipients").update({ send_status: "failed", send_error: String(e.message).slice(0, 500) }).eq("id", rec.id);
      }
    }

    return new Response(JSON.stringify({ success: true, blastId: blast.id, totalSent: sent, totalFailed: failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-bulk-blast error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
