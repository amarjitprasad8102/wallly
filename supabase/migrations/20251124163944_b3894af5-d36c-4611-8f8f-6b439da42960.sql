-- Function to clean up stale matchmaking queue entries (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_stale_queue_entries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete entries older than 5 minutes
  DELETE FROM public.matchmaking_queue
  WHERE created_at < NOW() - INTERVAL '5 minutes'
    OR (status = 'matched' AND matched_at < NOW() - INTERVAL '10 minutes');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Add automatic cleanup on queue operations
CREATE OR REPLACE FUNCTION public.auto_cleanup_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up stale entries whenever someone joins
  PERFORM public.cleanup_stale_queue_entries();
  RETURN NEW;
END;
$$;

-- Create trigger for auto cleanup
DROP TRIGGER IF EXISTS trigger_auto_cleanup_queue ON public.matchmaking_queue;
CREATE TRIGGER trigger_auto_cleanup_queue
  BEFORE INSERT ON public.matchmaking_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_cleanup_queue();