"use client";

import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";

import { cn } from "@/lib/cn";

// Mirrors the server-side sanitizer vocabulary (RichTextSanitizer.cs) —
// defense-in-depth: even if a raw value slipped into the DB, it renders safely.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "mark",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "hr",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];
const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "target",
  "rel",
  "colspan",
  "rowspan",
  "style",
];

/** Renders sanitized rich-text HTML produced by the project editor. */
export function RichTextContent({
  html,
  className,
}: Readonly<{ html: string; className?: string }>) {
  const clean = useMemo(() => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR }), [html]);

  return (
    <div
      className={cn("rte-content", className)}
      // Sanitized twice (API HtmlSanitizer + DOMPurify above) before injection.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
