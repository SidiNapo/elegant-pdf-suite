
-- 1. Lock down pdf-files bucket policies (bucket already toggled private)
DROP POLICY IF EXISTS "Public read access"   ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- 2. Restrict blog-images bucket to files under posts/*
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
CREATE POLICY "Public can read published blog images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog-images' AND name LIKE 'posts/%');

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND name LIKE 'posts/%'
  AND public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND name LIKE 'posts/%'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'blog-images'
  AND name LIKE 'posts/%'
  AND public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND name LIKE 'posts/%'
  AND public.has_role(auth.uid(), 'admin')
);

-- 3. Post-view dedup table (server-only) + atomic recording function
CREATE TABLE IF NOT EXISTS public.post_views (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  visitor_hash char(64) NOT NULL,
  viewed_on    date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_views_hash_hex_chk CHECK (visitor_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT post_views_unique_daily UNIQUE (post_id, visitor_hash, viewed_on)
);

CREATE INDEX IF NOT EXISTS post_views_viewed_on_idx ON public.post_views (viewed_on);
CREATE INDEX IF NOT EXISTS post_views_post_id_idx   ON public.post_views (post_id);

REVOKE ALL ON public.post_views FROM PUBLIC, anon, authenticated;
GRANT  ALL ON public.post_views TO service_role;

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "no client access" ON public.post_views;
CREATE POLICY "no client access"
ON public.post_views
FOR SELECT
USING (false);

CREATE OR REPLACE FUNCTION public.record_post_view(_post_id uuid, _visitor_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inserted integer := 0;
  _clean_hash text := lower(coalesce(_visitor_hash, ''));
BEGIN
  IF _clean_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid visitor hash';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.blog_posts
    WHERE id = _post_id AND is_published = true
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.post_views (post_id, visitor_hash)
  VALUES (_post_id, _clean_hash)
  ON CONFLICT (post_id, visitor_hash, viewed_on) DO NOTHING;

  GET DIAGNOSTICS _inserted = ROW_COUNT;

  IF _inserted > 0 THEN
    UPDATE public.blog_posts SET views_count = views_count + 1 WHERE id = _post_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.record_post_view(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.record_post_view(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_old_post_views()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.post_views
  WHERE viewed_on < (now() AT TIME ZONE 'utc')::date - INTERVAL '90 days';
$$;
REVOKE ALL ON FUNCTION public.cleanup_old_post_views() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.cleanup_old_post_views() TO service_role;

-- 4. Lock down existing SECURITY DEFINER helpers so they aren't callable via Data API
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.increment_post_views(uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.increment_post_views(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
