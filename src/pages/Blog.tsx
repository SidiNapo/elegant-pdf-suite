import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import BlogCard from '@/components/blog/BlogCard';
import { usePublishedPosts, useCategories } from '@/hooks/useBlogPosts';
import { BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';

// Skeleton component for loading state
const BlogCardSkeleton = () => (
  <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-muted" />
    <div className="p-6 space-y-3">
      <div className="h-5 w-20 bg-muted rounded-full" />
      <div className="h-6 w-full bg-muted rounded" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="flex gap-4 pt-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-12 bg-muted rounded" />
      </div>
    </div>
  </div>
);

const Blog = () => {
  const { t } = useTranslation();
  const { data: posts, isLoading } = usePublishedPosts();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return selectedCategory
      ? posts.filter((post) => post.category_id === selectedCategory)
      : posts;
  }, [posts, selectedCategory]);

  return (
    <>
      <SEOHead
        title={t('blog.seo.title')}
        description={t('blog.seo.description')}
        keywords={t('blog.seo.keywords')}
        canonicalUrl="https://e-pdfs.com/blog"
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Hero Section - No animations for speed */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t('blog.title')} & {t('footer.resources')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{t('blog.title')}</span> PDF
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('blog.subtitle')}
              </p>
            </div>

            {/* Categories Filter */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary text-primary-foreground'
                      : 'glass-card hover:bg-muted'
                  }`}
                >
                  {t('blog.allCategories')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card hover:bg-muted'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* Posts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt || ''}
                    featuredImage={post.featured_image || undefined}
                    authorName={post.author_name}
                    publishedAt={post.published_at || post.created_at}
                    viewsCount={post.views_count}
                    categoryName={post.category?.name}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('blog.noPostsFound')}</h2>
                <p className="text-muted-foreground">
                  {t('blog.loading')}
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
