-- Fix search_path for auto_cleanup_queue trigger function
CREATE OR REPLACE FUNCTION public.auto_cleanup_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Clean up stale entries whenever someone joins
  PERFORM public.cleanup_stale_queue_entries();
  RETURN NEW;
END;
$$;