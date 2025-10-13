-- Fix search_path for security
DROP FUNCTION IF EXISTS public.generate_unique_id();

CREATE OR REPLACE FUNCTION public.generate_unique_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 10-digit number
    new_id := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE unique_id = new_id) INTO id_exists;
    
    -- Exit loop if unique
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;