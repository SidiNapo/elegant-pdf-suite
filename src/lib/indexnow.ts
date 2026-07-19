// IndexNow ping helper. Best-effort — errors are swallowed so a failed ping
// NEVER blocks a CMS save/delete. Use the exported `pingIndexNow` after any
// publish, update, unpublish, or delete so search engines re-crawl promptly.
import { supabase } from '@/integrations/supabase/client';

export type IndexNowUrl = string; // absolute or leading-slash path

export function pingIndexNow(urls: IndexNowUrl | IndexNowUrl[]): void {
  const list = Array.isArray(urls) ? urls : [urls];
  if (!list.length) return;
  // Fire-and-forget. Failure MUST NOT reject the caller's promise chain.
  supabase.functions
    .invoke('submit-url', { body: { urls: list } })
    .catch(() => {
      /* indexing is best-effort */
    });
}
