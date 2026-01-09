import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Eye, Tag, Clock, Share2, Twitter, Facebook, Linkedin, Copy } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ArticleSchema from '@/components/blog/ArticleSchema';
import { usePostBySlug } from '@/hooks/useBlogPosts';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePostBySlug(slug || '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Lien copié !');
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || '');
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

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
              L&apos;article que vous cherchez n&apos;existe pas ou a été supprimé.
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

  const updatedDate = new Date(post.updated_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate reading time (approx 200 words per minute)
  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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
          {/* Hero Section with Featured Image */}
          {post.featured_image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-[50vh] min-h-[400px] mb-12"
            >
              <div className="absolute inset-0">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
                <div className="max-w-4xl">
                  {post.category && (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground mb-4"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {post.category.name}
                    </motion.span>
                  )}
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg"
                  >
                    {post.title}
                  </motion.h1>
                </div>
              </div>
            </motion.div>
          )}

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

            {/* Header (if no featured image) */}
            {!post.featured_image && (
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                {post.category && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
                    <Tag className="w-3.5 h-3.5" />
                    {post.category.name}
                  </span>
                )}

                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {post.title}
                </h1>
              </motion.header>
            )}

            {/* Meta Info Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-6 py-6 mb-8 border-y border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{post.author_name}</p>
                  <p className="text-sm text-muted-foreground">Auteur</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {readingTime} min de lecture
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  {post.views_count.toLocaleString()} vues
                </span>
              </div>
            </motion.div>

            {/* Excerpt / Introduction */}
            {post.excerpt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-10 p-6 bg-muted/50 rounded-2xl border-l-4 border-primary"
              >
                <p className="text-lg text-foreground/90 italic leading-relaxed">
                  {post.excerpt}
                </p>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-foreground/85 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:my-6 prose-li:my-2
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
                prose-code:bg-muted prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags / Keywords */}
            {post.meta_keywords && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-12 pt-8 border-t border-border"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Mots-clés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.meta_keywords.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm bg-muted rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      #{keyword.trim()}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 p-6 glass-card rounded-2xl"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Partager cet article</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                    className="rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                    className="rounded-full hover:bg-[#4267B2]/10 hover:text-[#4267B2] hover:border-[#4267B2]"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                    className="rounded-full hover:bg-[#0077B5]/10 hover:text-[#0077B5] hover:border-[#0077B5]"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="rounded-full"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Article Info Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 p-6 bg-muted/30 rounded-2xl text-sm text-muted-foreground"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-foreground">Publié le:</span>{' '}
                  {formattedDate}
                </div>
                <div>
                  <span className="font-medium text-foreground">Mis à jour le:</span>{' '}
                  {updatedDate}
                </div>
                <div>
                  <span className="font-medium text-foreground">Temps de lecture:</span>{' '}
                  {readingTime} minute{readingTime > 1 ? 's' : ''}
                </div>
                <div>
                  <span className="font-medium text-foreground">Vues:</span>{' '}
                  {post.views_count.toLocaleString()}
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 p-8 md:p-12 glass-card rounded-2xl text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Prêt à manipuler vos PDF?
                </h3>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Utilisez nos outils gratuits pour fusionner, diviser, compresser et convertir vos fichiers PDF en quelques clics.
                </p>
                <Link to="/tools" className="btn-primary inline-block px-8 py-3 text-lg">
                  Découvrir tous les outils
                </Link>
              </div>
            </motion.div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
