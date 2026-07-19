import { useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2, Copy, CheckCircle2, ImageIcon, UploadCloud, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageUtils';

// Media library for the `blog-images` bucket.
//
// Scope contract:
// - Lists images under `posts/` (matches the upload path used in AdminPostEditor).
// - Reads via storage.list on a public bucket (works for authenticated admins).
// - Delete is guarded server-side by the "Admins can delete blog images"
//   RLS policy — non-admins get a permission error and see a friendly toast.
// - Upload compresses to JPEG at 1200px max (same pipeline as the editor)
//   so the library and the featured-image uploader stay consistent.
// - onPick returns { url, width, height } so the caller can wire it straight
//   into featured_image + og_image + dims without a second measure pass.

export interface MediaItem {
  name: string;      // filename inside `posts/`
  path: string;      // full storage path (e.g. `posts/1234567.jpg`)
  url: string;       // public URL
  updatedAt: string; // ISO timestamp for sort/display
  size: number;      // bytes
}

interface MediaLibraryProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick?: (item: { url: string; width: number; height: number }) => void;
  /** Label shown on the "pick" button. Defaults to "Utiliser". */
  pickLabel?: string;
}

const BUCKET = 'blog-images';
const FOLDER = 'posts';
const PAGE_SIZE = 100;

async function measureImage(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1200, h: 630 });
    img.src = url;
  });
}

const MediaLibrary = ({ open, onOpenChange, onPick, pickLabel = 'Utiliser' }: MediaLibraryProps) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(FOLDER, { limit: PAGE_SIZE, sortBy: { column: 'updated_at', order: 'desc' } });
      if (error) {
        toast.error('Impossible de charger la médiathèque');
        setItems([]);
        return;
      }
      const rows: MediaItem[] = (data ?? [])
        .filter((f) => f.name && !f.name.endsWith('/'))
        .map((f) => {
          const path = `${FOLDER}/${f.name}`;
          const pub = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          return {
            name: f.name,
            path,
            url: pub,
            updatedAt: (f.updated_at as string) || (f.created_at as string) || '',
            size: (f.metadata as { size?: number } | null)?.size ?? 0,
          };
        });
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file, 1200, 0.7);
      const fileName = `${Date.now()}.jpg`;
      const path = `${FOLDER}/${fileName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: 'image/jpeg',
      });
      if (error) {
        toast.error('Échec du téléversement');
        return;
      }
      toast.success('Image ajoutée à la médiathèque');
      await refresh();
    } catch {
      toast.error('Erreur lors de la compression');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (url: string, path: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPath(path);
      window.setTimeout(() => setCopiedPath(null), 1200);
    } catch {
      toast.error('Impossible de copier');
    }
  };

  const handleDelete = async (path: string) => {
    if (!window.confirm('Supprimer définitivement cette image ?')) return;
    setDeletingPath(path);
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) {
        toast.error(error.message || 'Suppression refusée');
        return;
      }
      toast.success('Image supprimée');
      setItems((prev) => prev.filter((i) => i.path !== path));
    } finally {
      setDeletingPath(null);
    }
  };

  const handlePick = async (item: MediaItem) => {
    if (!onPick) return;
    const { w, h } = await measureImage(item.url);
    onPick({ url: item.url, width: w, height: h });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Médiathèque
          </DialogTitle>
          <DialogDescription>
            Images utilisées dans les articles. Bucket : <code>{BUCKET}/{FOLDER}</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
          <p className="text-xs text-muted-foreground">
            {loading ? 'Chargement…' : `${items.length} image(s)`}
          </p>
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button asChild size="sm" variant="outline" disabled={uploading}>
              <span className="cursor-pointer inline-flex items-center gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Téléverser
              </span>
            </Button>
          </label>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Aucune image pour le moment.</p>
              <p className="text-xs mt-1">Téléversez votre première image ci-dessus.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-3">
              {items.map((item) => (
                <div
                  key={item.path}
                  className="group relative rounded-xl overflow-hidden border border-border bg-card"
                >
                  <div className="aspect-video bg-muted">
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 text-xs text-muted-foreground truncate" title={item.name}>
                    {item.name}
                    {item.size > 0 && (
                      <span className="ml-1 opacity-70">· {(item.size / 1024).toFixed(0)}KB</span>
                    )}
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 flex flex-col items-center justify-center gap-2 p-2">
                    {onPick && (
                      <Button size="sm" className="w-full" onClick={() => handlePick(item)}>
                        {pickLabel}
                      </Button>
                    )}
                    <div className="flex gap-2 w-full">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-background/90"
                        onClick={() => handleCopy(item.url, item.path)}
                      >
                        {copiedPath === item.path ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(item.path)}
                        disabled={deletingPath === item.path}
                      >
                        {deletingPath === item.path ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-1" /> Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaLibrary;
