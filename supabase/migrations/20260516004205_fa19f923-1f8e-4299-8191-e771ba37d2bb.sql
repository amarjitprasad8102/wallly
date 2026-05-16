
-- 1. Lock down profiles: drop broad SELECT, keep own-profile only. Expose non-email columns via a view.
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, name, unique_id, age, gender, is_premium, premium_until, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- 2. Drop broad realtime SELECT policy on messages (own-row policy still applies)
DROP POLICY IF EXISTS "Authenticated can receive realtime broadcasts" ON public.messages;
