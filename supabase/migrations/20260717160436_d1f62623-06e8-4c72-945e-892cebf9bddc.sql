CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.heartbeat_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pinged_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.heartbeat_log TO service_role;
ALTER TABLE public.heartbeat_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no client access" ON public.heartbeat_log FOR SELECT USING (false);