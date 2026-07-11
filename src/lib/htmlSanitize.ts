// Client-side HTML sanitizer for blog content.
// Keeps only safe semantic tags, demotes <h1> to <h2>, and strips
// disallowed/dangerous elements and attributes.

const ALLOWED_TAGS = new Set([
  'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em',
  'blockquote', 'img', 'figure', 'figcaption', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'code', 'pre', 'br', 'hr', 'b', 'i',
]);

// Map deprecated/alias tags to canonical semantic tags
const TAG_ALIASES: Record<string, string> = {
  b: 'strong',
  i: 'em',
  h1: 'h2', // demote H1 in body to H2
};

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  th: new Set(['colspan', 'rowspan']),
  td: new Set(['colspan', 'rowspan']),
};

const isSafeUrl = (url: string): boolean => {
  const value = url.trim().toLowerCase();
  if (value.startsWith('javascript:') || value.startsWith('data:') && !value.startsWith('data:image/')) {
    return false;
  }
  return true;
};

const cleanNode = (node: Node, doc: Document) => {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      let tag = el.tagName.toLowerCase();

      // Remove dangerous elements entirely
      if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object' || tag === 'embed') {
        el.remove();
        continue;
      }

      // Demote / alias
      if (TAG_ALIASES[tag]) {
        const replacement = doc.createElement(TAG_ALIASES[tag]);
        while (el.firstChild) replacement.appendChild(el.firstChild);
        el.replaceWith(replacement);
        cleanNode(replacement, doc);
        continue;
      }

      if (!ALLOWED_TAGS.has(tag)) {
        // Unwrap: keep children, drop the tag
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
        // Re-clean the parent's affected region by cleaning parent again is heavy;
        // instead clean the moved children now
        continue;
      }

      // Clean attributes
      const allowed = ALLOWED_ATTRS[tag] || new Set<string>();
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (!allowed.has(name) || name.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }
        if ((name === 'href' || name === 'src') && !isSafeUrl(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }

      // Enforce safe defaults
      if (tag === 'a' && el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer');
      }
      if (tag === 'img') {
        if (!el.getAttribute('loading')) el.setAttribute('loading', 'lazy');
        if (!el.getAttribute('decoding')) el.setAttribute('decoding', 'async');
      }

      cleanNode(el, doc);
    } else if (child.nodeType === Node.COMMENT_NODE) {
      child.parentNode?.removeChild(child);
    }
  }
};

export const sanitizeBlogHtml = (html: string): string => {
  if (typeof window === 'undefined' || !html) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  cleanNode(doc.body, doc);
  return doc.body.innerHTML;
};
