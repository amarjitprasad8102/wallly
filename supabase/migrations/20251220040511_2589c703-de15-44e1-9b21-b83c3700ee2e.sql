-- Create leads table for premium inquiries and contact forms
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  lead_type TEXT NOT NULL DEFAULT 'contact', -- 'premium' or 'contact'
  plan_interest TEXT, -- 'weekly', 'monthly', 'yearly' for premium leads
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'converted', 'closed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_messages table for admin-user chat
CREATE TABLE public.lead_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'admin' or 'user'
  sender_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_messages ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create leads"
ON public.leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own leads"
ON public.leads FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Lead messages policies
CREATE POLICY "Admins can view all lead messages"
ON public.lead_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert lead messages"
ON public.lead_messages FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND sender_type = 'admin');

-- Enable realtime for lead messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_messages;

-- Create index for faster lookups
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_lead_type ON public.leads(lead_type);
CREATE INDEX idx_lead_messages_lead_id ON public.lead_messages(lead_id);