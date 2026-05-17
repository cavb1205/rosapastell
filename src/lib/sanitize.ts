const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
  "span", "a", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  span: new Set(["class"]),
};

/**
 * Strip dangerous HTML while keeping basic formatting tags.
 * Removes script/style/iframe/event handlers without needing DOMPurify.
 */
export function sanitizeHTML(html: string): string {
  return html
    // Remove script/style/iframe blocks entirely
    .replace(/<(script|style|iframe|object|embed|form|input|textarea|button)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|textarea|button)[^>]*\/?>/gi, "")
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove javascript: and data: URLs in attributes
    .replace(/\s+(href|src|action)\s*=\s*(?:"(?:javascript|data|vbscript):[^"]*"|'(?:javascript|data|vbscript):[^']*')/gi, "")
    // Strip disallowed tags but keep their text content
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
      const lower = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(lower)) return "";

      // For closing tags, just allow them through
      if (match.startsWith("</")) return `</${lower}>`;

      // For opening tags, filter attributes
      const allowed = ALLOWED_ATTRS[lower];
      if (!allowed) {
        // Self-closing like <br>
        return match.includes("/>") ? `<${lower} />` : `<${lower}>`;
      }

      const attrs: string[] = [];
      const attrRegex = /\s([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(match)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] ?? attrMatch[3] ?? "";
        if (allowed.has(attrName)) {
          attrs.push(`${attrName}="${attrValue}"`);
        }
      }

      // Force safe link behavior
      if (lower === "a") {
        if (!attrs.some((a) => a.startsWith("rel="))) {
          attrs.push('rel="noopener noreferrer"');
        }
        if (!attrs.some((a) => a.startsWith("target="))) {
          attrs.push('target="_blank"');
        }
      }

      const attrStr = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
      return `<${lower}${attrStr}>`;
    });
}

/** Strip all HTML tags, returning only text content. */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
