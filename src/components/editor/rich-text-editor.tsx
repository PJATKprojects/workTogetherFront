"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";

import { resolveFileUrl } from "@/lib/files";
import { getApiError } from "@/lib/api-error";
import { fileService } from "@/services/fileService";
import type { SiteMessages } from "@/messages/types";

type EditorLabels = SiteMessages["projects"]["editor"];

/**
 * Word-like rich text editor for project descriptions (v1.3). Emits HTML that the
 * API sanitizes server-side against the same tag vocabulary. Images/files go
 * through POST /api/files and are embedded as absolute URLs.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  labels,
}: Readonly<{
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  labels: EditorLabels;
}>) {
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        // Shares typography with the read-side .rte-content styles.
        class: "rte-content min-h-56 px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.isEmpty ? "" : current.getHTML());
    },
  });

  if (!editor) {
    return <div className="min-h-56 animate-pulse rounded-2xl border border-input bg-muted/50" />;
  }

  const uploadAndInsert = async (file: File, kind: "image" | "file") => {
    setUploadError("");
    setUploading(true);
    try {
      const result = await fileService.upload(file);
      const url = resolveFileUrl(result.url);
      if (kind === "image") {
        editor.chain().focus().setImage({ src: url, alt: result.fileName }).run();
      } else {
        // Attach as a download link labeled with the original file name.
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: result.fileName,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .insertContent(" ")
          .run();
      }
    } catch (cause) {
      setUploadError(getApiError(cause, labels.uploadFailed).message);
    } finally {
      setUploading(false);
    }
  };

  const setLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    // Lightweight MVP link prompt.
    const href = window.prompt(labels.linkPrompt, current ?? "https://");
    if (href === null) return;
    if (href === "" || href === "https://") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-input bg-surface transition-colors focus-within:border-primary">
      <div
        role="toolbar"
        aria-label={labels.toolbarAria}
        className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted/60 p-1.5"
      >
        <ToolbarButton
          label={labels.undo}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Glyph d="M9 14 4 9l5-5" extra="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.redo}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Glyph d="m15 14 5-5-5-5" extra="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label={labels.heading2}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          text="H2"
        />
        <ToolbarButton
          label={labels.heading3}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          text="H3"
        />

        <Divider />

        <ToolbarButton
          label={labels.bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          text="B"
          textClass="font-black"
        />
        <ToolbarButton
          label={labels.italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          text="I"
          textClass="italic font-serif"
        />
        <ToolbarButton
          label={labels.underline}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          text="U"
          textClass="underline"
        />
        <ToolbarButton
          label={labels.strike}
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          text="S"
          textClass="line-through"
        />

        <Divider />

        <ToolbarButton
          label={labels.bulletList}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Glyph d="M8 6h13M8 12h13M8 18h13" extra="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.orderedList}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <Glyph
            d="M10 6h11M10 12h11M10 18h11"
            extra="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"
          />
        </ToolbarButton>
        <ToolbarButton
          label={labels.quote}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Glyph d="M17 6c-3 2-4 5-4 8m4 4a3 3 0 1 0 0-6c-.5 0-1 .1-1.4.3M6 6C3 8 2 11 2 14m4 4a3 3 0 1 0 0-6c-.5 0-1 .1-1.4.3" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.codeBlock}
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Glyph d="m8 7-5 5 5 5M16 7l5 5-5 5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label={labels.alignLeft}
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <Glyph d="M3 6h18M3 12h12M3 18h15" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.alignCenter}
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <Glyph d="M3 6h18M6 12h12M4.5 18h15" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.alignRight}
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <Glyph d="M3 6h18M9 12h12M6 18h15" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label={labels.link} active={editor.isActive("link")} onClick={setLink}>
          <Glyph d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.image}
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
        >
          <Glyph
            d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
            extra="m3 16 5-5 4 4 3-3 6 6M9.5 8.5h.01"
          />
        </ToolbarButton>
        <ToolbarButton
          label={labels.attachFile}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Glyph d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.divider}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Glyph d="M3 12h18" />
        </ToolbarButton>

        {uploading ? (
          <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-3 animate-spin rounded-full border-[2px] border-border border-t-primary" />
            {labels.uploading}
          </span>
        ) : null}
      </div>

      <EditorContent editor={editor} />

      {uploadError ? <p className="px-4 pb-3 text-xs text-destructive">{uploadError}</p> : null}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadAndInsert(file, "image");
          event.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadAndInsert(file, "file");
          event.target.value = "";
        }}
      />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  text,
  textClass,
  children,
}: Readonly<{
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  text?: string;
  textClass?: string;
  children?: React.ReactNode;
}>) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {text ? <span className={textClass}>{text}</span> : children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}

function Glyph({ d, extra }: Readonly<{ d: string; extra?: string }>) {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
      {extra ? <path d={extra} /> : null}
    </svg>
  );
}

export type { Editor };
