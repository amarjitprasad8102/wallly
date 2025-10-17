-- Allow users to view other users' profiles (for connection purposes)
CREATE POLICY "Users can view other users' basic info"
ON public.profiles
FOR SELECT
USING (true);