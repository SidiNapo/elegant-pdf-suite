import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ContactStatus = 'new' | 'read' | 'archived';

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export function useContactMessages(status?: ContactStatus | 'all') {
  return useQuery({
    queryKey: ['contact_messages', status ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('contact_messages')
        .select('id,first_name,last_name,email,subject,message,status,created_at,updated_at')
        .order('created_at', { ascending: false });
      if (status && status !== 'all') q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ContactMessage[];
    },
  });
}

export function useUnreadContactCount() {
  return useQuery({
    queryKey: ['contact_messages', 'unread_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactStatus }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact_messages'] });
    },
  });
}

export function useDeleteContactMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact_messages'] });
    },
  });
}
