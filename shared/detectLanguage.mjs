// Lightweight text-language guess (fr / en / ar) used by the admin editor to
// warn when an article's language field does not match its actual text.
// Plain JS so it can be unit-tested with node and imported by the browser.

const STOPWORDS = {
  fr: ["le", "la", "les", "des", "est", "et", "une", "un", "pour", "dans", "vous", "votre", "avec", "sur", "pas", "que", "qui", "du", "au", "sont"],
  en: ["the", "and", "is", "are", "to", "of", "for", "with", "your", "you", "this", "that", "on", "in", "it", "how", "can", "best", "from", "or"],
};

/**
 * Returns "fr" | "en" | "ar" | null (null = not enough text to decide).
 * @param {string} text plain text or HTML
 */
export function detectLanguage(text) {
  const plain = String(text || "").replace(/<[^>]*>/g, " ").toLowerCase();
  const arabic = (plain.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (plain.match(/[a-zà-ÿ]/g) || []).length;
  if (arabic > 20 && arabic > latin) return "ar";
  const words = plain.match(/[a-zà-ÿ']+/g) || [];
  if (words.length < 20) return null;
  const score = { fr: 0, en: 0 };
  const sets = { fr: new Set(STOPWORDS.fr), en: new Set(STOPWORDS.en) };
  for (const w of words) {
    if (sets.fr.has(w)) score.fr++;
    if (sets.en.has(w)) score.en++;
  }
  if (score.fr === score.en) return null;
  const top = score.fr > score.en ? "fr" : "en";
  const other = top === "fr" ? score.en : score.fr;
  // Require a clear margin to avoid false warnings on mixed text.
  return score[top] >= Math.max(5, other * 2) ? top : null;
}
