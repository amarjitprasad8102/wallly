
CREATE TABLE IF NOT EXISTS public.email_blasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_recipients INTEGER NOT NULL DEFAULT 0,
  triggered_by TEXT NOT NULL DEFAULT 'cron'
);

CREATE TABLE IF NOT EXISTS public.email_blast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blast_id UUID NOT NULL REFERENCES public.email_blasts(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  tracking_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  open_count INTEGER NOT NULL DEFAULT 0,
  send_status TEXT NOT NULL DEFAULT 'pending',
  send_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ebr_blast ON public.email_blast_recipients(blast_id);
CREATE INDEX IF NOT EXISTS idx_ebr_token ON public.email_blast_recipients(tracking_token);

ALTER TABLE public.email_blasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_blast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email_blasts" ON public.email_blasts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert email_blasts" ON public.email_blasts
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view recipients" ON public.email_blast_recipients
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert recipients" ON public.email_blast_recipients
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
