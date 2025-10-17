-- Create connections table to track active connections between users
CREATE TABLE public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  connected_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections
CREATE POLICY "Users can view their connections"
ON public.connections
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert their connections"
ON public.connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their connections"
ON public.connections
FOR DELETE
USING (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their connections"
ON public.connections
FOR UPDATE
USING (auth.uid() = user_id);