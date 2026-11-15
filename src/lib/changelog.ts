import sanitizeHtml from "sanitize-html";

export function cleanChangelog(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const html = sanitizeHtml(value, { allowedTags: sanitizeHtml.defaults.allowedTags, allowedSchemes: ["https", "http", "mailto"] });
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim() ? html : null;
}