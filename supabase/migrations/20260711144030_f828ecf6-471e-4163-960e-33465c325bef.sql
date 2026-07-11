-- Add language and featured image dimension columns to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS featured_image_width integer,
  ADD COLUMN IF NOT EXISTS featured_image_height integer;

-- Constrain language to allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_language_check'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_language_check
      CHECK (language IN ('fr', 'en', 'ar'));
  END IF;
END $$;

-- Backfill: default featured image dimensions when a featured image exists but dims are unknown
UPDATE public.blog_posts
SET featured_image_width = 1200
WHERE featured_image IS NOT NULL AND featured_image <> '' AND featured_image_width IS NULL;

UPDATE public.blog_posts
SET featured_image_height = 630
WHERE featured_image IS NOT NULL AND featured_image <> '' AND featured_image_height IS NULL;

-- Backfill missing featured_image_alt with the article title
UPDATE public.blog_posts
SET featured_image_alt = title
WHERE featured_image IS NOT NULL AND featured_image <> ''
  AND (featured_image_alt IS NULL OR featured_image_alt = '');

-- Ensure slug uniqueness (prevents duplicate slugs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_slug_unique'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);
  END IF;
END $$;