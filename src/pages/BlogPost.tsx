import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Eye, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ArticleSchema from '@/components/blog/ArticleSchema';
import { usePostBySlug } from '@/hooks/useBlogPosts';
import { Loader2 } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePostBySlug(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              L'article que vous cherchez n'existe pas ou a été supprimé.
            </p>
            <Link to="/blog" className="btn-primary inline-block">
              Retour au blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const canonicalUrl = `https://e-pdfs.com/blog/${post.slug}`;

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || ''}
        keywords={post.meta_keywords || undefined}
        canonicalUrl={post.canonical_url || canonicalUrl}
        ogImage={post.og_image || post.featured_image || undefined}
        ogType="article"
        author={post.author_name}
        publishedTime={post.published_at || undefined}
        modifiedTime={post.updated_at}
      />

      <ArticleSchema
        title={post.title}
        description={post.meta_description || post.excerpt || ''}
        image={post.featured_image || undefined}
        authorName={post.author_name}
        publishedAt={post.published_at || post.created_at}
        modifiedAt={post.updated_at}
        url={canonicalUrl}
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <article className="container mx-auto px-4 max-w-4xl">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au blog
              </Link>
            </motion.div>

            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {post.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-4">
                  <Tag className="w-3 h-3" />
                  {post.category.name}
                </span>
              )}

              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author_name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.views_count} vues
                </span>
              </div>
            </motion.header>

            {/* Featured Image */}
            {post.featured_image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
              >
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full rounded-2xl aspect-video object-cover"
                />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share / CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 p-8 glass-card rounded-2xl text-center"
            >
              <h3 className="text-2xl font-bold mb-4">Prêt à manipuler vos PDF?</h3>
              <p className="text-muted-foreground mb-6">
                Utilisez nos outils gratuits pour fusionner, diviser, compresser et convertir vos fichiers PDF.
              </p>
              <Link to="/tools" className="btn-primary inline-block">
                Découvrir tous les outils
              </Link>
            </motion.div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
