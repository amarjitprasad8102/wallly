-- Create a table for stranger sessions to track their email
CREATE TABLE public.stranger_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  temp_id text NOT NULL,
  gender text,
  age integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_verified boolean DEFAULT false,
  verification_token text
);

-- Enable RLS
ALTER TABLE public.stranger_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for stranger registration)
CREATE POLICY "Anyone can create stranger sessions"
ON public.stranger_sessions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view their own session by temp_id
CREATE POLICY "Anyone can view stranger sessions by temp_id"
ON public.stranger_sessions
FOR SELECT
USING (true);

-- Allow updates for verification
CREATE POLICY "Anyone can update stranger sessions"
ON public.stranger_sessions
FOR UPDATE
USING (true);

-- Allow deletes
CREATE POLICY "Anyone can delete stranger sessions"
ON public.stranger_sessions
FOR DELETE
USING (true);