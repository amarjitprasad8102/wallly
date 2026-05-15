import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: "Missing fields" }, 400);
    }

    const secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const expected = createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return json({ error: "Invalid signature" }, 400);
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!payment) return json({ error: "Order not found" }, 404);
    if (payment.status === "paid") return json({ ok: true, alreadyProcessed: true });

    await admin
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Extend premium_until
    const { data: profile } = await admin
      .from("profiles")
      .select("premium_until")
      .eq("id", user.id)
      .maybeSingle();

    const now = new Date();
    const base = profile?.premium_until && new Date(profile.premium_until) > now
      ? new Date(profile.premium_until)
      : now;
    const newUntil = new Date(base.getTime() + payment.duration_days * 86400000);

    await admin
      .from("profiles")
      .update({ is_premium: true, premium_until: newUntil.toISOString() })
      .eq("id", user.id);

    return json({ ok: true, premium_until: newUntil.toISOString(), plan: payment.plan });
  } catch (e) {
    console.error(e);
    return json({ error: "Verification failed" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
