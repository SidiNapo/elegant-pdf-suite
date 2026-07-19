// SEO regression test: proves that stored canonical values which are NOT
// exactly `https://www.e-pdfs.com/blog/{slug}` can never leak into the
// rendered <link rel="canonical">. The historical bug we're guarding against
// is `e-pdfs.com/blog/slug` (no scheme) resolving through `new URL(x, base)`
// to `https://www.e-pdfs.com/e-pdfs.com/blog/slug`.

import { strictBlogCanonical } from "../api/render.js";

let failures = 0;
function assertEq(actual, expected, label) {
  if (actual === expected) {
    console.log(`  ok  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL ${label}\n    expected: ${expected}\n    actual:   ${actual}`);
  }
}

const slug = "how-to-convert-pdf-to-word";
const good = `https://www.e-pdfs.com/blog/${slug}`;

console.log("strictBlogCanonical:");
// Invalid inputs — every one MUST fall back to the derived URL.
assertEq(strictBlogCanonical("e-pdfs.com/blog/" + slug, slug), good, "scheme-less host is rejected");
assertEq(strictBlogCanonical("www.e-pdfs.com/blog/" + slug, slug), good, "www without scheme is rejected");
assertEq(strictBlogCanonical("/blog/" + slug, slug), good, "relative path is rejected");
assertEq(strictBlogCanonical("https://e-pdfs.com/blog/" + slug, slug), good, "apex host is rejected");
assertEq(strictBlogCanonical("http://www.e-pdfs.com/blog/" + slug, slug), good, "http (non-https) is rejected");
assertEq(strictBlogCanonical("https://evil.com/blog/" + slug, slug), good, "external origin is rejected");
assertEq(strictBlogCanonical(`${good}?utm_source=x`, slug), good, "query string is rejected");
assertEq(strictBlogCanonical(`${good}#section`, slug), good, "fragment is rejected");
assertEq(strictBlogCanonical("https://www.e-pdfs.com/blog/wrong-slug", slug), good, "mismatched slug is rejected");
assertEq(strictBlogCanonical("", slug), good, "empty string falls back");
assertEq(strictBlogCanonical(null, slug), good, "null falls back");
assertEq(strictBlogCanonical(undefined, slug), good, "undefined falls back");
assertEq(strictBlogCanonical("   ", slug), good, "whitespace falls back");

// Valid input passes through unchanged.
assertEq(strictBlogCanonical(good, slug), good, "exact canonical is accepted");

// The historical bug: doubled host must NEVER appear in output.
const doubled = "https://www.e-pdfs.com/e-pdfs.com/blog/" + slug;
const result = strictBlogCanonical("e-pdfs.com/blog/" + slug, slug);
if (result === doubled) {
  failures++;
  console.error(`  FAIL doubled-host regression: got ${doubled}`);
} else {
  console.log("  ok  doubled-host regression (e-pdfs.com/blog/slug never becomes /e-pdfs.com/blog/slug)");
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll canonical regression tests passed.");
