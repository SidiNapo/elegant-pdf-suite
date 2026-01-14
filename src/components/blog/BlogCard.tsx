import { Calendar, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  authorName: string;
  publishedAt: string;
  viewsCount: number;
  categoryName?: string;
}

const BlogCard = memo(({
  slug,
  title,
  excerpt,
  featuredImage,
  authorName,
  publishedAt,
  viewsCount,
  categoryName,
}: BlogCardProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const formattedDate = new Date(publishedAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="glass-card rounded-2xl overflow-hidden hover-glow group transition-all duration-300">
      <Link to={`/blog/${slug}`}>
        {featuredImage ? (
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">📄</span>
          </div>
        )}

        <div className="p-6 space-y-3">
          {categoryName && (
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {categoryName}
            </span>
          )}

          <h2 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h2>

          <p className="text-muted-foreground text-sm line-clamp-2">{excerpt}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {viewsCount}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
