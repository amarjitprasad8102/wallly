-- Create a function to handle bidirectional connection creation
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
  -- Insert or update connection for user A
  INSERT INTO public.connections (user_id, connected_user_id, last_message_at)
  VALUES (user_a_id, user_b_id, now())
  ON CONFLICT (user_id, connected_user_id) 
  DO UPDATE SET last_message_at = now();
  
  -- Insert or update connection for user B
  INSERT INTO public.connections (user_id, connected_user_id, last_message_at)
  VALUES (user_b_id, user_a_id, now())
  ON CONFLICT (user_id, connected_user_id) 
  DO UPDATE SET last_message_at = now();
END;
$$;