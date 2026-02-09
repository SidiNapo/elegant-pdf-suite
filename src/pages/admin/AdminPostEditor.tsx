import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Eye, Image, Loader2, AlertCircle } from 'lucide-react';
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
import { usePostById, useCreatePost, useUpdatePost, useCategories } from '@/hooks/useBlogPosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageUtils';
import { adminRoutes } from '@/config/adminRoutes';
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
      author_name: "E-Pdf's",
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      og_image: '',
      canonical_url: '',
      is_published: false,
      category_id: '',
    };
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultData, ...JSON.parse(saved) };
    } catch {}
    return defaultData;
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Persist form data to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData, STORAGE_KEY]);

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
        author_name: existingPost.author_name,
        meta_title: existingPost.meta_title || '',
        meta_description: existingPost.meta_description || '',
        meta_keywords: existingPost.meta_keywords || '',
        og_image: existingPost.og_image || '',
        canonical_url: existingPost.canonical_url || '',
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

      setFormData((prev) => ({
        ...prev,
        featured_image: data.publicUrl,
        og_image: data.publicUrl,
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

    setIsSaving(true);

    try {
      // Preserve existing published_at if already set, otherwise set it when publishing
      const shouldSetPublishedAt = formData.is_published && (!existingPost?.published_at || !existingPost?.is_published);
      const postData = {
        ...formData,
        category_id: formData.category_id || null,
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

      navigate(adminRoutes.posts);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Le contenu de votre article (HTML supporté)..."
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez utiliser du HTML pour le formatage.
                </p>
              </div>
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
                <Label htmlFor="canonical_url">URL canonique</Label>
                <Input
                  id="canonical_url"
                  value={formData.canonical_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, canonical_url: e.target.value }))
                  }
                  placeholder="https://e-pdfs.com/blog/..."
                />
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
                    alt="Featured"
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
            </motion.div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminPostEditor;
