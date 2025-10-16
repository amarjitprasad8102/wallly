-- Fix: Set search_path for check_age_requirement function to prevent security issues
DROP FUNCTION IF EXISTS check_age_requirement() CASCADE;

CREATE OR REPLACE FUNCTION check_age_requirement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age IS NOT NULL AND NEW.age < 16 THEN
    RAISE EXCEPTION 'Age must be 16 or above';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER enforce_age_requirement
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION check_age_requirement();