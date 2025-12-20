-- Drop the problematic RLS policy that references auth.users
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;

-- Create a new policy that doesn't reference auth.users directly
CREATE POLICY "Users can view their own leads by user_id" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() = user_id
);

-- Also add a policy for leads created before we added user_id (email match via profile)
CREATE POLICY "Users can view their leads by email match" 
ON public.leads 
FOR SELECT 
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);