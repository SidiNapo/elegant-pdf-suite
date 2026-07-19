-- Clear any stored canonical_url values. The public site now derives
-- canonicals purely from the article slug and ignores this column at render
-- time, so keeping stale values around only creates drift. The column stays
-- in place for backward compatibility with existing types and inserts.
UPDATE public.blog_posts
SET canonical_url = NULL
WHERE canonical_url IS NOT NULL;