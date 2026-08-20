// Reads a server-injected JSON data island (see api/render.js). Used to seed
// react-query so the article renders on the FIRST client paint with zero
// network calls — the SSR snapshot is therefore never "lost" after hydration.
// Never throws.
export function readSsrJson<T>(id: string): T | undefined {
  try {
    if (typeof document === 'undefined') return undefined;
    const el = document.getElementById(id);
    const raw = el?.textContent;
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return (parsed ?? undefined) as T | undefined;
  } catch {
    return undefined;
  }
}
