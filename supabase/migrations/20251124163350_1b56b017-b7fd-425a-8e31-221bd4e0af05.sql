-- Create matchmaking queue table
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unique_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'searching',
  matched_with_user_id UUID,
  matched_with_unique_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matched_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_matchmaking_queue_status ON public.matchmaking_queue(status);
CREATE INDEX idx_matchmaking_queue_created_at ON public.matchmaking_queue(created_at);
CREATE INDEX idx_matchmaking_queue_user_id ON public.matchmaking_queue(user_id);

-- Enable RLS
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own queue entries"
  ON public.matchmaking_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue entries"
  ON public.matchmaking_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue entries"
  ON public.matchmaking_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue entries"
  ON public.matchmaking_queue FOR DELETE
  USING (auth.uid() = user_id);

-- Function to atomically match users
CREATE OR REPLACE FUNCTION public.find_match(p_user_id UUID, p_unique_id TEXT)
RETURNS TABLE (matched_user_id UUID, matched_unique_id TEXT) AS $$
DECLARE
  v_partner_record RECORD;
BEGIN
  -- First, insert current user into queue
  INSERT INTO public.matchmaking_queue (user_id, unique_id, status)
  VALUES (p_user_id, p_unique_id, 'searching')
  ON CONFLICT DO NOTHING;

  -- Find an available partner (oldest searching user that's not the current user)
  SELECT mq.user_id, mq.unique_id, mq.id
  INTO v_partner_record
  FROM public.matchmaking_queue mq
  WHERE mq.status = 'searching' 
    AND mq.user_id != p_user_id
  ORDER BY mq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If we found a partner, match them
  IF v_partner_record.user_id IS NOT NULL THEN
    -- Update partner's record
    UPDATE public.matchmaking_queue
    SET status = 'matched',
        matched_with_user_id = p_user_id,
        matched_with_unique_id = p_unique_id,
        matched_at = NOW()
    WHERE id = v_partner_record.id;

    -- Update current user's record
    UPDATE public.matchmaking_queue
    SET status = 'matched',
        matched_with_user_id = v_partner_record.user_id,
        matched_with_unique_id = v_partner_record.unique_id,
        matched_at = NOW()
    WHERE user_id = p_user_id AND status = 'searching';

    -- Return the match
    RETURN QUERY SELECT v_partner_record.user_id, v_partner_record.unique_id::TEXT;
  ELSE
    -- No match found yet
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get queue count
CREATE OR REPLACE FUNCTION public.get_queue_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.matchmaking_queue WHERE status = 'searching');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for matchmaking_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;