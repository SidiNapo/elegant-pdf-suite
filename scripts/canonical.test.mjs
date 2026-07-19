// SEO regression tests: prove that stored `blog_posts.canonical_url` values
// can NEVER change the rendered <link rel="canonical">. The renderer now
// derives the canonical purely from the (already-validated) slug and ignores
// its first argument entirely — so external hosts, doubled hosts, relative
// paths, query strings, fragments, and outright garbage all collapse to the
// exact same slug-derived URL.
//
// Also asserts the slug validator: only [a-z0-9-] shapes (no leading/trailing
// or double hyphens, no dots, no slashes) are accepted as blog article slugs.

import { strictBlogCanonical, isValidBlogSlug } from "../api/render.js";

let failures = 0;
function assertEq(actual, expected, label) {
  if (actual === expected) {
    console.log(`  ok  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL ${label}\n    expected: ${expected}\n    actual:   ${actual}`);
  }
}
function assertTrue(cond, label) {
  if (cond) console.log(`  ok  ${label}`);
  else {
    failures++;
    console.error(`  FAIL ${label}`);
  }
}
function assertThrows(fn, label) {
  try {
    fn();
    failures++;
    console.error(`  FAIL ${label} (no throw)`);
  } catch {
    console.log(`  ok  ${label}`);
  }
}

const slug = "how-to-convert-pdf-to-word";
const good = `https://www.e-pdfs.com/blog/${slug}`;

console.log("strictBlogCanonical — first arg is IGNORED, canonical derives from slug only:");
// Every one of these values used to be a "custom canonical" that had to be
// filtered out. They are now silently dropped: only the slug matters.
const stored = [
  null,
  undefined,
  "",
  "   ",
  "e-pdfs.com/blog/" + slug,
  "www.e-pdfs.com/blog/" + slug,
  "/blog/" + slug,
  "https://e-pdfs.com/blog/" + slug,
  "http://www.e-pdfs.com/blog/" + slug,
  "https://evil.com/blog/" + slug,
  `${good}?utm_source=x`,
  `${good}#section`,
  "https://www.e-pdfs.com/blog/wrong-slug",
  "https://www.e-pdfs.com/e-pdfs.com/blog/" + slug, // doubled-host regression
  "not a url at all",
  "javascript:alert(1)",
  "data:text/html,<script>",
  "//attacker.example/blog/" + slug,
  '"><script>alert(1)</script>',
];
for (const v of stored) {
  assertEq(strictBlogCanonical(v, slug), good, `stored value ignored: ${JSON.stringify(v)}`);
}

// Preserve current correct canonicals for both published articles.
const preserved = [
  "how-to-convert-pdf-to-word",
  "best-pdf-to-word-converter-top-picks-reviewed",
];
for (const s of preserved) {
  assertEq(
    strictBlogCanonical("literally anything", s),
    `https://www.e-pdfs.com/blog/${s}`,
    `preserved canonical for /blog/${s}`,
  );
}

// Invalid slug shapes must be rejected outright — the builder refuses to
// construct a URL rather than fabricate one from garbage.
console.log("\nisValidBlogSlug / strictBlogCanonical slug validation:");
const validSlugs = ["a", "post-1", "how-to-convert-pdf-to-word", "abc123", "1-2-3"];
const invalidSlugs = [
  "",
  "-leading",
  "trailing-",
  "double--hyphen",
  "UPPER",
  "with space",
  "with.dot",
  "with/slash",
  "with?query",
  "with#hash",
  "unicodé",
  "../etc/passwd",
  null,
  undefined,
  42,
];
for (const s of validSlugs) assertTrue(isValidBlogSlug(s), `valid slug: ${JSON.stringify(s)}`);
for (const s of invalidSlugs) assertTrue(!isValidBlogSlug(s), `invalid slug rejected: ${JSON.stringify(s)}`);
for (const s of invalidSlugs) {
  assertThrows(() => strictBlogCanonical("anything", s), `builder throws on invalid slug ${JSON.stringify(s)}`);
}

// Historical doubled-host bug must never reappear.
const doubled = "https://www.e-pdfs.com/e-pdfs.com/blog/" + slug;
if (strictBlogCanonical("e-pdfs.com/blog/" + slug, slug) === doubled) {
  failures++;
  console.error(`  FAIL doubled-host regression: got ${doubled}`);
} else {
  console.log("  ok  doubled-host regression");
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll canonical regression tests passed.");
