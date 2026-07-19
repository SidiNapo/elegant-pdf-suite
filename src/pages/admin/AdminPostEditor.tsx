import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Eye, Image, Loader2, AlertCircle, CheckCircle2, FolderOpen, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaLibrary from '@/components/admin/MediaLibrary';
import { usePostById, useCreatePost, useUpdatePost, useCategories } from '@/hooks/useBlogPosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageUtils';
import { sanitizeBlogHtml } from '@/lib/htmlSanitize';
import { adminRoutes } from '@/config/adminRoutes';

// Small helper: humanize "seconds ago" for the draft-saved indicator.
function formatAgo(ms: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - ms) / 1000));
  if (seconds < 5) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `il y a ${hours}h`;
}

const AdminPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingPost, isLoading: isLoadingPost } = usePostById(id || '');
  const { data: categories } = useCategories();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const STORAGE_KEY = `admin-post-draft-${id || 'new'}`;

  const getInitialFormData = () => {
    const defaultData = {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      featured_image_alt: '',
      featured_image_width: 1200,
      featured_image_height: 630,
      author_name: "E-Pdf's",
      language: 'fr',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      og_image: '',
      is_published: false,
      category_id: '',
    };
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultData, ...JSON.parse(saved) };
    } catch { /* ignore malformed draft */ }
    return defaultData;
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'featured' | 'og'>('featured');
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Persist form data to sessionStorage on every change, and remember the
  // last-persisted timestamp so we can render a "Draft saved …" indicator.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setDraftSavedAt(Date.now());
    } catch { /* ignore quota errors */ }
  }, [formData, STORAGE_KEY]);

  // Tick every 10s so the "saved Xs ago" label stays fresh without churning
  // on every keystroke.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(t);
  }, []);


  // Load existing post data when editing
  useEffect(() => {
    if (existingPost) {
      setFormData(prev => ({
        ...prev,
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt || '',
        content: existingPost.content,
        featured_image: existingPost.featured_image || '',
        featured_image_alt: existingPost.featured_image_alt || existingPost.title || '',
        featured_image_width: existingPost.featured_image_width || 1200,
        featured_image_height: existingPost.featured_image_height || 630,
        author_name: existingPost.author_name,
        language: existingPost.language || 'fr',
        meta_title: existingPost.meta_title || '',
        meta_description: existingPost.meta_description || '',
        meta_keywords: existingPost.meta_keywords || '',
        og_image: existingPost.og_image || '',
        is_published: existingPost.is_published,
        category_id: existingPost.category_id || '',
      }));
    }
  }, [existingPost]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Compress the image before upload
      const compressedBlob = await compressImage(file, 1200, 0.7);
      const fileName = `${Date.now()}.jpg`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        toast.error('Erreur lors du téléchargement');
        setIsUploading(false);
        return;
      }

      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);

      // Measure natural dimensions for og:image / ImageObject width & height.
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 1200, h: 630 });
        img.src = data.publicUrl;
      });

      setFormData((prev) => ({
        ...prev,
        featured_image: data.publicUrl,
        og_image: data.publicUrl,
        featured_image_alt: prev.featured_image_alt || prev.title || '',
        featured_image_width: dims.w,
        featured_image_height: dims.h,
      }));
      
      const originalSize = (file.size / 1024).toFixed(1);
      const compressedSize = (compressedBlob.size / 1024).toFixed(1);
      toast.success(`Image optimisée: ${originalSize}KB → ${compressedSize}KB`);
    } catch (error) {
      toast.error('Erreur lors de la compression');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Canonical URL is no longer editable in the CMS. It is always derived at
    // render time from the article slug (https://www.e-pdfs.com/blog/{slug}),
    // so we persist NULL to keep the DB clean.




    setIsSaving(true);

    try {
      // Preserve existing published_at if already set, otherwise set it when publishing
      const shouldSetPublishedAt = formData.is_published && (!existingPost?.published_at || !existingPost?.is_published);
      const postData = {
        ...formData,
        content: sanitizeBlogHtml(formData.content),
        featured_image_alt: formData.featured_image
          ? (formData.featured_image_alt || formData.title)
          : null,
        category_id: formData.category_id || null,
        // Canonical is always derived from slug at render time — never store
        // a value from the CMS.
        canonical_url: null,
        published_at: formData.is_published 
          ? (existingPost?.published_at || new Date().toISOString())
          : null,
      };

      // Clear draft from sessionStorage on successful save
      sessionStorage.removeItem(STORAGE_KEY);

      if (isEditing && id) {
        await updatePost.mutateAsync({ id, ...postData });
        toast.success('Article mis à jour');
      } else {
        await createPost.mutateAsync(postData);
        toast.success('Article créé');
      }

      // IndexNow submission is handled by the useCreatePost/useUpdatePost
      // hooks (best-effort, never blocks the save). Show a soft confirmation
      // only when the article is currently published.
      if (postData.is_published) {
        toast.success('Article soumis aux moteurs de recherche pour indexation');
      }

      navigate(adminRoutes.posts);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Media library picker — reused for both the featured image and the
  // per-post OG override. The library returns measured dimensions so the
  // saved record always carries accurate og:image:width/height.
  const handleMediaPick = useCallback(
    (item: { url: string; width: number; height: number }) => {
      if (mediaTarget === 'og') {
        setFormData((prev) => ({ ...prev, og_image: item.url }));
      } else {
        setFormData((prev) => ({
          ...prev,
          featured_image: item.url,
          og_image: prev.og_image || item.url,
          featured_image_alt: prev.featured_image_alt || prev.title || '',
          featured_image_width: item.width,
          featured_image_height: item.height,
        }));
      }
    },
    [mediaTarget]
  );

  // Ctrl/Cmd+S saves without going through the browser's Save Page dialog.
  // We hook the form's submit handler via a ref to keep the effect stable
  // regardless of formData churn.
  const submitRef = useRef<((e: React.FormEvent) => Promise<void>) | null>(null);
  submitRef.current = handleSubmit;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        submitRef.current?.(new Event('submit') as unknown as React.FormEvent);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  if (isEditing && isLoadingPost) {
    return (
      <AdminLayout title="Chargement...">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? 'Modifier l\'article' : 'Nouvel article'}>
      {/* Autosave indicator + media library shortcut. Sticky so it stays
          visible while scrolling the long form. */}
      <div className="sticky top-0 z-10 -mx-4 md:mx-0 px-4 py-2 mb-4 flex items-center justify-between gap-3 rounded-xl bg-background/80 backdrop-blur border border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            Brouillon enregistré {draftSavedAt ? formatAgo(draftSavedAt, now) : ''}
          </span>
          <span className="hidden md:inline opacity-60">·</span>
          <span className="hidden md:inline opacity-60">
            Astuce : <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Ctrl</kbd>
            <span className="mx-0.5">+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">S</kbd> pour sauvegarder
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => { setMediaTarget('featured'); setMediaOpen(true); }}
        >
          <FolderOpen className="w-4 h-4" /> Médiathèque
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Le titre de votre article"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/blog/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                    placeholder="url-de-larticle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Un court résumé de l'article..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                />
                <p className="text-xs text-muted-foreground">
                  Utilisez la barre d'outils pour formater. Les titres commencent au H2
                  (le titre de l'article est le seul H1 de la page).
                </p>
              </div>

              {/* Live content preview with public prose styles */}
              {formData.content && (
                <div className="space-y-2">
                  <Label>Aperçu du contenu</Label>
                  <div
                    className="prose prose-lg max-w-none rounded-xl border border-border bg-background p-6
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                      prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
                      prose-p:text-foreground/85 prose-p:leading-relaxed
                      prose-a:text-primary prose-a:underline
                      prose-strong:text-foreground
                      prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1
                      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:italic
                      prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(formData.content) }}
                  />
                </div>
              )}
            </motion.div>


            {/* SEO Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-lg font-bold">SEO & Métadonnées</h2>

              <div className="space-y-2">
                <Label htmlFor="meta_title">
                  Titre SEO
                  <span className="text-muted-foreground ml-2 text-xs">
                    ({formData.meta_title.length}/60)
                  </span>
                </Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                  }
                  placeholder="Titre optimisé pour les moteurs de recherche"
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">
                  Description SEO
                  <span className="text-muted-foreground ml-2 text-xs">
                    ({formData.meta_description.length}/160)
                  </span>
                </Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_description: e.target.value }))
                  }
                  placeholder="Description pour les résultats de recherche"
                  maxLength={160}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Mots-clés</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_keywords: e.target.value }))
                  }
                  placeholder="mot-clé1, mot-clé2, mot-clé3"
                />
              </div>

              <div className="space-y-2">
                <Label>URL canonique</Label>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  https://www.e-pdfs.com/blog/{formData.slug || 'slug'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Générée automatiquement à partir du slug — non modifiable.
                </p>
              </div>




              {/* SEO Preview */}
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">Aperçu Google</p>
                <div className="space-y-1">
                  <p className="text-blue-400 text-lg truncate">
                    {formData.meta_title || formData.title || 'Titre de l\'article'}
                  </p>
                  <p className="text-green-500 text-sm">
                    e-pdfs.com/blog/{formData.slug || 'url-article'}
                  </p>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {formData.meta_description || formData.excerpt || 'Description de l\'article...'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-lg font-bold">Publication</h2>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_published">Publier</Label>
                  <p className="text-xs text-muted-foreground">
                    Rendre l'article visible
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_published: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Langue de l'article</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Langue..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_name">Auteur</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author_name: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-3">
                {/* Main Publish/Save Button */}
                <Button
                  type="submit"
                  className={`w-full gap-2 ${formData.is_published ? 'bg-primary hover:bg-primary/90' : ''}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : formData.is_published ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Publier l'article
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer (brouillon)
                    </>
                  )}
                </Button>
                {formData.is_published && formData.slug && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                    Voir l'article
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-lg font-bold">Image à la une</h2>

              {formData.featured_image ? (
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt={formData.featured_image_alt || 'Aperçu'}
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, featured_image: '', og_image: '' }))
                    }
                    className="absolute top-2 right-2 p-2 bg-destructive rounded-lg text-white"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                    ) : (
                      <>
                        <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour télécharger
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}

              <div className="space-y-2">
                <Label htmlFor="featured_image_url">ou URL de l'image</Label>
                <Input
                  id="featured_image_url"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured_image: e.target.value,
                      og_image: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => { setMediaTarget('featured'); setMediaOpen(true); }}
              >
                <FolderOpen className="w-4 h-4" /> Choisir depuis la médiathèque
              </Button>

              <div className="space-y-2">
                <Label htmlFor="featured_image_alt">Texte alternatif (alt)</Label>
                <Input
                  id="featured_image_alt"
                  value={formData.featured_image_alt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featured_image_alt: e.target.value }))
                  }
                  placeholder="Décrivez l'image (SEO & accessibilité)"
                />
                <p className="text-xs text-muted-foreground">
                  Utilisé comme texte alternatif de l'image et og:image:alt. Par défaut,
                  le titre de l'article.
                </p>
              </div>
            </motion.div>

            {/* Per-post Open Graph image override.
                Defaults to featured_image via the SEOHead component if left
                empty; setting it here lets the admin ship a dedicated 1200x630
                social preview without changing the in-page hero. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-bold">Image sociale (og:image)</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Facultatif. Utilisée par Facebook, LinkedIn, X et l'aperçu de messagerie.
                Recommandé : 1200×630 px. Laissez vide pour réutiliser l'image à la une.
              </p>

              {formData.og_image && formData.og_image !== formData.featured_image && (
                <div className="relative">
                  <img
                    src={formData.og_image}
                    alt="Aperçu og:image"
                    className="w-full aspect-[1200/630] object-cover rounded-xl border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, og_image: '' }))}
                    className="absolute top-2 right-2 p-2 bg-destructive rounded-lg text-white"
                    aria-label="Retirer l'image sociale"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Input
                value={formData.og_image}
                onChange={(e) => setFormData((prev) => ({ ...prev, og_image: e.target.value }))}
                placeholder="https://..."
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => { setMediaTarget('og'); setMediaOpen(true); }}
              >
                <FolderOpen className="w-4 h-4" /> Choisir depuis la médiathèque
              </Button>
            </motion.div>
          </div>
        </div>
      </form>

      <MediaLibrary
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onPick={handleMediaPick}
        pickLabel={mediaTarget === 'og' ? 'Utiliser comme og:image' : 'Utiliser comme image à la une'}
      />
    </AdminLayout>
  );
};

export default AdminPostEditor;

