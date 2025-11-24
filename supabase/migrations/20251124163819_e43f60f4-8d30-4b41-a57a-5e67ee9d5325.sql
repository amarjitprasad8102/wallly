-- Create interests table
CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_interests junction table
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interest_id)
);

-- Enable RLS
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- RLS policies for interests (public read)
CREATE POLICY "Anyone can view interests"
  ON public.interests FOR SELECT
  USING (true);

-- RLS policies for user_interests
CREATE POLICY "Users can view all user interests"
  ON public.user_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests"
  ON public.user_interests FOR DELETE
  USING (auth.uid() = user_id);

-- Insert default interests
INSERT INTO public.interests (name, icon) VALUES
  ('Gaming', '🎮'),
  ('Music', '🎵'),
  ('Sports', '⚽'),
  ('Movies', '🎬'),
  ('Travel', '✈️'),
  ('Food', '🍕'),
  ('Art', '🎨'),
  ('Technology', '💻'),
  ('Books', '📚'),
  ('Fitness', '💪'),
  ('Photography', '📷'),
  ('Cooking', '👨‍🍳'),
  ('Fashion', '👗'),
  ('Pets', '🐶'),
  ('Nature', '🌲')
ON CONFLICT (name) DO NOTHING;

-- Function to find match with interest-based scoring
CREATE OR REPLACE FUNCTION public.find_match_with_interests(p_user_id UUID, p_unique_id TEXT)
RETURNS TABLE (matched_user_id UUID, matched_unique_id TEXT, shared_interests INTEGER) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_record RECORD;
  v_user_interests UUID[];
BEGIN
  -- Get current user's interests
  SELECT ARRAY_AGG(interest_id) INTO v_user_interests
  FROM public.user_interests
  WHERE user_id = p_user_id;

  -- Insert current user into queue
  INSERT INTO public.matchmaking_queue (user_id, unique_id, status)
  VALUES (p_user_id, p_unique_id, 'searching')
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'searching',
    created_at = NOW(),
    matched_with_user_id = NULL,
    matched_with_unique_id = NULL,
    matched_at = NULL;

  -- Find best matching partner based on shared interests
  WITH potential_matches AS (
    SELECT 
      mq.user_id,
      mq.unique_id,
      mq.id,
      mq.created_at,
      COUNT(ui.interest_id) AS shared_count
    FROM public.matchmaking_queue mq
    LEFT JOIN public.user_interests ui ON ui.user_id = mq.user_id
    WHERE mq.status = 'searching' 
      AND mq.user_id != p_user_id
      AND (v_user_interests IS NULL OR ui.interest_id = ANY(v_user_interests))
    GROUP BY mq.user_id, mq.unique_id, mq.id, mq.created_at
  )
  SELECT pm.user_id, pm.unique_id, pm.id, COALESCE(pm.shared_count, 0) as shared_count
  INTO v_partner_record
  FROM potential_matches pm
  ORDER BY pm.shared_count DESC, pm.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If no match with shared interests, try any available user
  IF v_partner_record.user_id IS NULL THEN
    SELECT mq.user_id, mq.unique_id, mq.id, 0 as shared_count
    INTO v_partner_record
    FROM public.matchmaking_queue mq
    WHERE mq.status = 'searching' 
      AND mq.user_id != p_user_id
    ORDER BY mq.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
  END IF;

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
    WHERE user_id = p_user_id;

    -- Return the match with shared interests count
    RETURN QUERY SELECT v_partner_record.user_id, v_partner_record.unique_id::TEXT, v_partner_record.shared_count;
  ELSE
    -- No match found yet
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 0::INTEGER;
  END IF;
END;
$$;

-- Add unique constraint to prevent duplicate queue entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_matchmaking_queue_user_id_unique ON public.matchmaking_queue(user_id) WHERE status = 'searching';