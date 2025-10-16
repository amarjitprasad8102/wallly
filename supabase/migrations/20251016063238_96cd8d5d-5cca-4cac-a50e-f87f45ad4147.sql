-- Add age column to profiles table for age verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add check constraint to ensure age is 16 or above using a trigger
CREATE OR REPLACE FUNCTION check_age_requirement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age IS NOT NULL AND NEW.age < 16 THEN
    RAISE EXCEPTION 'Age must be 16 or above';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_age_requirement
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION check_age_requirement();