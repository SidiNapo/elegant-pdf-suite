import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, MailOpen, Archive, Trash2, Loader2, Reply } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useContactMessages,
  useUpdateContactStatus,
  useDeleteContactMessage,
  type ContactStatus,
  type ContactMessage,
} from '@/hooks/useContactMessages';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusTabs: { key: ContactStatus | 'all'; label: string }[] = [
  { key: 'new', label: 'Nouveaux' },
  { key: 'read', label: 'Lus' },
  { key: 'archived', label: 'Archivés' },
  { key: 'all', label: 'Tous' },
];

const statusBadge: Record<ContactStatus, string> = {
  new: 'bg-primary/10 text-primary',
  read: 'bg-muted text-foreground',
  archived: 'bg-yellow-500/10 text-yellow-500',
};

const AdminMessages: React.FC = () => {
  const [tab, setTab] = useState<ContactStatus | 'all'>('new');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);

  const { data: messages, isLoading } = useContactMessages(tab);
  const updateStatus = useUpdateContactStatus();
  const deleteMsg = useDeleteContactMessage();

  const filtered = useMemo(() => {
    if (!messages) return [];
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.first_name, m.last_name, m.email, m.subject, m.message].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [messages, search]);

  const openMessage = async (m: ContactMessage) => {
    setSelected(m);
    if (m.status === 'new') {
      try {
        await updateStatus.mutateAsync({ id: m.id, status: 'read' });
      } catch {
        /* ignore */
      }
    }
  };

  const handleArchive = async (m: ContactMessage) => {
    try {
      await updateStatus.mutateAsync({ id: m.id, status: 'archived' });
      toast.success('Message archivé');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMsg.mutateAsync(toDelete.id);
      toast.success('Message supprimé');
      if (selected?.id === toDelete.id) setSelected(null);
    } catch {
      toast.error('Erreur');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout title="Messages">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
        {/* List */}
        <div className="glass-card rounded-2xl p-2 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">
              Aucun message
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => openMessage(m)}
                    className={`w-full text-left px-4 py-3 rounded-xl hover:bg-muted transition-colors ${
                      selected?.id === m.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium truncate">
                        {m.first_name} {m.last_name}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusBadge[m.status]}`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground truncate">{m.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.email} · {new Date(m.created_at).toLocaleString('fr-FR')}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <motion.div
          key={selected?.id ?? 'empty'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 min-h-[300px]"
        >
          {selected ? (
            <>
              <div className="flex flex-wrap gap-2 justify-between items-start mb-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold break-words">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    De <span className="font-medium text-foreground">{selected.first_name} {selected.last_name}</span> &lt;{selected.email}&gt;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                      <Reply className="w-4 h-4 mr-1" /> Répondre
                    </a>
                  </Button>
                  {selected.status !== 'archived' && (
                    <Button size="sm" variant="outline" onClick={() => handleArchive(selected)}>
                      <Archive className="w-4 h-4 mr-1" /> Archiver
                    </Button>
                  )}
                  {selected.status === 'read' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({ id: selected.id, status: 'new' })
                      }
                    >
                      <Mail className="w-4 h-4 mr-1" /> Marquer non lu
                    </Button>
                  )}
                  {selected.status === 'new' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({ id: selected.id, status: 'read' })
                      }
                    >
                      <MailOpen className="w-4 h-4 mr-1" /> Marquer lu
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setToDelete(selected)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
              <div className="mt-4 whitespace-pre-wrap leading-relaxed text-foreground border-t border-border pt-4">
                {selected.message}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Sélectionnez un message pour l'afficher
            </div>
          )}
        </motion.div>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminMessages;
