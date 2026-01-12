import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import BlogCard from '@/components/blog/BlogCard';
import { usePublishedPosts, useCategories } from '@/hooks/useBlogPosts';
import { Loader2, BookOpen } from 'lucide-react';
import { useState } from 'react';

// Import images
import heroPdf from '@/assets/hero-pdf.jpg';

const Blog = () => {
  const { t } = useTranslation();
  const { data: posts, isLoading } = usePublishedPosts();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? posts?.filter((post) => post.category_id === selectedCategory)
    : posts;

  return (
    <>
      <SEOHead
        title="Blog E-Pdf's - Conseils et Tutoriels PDF"
        description="Découvrez nos articles, guides et tutoriels sur la manipulation de fichiers PDF. Apprenez à fusionner, diviser, compresser et convertir vos documents."
        keywords="blog PDF, tutoriels PDF, guides PDF, astuces PDF, conseils PDF"
        canonicalUrl="https://e-pdfs.com/blog"
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          {/* Hero Background */}
          <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden -z-10">
            <img src={heroPdf} alt="Blog E-PDF's - Guides et tutoriels PDF" className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
          </div>
          
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t('blog.title')} & {t('footer.resources')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">{t('blog.title')}</span> PDF
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('blog.subtitle')}
              </p>
            </motion.div>

            {/* Categories Filter */}
            {categories && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
              >
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card hover:bg-muted'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Posts Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('blog.noPostsFound')}</h2>
                <p className="text-muted-foreground">
                  {t('blog.loading')}
                </p>
              </motion.div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
