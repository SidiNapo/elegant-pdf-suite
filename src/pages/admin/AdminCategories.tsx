import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCategories, BlogCategory } from '@/hooks/useBlogPosts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Nom et slug sont obligatoires');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('blog_categories')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Catégorie mise à jour');
      } else {
        const { error } = await supabase.from('blog_categories').insert(formData);

        if (error) throw error;
        toast.success('Catégorie créée');
      }

      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('blog_categories').delete().eq('id', id);

      if (error) throw error;
      toast.success('Catégorie supprimée');
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  return (
    <AdminLayout title="Catégories">
      {/* Add Button */}
      {!isCreating && !editingId && (
        <Button
          onClick={() => setIsCreating(true)}
          className="btn-primary gap-2 mb-8"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </Button>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: editingId ? prev.slug : generateSlug(e.target.value),
                  }))
                }
                placeholder="Nom de la catégorie"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                }
                placeholder="slug-categorie"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Description courte"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="btn-primary gap-2">
              <Save className="w-4 h-4" />
              {editingId ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Nom
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Slug
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Description
                </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-medium">{category.name}</td>
                  <td className="p-4 text-muted-foreground">{category.slug}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">
                    {category.description || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la catégorie?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Les articles de cette catégorie ne seront pas supprimés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass-card rounded-2xl"
        >
          <p className="text-muted-foreground">Aucune catégorie</p>
        </motion.div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
