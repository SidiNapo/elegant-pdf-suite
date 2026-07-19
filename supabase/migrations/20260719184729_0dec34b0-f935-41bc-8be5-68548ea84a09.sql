
-- Contact message status enum
DO $$ BEGIN
  CREATE TYPE public.contact_status AS ENUM ('new', 'read', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status public.contact_status NOT NULL DEFAULT 'new',
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Grants (admin reads via authenticated role + has_role check; writes via service_role)
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- 3. RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies (admins only from client; edge function uses service_role bypass)
DROP POLICY IF EXISTS "Admins can view messages" ON public.contact_messages;
CREATE POLICY "Admins can view messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_messages;
CREATE POLICY "Admins can delete messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. updated_at trigger
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages (status);
CREATE INDEX IF NOT EXISTS contact_messages_ip_hash_idx ON public.contact_messages (ip_hash, created_at DESC);
