import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { pingIndexNow } from '@/lib/indexnow';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  featured_image_width: number | null;
  featured_image_height: number | null;
  author_name: string;
  language: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  canonical_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  category_id: string | null;
  category?: BlogCategory;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

// Lightweight post type for list views (no content field)
export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string;
  published_at: string | null;
  created_at: string;
  views_count: number;
  category_id: string | null;
  category?: BlogCategory;
}

// Fetch all published posts (public) - OPTIMIZED: only select needed fields
export const usePublishedPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          slug,
          title,
          excerpt,
          featured_image,
          author_name,
          published_at,
          created_at,
          views_count,
          category_id,
          category:blog_categories(id, name, slug)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as BlogPostSummary[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
};

// Fetch single post by slug (public)
export const usePostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Record a deduplicated view via the server-only edge function.
      // Fire-and-forget: never block the reader on analytics.
      try {
        void supabase.functions.invoke('record-view', { body: { post_id: data.id } });
      } catch { /* ignore view-count failures */ }

      
      
      return data as BlogPost;
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: false, // Missing slug should surface immediately as 404
  });
};

// Fetch all posts (admin)
export const useAllPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

// Fetch single post by ID (admin)
export const usePostById = (id: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });
};

// Fetch all categories - OPTIMIZED with caching
export const useCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      return data as BlogCategory[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'category'>) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      // Notify search engines only for published posts.
      if (data?.is_published && data?.slug) {
        pingIndexNow([`/blog/${data.slug}`, '/blog', '/sitemap.xml']);
      }
    },
  });
};

// Update post mutation
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<BlogPost> & { id: string }) => {
      // Snapshot the previous slug/published state so we can notify search
      // engines for BOTH the old and new URLs (handles slug renames and
      // unpublish transitions).
      const { data: previous } = await supabase
        .from('blog_posts')
        .select('slug,is_published')
        .eq('id', id)
        .maybeSingle();
      const { category, ...post } = rest;
      const { data, error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, previous };
    },
    onSuccess: ({ data, previous }) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      const urls = new Set<string>(['/blog', '/sitemap.xml']);
      if (previous?.slug) urls.add(`/blog/${previous.slug}`);
      if (data?.slug) urls.add(`/blog/${data.slug}`);
      pingIndexNow(Array.from(urls));
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Capture the slug BEFORE delete so we can still notify IndexNow.
      const { data: previous } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('id', id)
        .maybeSingle();
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return previous;
    },
    onSuccess: (previous) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      const urls: string[] = ['/blog', '/sitemap.xml'];
      if (previous?.slug) urls.push(`/blog/${previous.slug}`);
      pingIndexNow(urls);
    },
  });
};
