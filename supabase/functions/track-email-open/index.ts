import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1x1 transparent GIF
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

const headers = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Access-Control-Allow-Origin": "*",
};

serve(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");
    if (token) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: rec } = await supabase
        .from("email_blast_recipients")
        .select("id, opened_at, open_count")
        .eq("tracking_token", token)
        .maybeSingle();
      if (rec) {
        await supabase
          .from("email_blast_recipients")
          .update({
            opened_at: rec.opened_at || new Date().toISOString(),
            open_count: (rec.open_count || 0) + 1,
          })
          .eq("id", rec.id);
      }
    }
  } catch (e) {
    console.error("track-email-open error:", e);
  }
  return new Response(PIXEL, { headers });
});
