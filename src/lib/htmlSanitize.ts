// Blog content sanitizer. Now backed by the shared sanitize-html implementation
// so the browser and the server enforce the exact same allowlist.
export { sanitizeBlogHtml } from "./sanitizeShared";
