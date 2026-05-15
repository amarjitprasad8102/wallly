import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLANS: Record<string, { amount: number; days: number }> = {
  Weekly: { amount: 99, days: 7 },
  Monthly: { amount: 299, days: 30 },
  Yearly: { amount: 1999, days: 365 },
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

    const { plan } = await req.json();
    const cfg = PLANS[plan];
    if (!cfg) return json({ error: "Invalid plan" }, 400);

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const auth = btoa(`${keyId}:${keySecret}`);

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: cfg.amount * 100,
        currency: "INR",
        receipt: `wallly_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { user_id: user.id, plan },
      }),
    });
    if (!orderRes.ok) {
      console.error("Razorpay order error", await orderRes.text());
      return json({ error: "Failed to create order" }, 500);
    }
    const order = await orderRes.json();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await admin.from("payments").insert({
      user_id: user.id,
      plan,
      amount_inr: cfg.amount,
      duration_days: cfg.days,
      razorpay_order_id: order.id,
      status: "created",
    });

    return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (e) {
    console.error(e);
    return json({ error: "Operation failed" }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
