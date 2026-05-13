
-- 1) Profiles: remove public-readable policy; require authentication
DROP POLICY IF EXISTS "Users can view other users' basic info" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) Storage: chat-images — drop overly permissive SELECT policy.
-- Signed URLs (issued via service role) continue to work; direct listing is
-- restricted to the owner via the existing "Users can read own chat images" policy.
DROP POLICY IF EXISTS "Users can view images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read chat images with signed URL" ON storage.objects;

-- 3) Set fixed search_path on remaining trigger functions
ALTER FUNCTION public.update_post_comment_count() SET search_path = public;
ALTER FUNCTION public.update_community_member_count() SET search_path = public;
ALTER FUNCTION public.update_community_post_count() SET search_path = public;

-- 4) Realtime channel authorization — restrict subscriptions to authenticated users only.
-- Without RLS on realtime.messages, any authenticated user could subscribe to any topic.
-- Enforce that only authenticated users may receive Realtime broadcasts; postgres_changes
-- events are still further filtered by each table's own RLS.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can receive realtime broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
