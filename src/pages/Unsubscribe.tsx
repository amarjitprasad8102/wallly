import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
      headers: { apikey: anon },
    })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (j?.valid) setState("valid");
        else if (j?.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    setBusy(false);
    if (error) setState("error");
    else if ((data as any)?.success) setState("success");
    else if ((data as any)?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <>
      <Helmet>
        <title>Unsubscribe — Wallly</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          {state === "loading" && (<><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p>Checking your unsubscribe link…</p></>)}
          {state === "valid" && (<>
            <h1 className="text-2xl font-bold">Unsubscribe from Wallly emails</h1>
            <p className="text-muted-foreground">Click below to stop receiving app emails from Wallly.</p>
            <Button onClick={confirm} disabled={busy} className="w-full">{busy ? "Processing…" : "Confirm Unsubscribe"}</Button>
          </>)}
          {state === "success" && (<><CheckCircle className="w-10 h-10 mx-auto text-green-600" /><h1 className="text-2xl font-bold">You're unsubscribed</h1><p className="text-muted-foreground">You won't receive further app emails from Wallly.</p></>)}
          {state === "already" && (<><CheckCircle className="w-10 h-10 mx-auto text-green-600" /><h1 className="text-2xl font-bold">Already unsubscribed</h1></>)}
          {(state === "invalid" || state === "error") && (<><AlertCircle className="w-10 h-10 mx-auto text-destructive" /><h1 className="text-2xl font-bold">Invalid link</h1><p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p></>)}
        </div>
      </div>
    </>
  );
};

export default Unsubscribe;
