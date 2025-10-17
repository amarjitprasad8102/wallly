-- Create connection_requests table
CREATE TABLE public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own connection requests (both sent and received)
CREATE POLICY "Users can view their connection requests"
ON public.connection_requests
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can insert connection requests
CREATE POLICY "Users can send connection requests"
ON public.connection_requests
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Users can update connection requests they received
CREATE POLICY "Users can update received connection requests"
ON public.connection_requests
FOR UPDATE
USING (auth.uid() = to_user_id);

-- Enable realtime for connection_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_requests;