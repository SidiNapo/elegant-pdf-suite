import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ArticleSchema from '@/components/blog/ArticleSchema';
import ShareButtons from '@/components/blog/ShareButtons';
import { usePostBySlug } from '@/hooks/useBlogPosts';
import { Loader2 } from 'lucide-react';

const BlogPost = () => {
  const { t, i18n } = useTranslation();
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
            <h1 className="text-4xl font-bold mb-4">{t('blog.notFound')}</h1>
            <p className="text-muted-foreground mb-8">
              {t('blog.notFoundDescription')}
            </p>
            <Link to="/blog" className="btn-primary inline-block">
              {t('blog.backToBlog')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const locale = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const updatedDate = new Date(post.updated_at).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate reading time (approx 200 words per minute)
  const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const canonicalUrl = `https://e-pdfs.com/blog/${post.slug}`;

  // Format content to preserve line breaks and paragraphs
  const formatContent = (content: string) => {
    // If content already has HTML tags, return as is
    if (/<[^>]+>/.test(content)) {
      return content;
    }
    // Otherwise, convert line breaks to paragraphs
    return content
      .split(/\n\n+/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('');
  };

  const formattedContent = formatContent(post.content);
  return <>
      <SEOHead title={post.meta_title || post.title} description={post.meta_description || post.excerpt || ''} keywords={post.meta_keywords || undefined} canonicalUrl={post.canonical_url || canonicalUrl} ogImage={post.og_image || post.featured_image || undefined} ogType="article" author={post.author_name} publishedTime={post.published_at || undefined} modifiedTime={post.updated_at} />

      <ArticleSchema title={post.title} description={post.meta_description || post.excerpt || ''} image={post.featured_image || undefined} authorName={post.author_name} publishedAt={post.published_at || post.created_at} modifiedAt={post.updated_at} url={canonicalUrl} />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          {/* Hero Section with Featured Image */}
          {post.featured_image && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="relative h-[50vh] min-h-[400px] mb-12">
              <div className="absolute inset-0">
                <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
                <div className="max-w-4xl">
                  {post.category && <motion.span initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground mb-4">
                      <Tag className="w-3.5 h-3.5" />
                      {post.category.name}
                    </motion.span>}
                  
                  <motion.h1 initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.1
              }} className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                    {post.title}
                  </motion.h1>
                </div>
              </div>
            </motion.div>}

          <article className="container mx-auto px-4 max-w-4xl">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                {t('blog.backToBlog')}
              </Link>
            </motion.div>

            {/* Header (if no featured image) */}
            {!post.featured_image && <motion.header initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="mb-8">
                {post.category && <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
                    <Tag className="w-3.5 h-3.5" />
                    {post.category.name}
                  </span>}

                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {post.title}
                </h1>
              </motion.header>}

            {/* Meta Info Bar */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="flex flex-wrap items-center gap-6 py-6 mb-8 border-y border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{post.author_name}</p>
                  <p className="text-sm text-muted-foreground">{t('blog.author')}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formattedDate}
                </span>
                
                
              </div>
            </motion.div>

            {/* Excerpt / Introduction */}
            {post.excerpt && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.15
          }} className="mb-10 p-6 bg-muted/50 rounded-2xl border-l-4 border-primary">
                <p className="text-lg text-foreground/90 italic leading-relaxed">
                  {post.excerpt}
                </p>
              </motion.div>}

            {/* Content */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-6
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
                prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-primary prose-a:underline hover:prose-a:no-underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-em:italic prose-em:text-foreground/90
                prose-ul:my-6 prose-ul:pl-6 prose-ul:list-disc
                prose-ol:my-6 prose-ol:pl-6 prose-ol:list-decimal
                prose-li:my-2 prose-li:text-foreground/85
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:my-6
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-hr:border-border prose-hr:my-8
                prose-table:border-collapse prose-table:w-full
                prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:bg-muted
                prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
                [&>*]:mb-4 [&>p]:whitespace-pre-wrap" 
            dangerouslySetInnerHTML={{
              __html: formattedContent
            }} />

            {/* Tags / Keywords */}
            {post.meta_keywords && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-12 pt-8 border-t border-border"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  {t('blog.keywords')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.meta_keywords.split(',').map((keyword, index) => (
                    <span key={index} className="px-3 py-1.5 text-sm bg-muted rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                      #{keyword.trim()}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Share Section */}
            <div className="mt-12">
              <ShareButtons 
                url={canonicalUrl}
                title={post.title}
                description={post.excerpt || post.meta_description || ''}
              />
            </div>

            {/* Article Info Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 p-6 bg-muted/30 rounded-2xl text-sm text-muted-foreground"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-foreground">{t('blog.publishedOn')}:</span>{' '}
                  {formattedDate}
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('blog.updatedOn')}:</span>{' '}
                  {updatedDate}
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('blog.readingTime')}:</span>{' '}
                  {readingTime} {t('blog.minutes', { count: readingTime })}
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('blog.views')}:</span>{' '}
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
                  {t('blog.ctaTitle')}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  {t('blog.ctaDescription')}
                </p>
                <Link to="/tools" className="btn-primary inline-block px-8 py-3 text-lg">
                  {t('blog.discoverTools')}
                </Link>
              </div>
            </motion.div>
          </article>
        </main>

        <Footer />
      </div>
    </>;
};
export default BlogPost;