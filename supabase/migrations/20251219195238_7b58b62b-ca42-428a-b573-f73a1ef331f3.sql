-- Create email_logs table to track sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_by UUID NOT NULL,
  recipients TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_used TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view email logs
CREATE POLICY "Admins can view email logs"
ON public.email_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert email logs
CREATE POLICY "Admins can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));