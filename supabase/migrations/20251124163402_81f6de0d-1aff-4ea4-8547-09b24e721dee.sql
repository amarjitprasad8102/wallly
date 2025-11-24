-- Fix search_path for security
CREATE OR REPLACE FUNCTION public.find_match(p_user_id UUID, p_unique_id TEXT)
RETURNS TABLE (matched_user_id UUID, matched_unique_id TEXT) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix search_path for get_queue_count
CREATE OR REPLACE FUNCTION public.get_queue_count()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.matchmaking_queue WHERE status = 'searching');
END;
$$;