-- Fix security vulnerability in create_bidirectional_connection RPC function
-- Add authorization check to ensure caller is one of the users being connected

CREATE OR REPLACE FUNCTION public.create_bidirectional_connection(
  user_a_id uuid,
  user_b_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY: Verify caller is one of the users being connected
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  IF auth.uid() NOT IN (user_a_id, user_b_id) THEN
    RAISE EXCEPTION 'Unauthorized: Can only create connections for yourself';
  END IF;

  -- Insert connection from user_a to user_b (if not exists)
  INSERT INTO public.connections (user_id, connected_user_id)
  VALUES (user_a_id, user_b_id)
  ON CONFLICT DO NOTHING;
  
  -- Insert connection from user_b to user_a (if not exists)
  INSERT INTO public.connections (user_id, connected_user_id)
  VALUES (user_b_id, user_a_id)
  ON CONFLICT DO NOTHING;
END;
$$;