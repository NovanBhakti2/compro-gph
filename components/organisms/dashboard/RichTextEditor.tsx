"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { TextSelection } from "@tiptap/pm/state";
import { Label, ListBox, Select, type Key } from "@heroui/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
};

const ICONS = {
  undo: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3",
  redo: "M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3",
  bulletList: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  orderedList: "M10 6h11M10 12h11M10 18h11M4 4v4M3 8h2M3 14.5a1.5 1.5 0 013 0c0 .6-.4 1-1 1.5L3 18h3",
  quote: "M7.5 10.5H5a1 1 0 01-1-1V7a1 1 0 011-1h2.5a1 1 0 011 1v4.5a4 4 0 01-4 4M17.5 10.5H15a1 1 0 01-1-1V7a1 1 0 011-1h2.5a1 1 0 011 1v4.5a4 4 0 01-4 4",
  alignLeft: "M4 6h16M4 10h10M4 14h16M4 18h10",
  alignCenter: "M4 6h16M7 10h10M4 14h16M7 18h10",
  alignRight: "M4 6h16M10 10h10M4 14h16M10 18h10",
  link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  image:
    "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  rule: "M4 12h16",
  clear: "M6 18L18 6M9 6h9M10 18l4-12",
} as const;

function Svg({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d={ICONS[name]} />
    </svg>
  );
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the text selection while clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm transition disabled:opacity-30 ${
        active ? "bg-[#0f1932] text-white" : "text-slate-600 hover:bg-white hover:shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden />;

// `preview` styles each option like the text it produces
const BLOCK_TYPES = [
  { value: "paragraph", label: "Teks biasa", preview: "text-sm" },
  { value: "h2", label: "Judul", preview: "text-base font-extrabold text-[#0f1932]" },
  { value: "h3", label: "Subjudul", preview: "text-sm font-bold text-[#0f1932]" },
] as const;

function Toolbar({
  editor,
  uploading,
  onPickImage,
}: {
  editor: Editor;
  uploading: boolean;
  onPickImage: () => void;
}) {
  // Re-render the toolbar only when these values change
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "paragraph",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      alignCenter: e.isActive({ textAlign: "center" }),
      alignRight: e.isActive({ textAlign: "right" }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setBlock = (value: string) => {
    const chain = editor.chain().focus();
    if (value === "h2") chain.setHeading({ level: 2 }).run();
    else if (value === "h3") chain.setHeading({ level: 3 }).run();
    else chain.setParagraph().run();
  };

  // Inline link field (null = closed). The editor keeps its selection while
  // the field has focus, so the link lands on the text selected before.
  const [linkDraft, setLinkDraft] = useState<string | null>(null);

  const openLink = () =>
    setLinkDraft((editor.getAttributes("link").href as string | undefined) ?? "https://");

  const applyLink = () => {
    const url = linkDraft?.trim() ?? "";
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!url || url === "https://") chain.unsetLink();
    else chain.setLink({ href: url });
    // Collapse the selection to the end of the link, so the next insert
    // (e.g. an image) doesn't replace the linked text
    chain
      .command(({ tr }) => {
        tr.setSelection(TextSelection.create(tr.doc, tr.selection.to));
        return true;
      })
      .run();
    setLinkDraft(null);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
  };

  return (
    <div className="sticky top-[57px] z-10 border-b border-slate-100 bg-slate-50/95 backdrop-blur lg:top-[73px]">
      <div className="flex flex-wrap items-center gap-px px-2 py-1.5">
        <ToolButton label="Urungkan (Ctrl+Z)" disabled={!s.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          <Svg name="undo" />
        </ToolButton>
        <ToolButton label="Ulangi (Ctrl+Y)" disabled={!s.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          <Svg name="redo" />
        </ToolButton>
        <Divider />

        <Select
          aria-label="Jenis teks"
          className="w-[118px]"
          value={s.block}
          onChange={(key: Key | null) => key && setBlock(String(key))}
        >
          <Label className="sr-only">Jenis teks</Label>
          <Select.Trigger className="min-h-8 py-1 text-xs font-semibold">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {BLOCK_TYPES.map((t) => (
                <ListBox.Item key={t.value} id={t.value} textValue={t.label}>
                  <span className={t.preview}>{t.label}</span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Divider />

        <ToolButton label="Tebal (Ctrl+B)" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-extrabold">B</span>
        </ToolButton>
        <ToolButton label="Miring (Ctrl+I)" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="font-serif italic">I</span>
        </ToolButton>
        <ToolButton label="Garis bawah (Ctrl+U)" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline underline-offset-2">U</span>
        </ToolButton>
        <ToolButton label="Coret" active={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolButton>
        <Divider />

        <ToolButton label="Daftar berpoin" active={s.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <Svg name="bulletList" />
        </ToolButton>
        <ToolButton label="Daftar bernomor" active={s.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <Svg name="orderedList" />
        </ToolButton>
        <ToolButton label="Kutipan" active={s.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Svg name="quote" />
        </ToolButton>
        <Divider />

        <ToolButton label="Rata kiri" active={!s.alignCenter && !s.alignRight} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <Svg name="alignLeft" />
        </ToolButton>
        <ToolButton label="Rata tengah" active={s.alignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <Svg name="alignCenter" />
        </ToolButton>
        <ToolButton label="Rata kanan" active={s.alignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <Svg name="alignRight" />
        </ToolButton>
        <Divider />

        <ToolButton label="Link" active={s.link || linkDraft !== null} onClick={openLink}>
          <Svg name="link" />
        </ToolButton>
        <ToolButton label="Garis pemisah" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Svg name="rule" />
        </ToolButton>
        <ToolButton label="Hapus format" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Svg name="clear" />
        </ToolButton>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onPickImage}
          disabled={uploading}
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-md bg-[#C7974C]/12 px-2 text-xs font-semibold text-[#8a6a32] transition hover:bg-[#C7974C]/20 disabled:opacity-60"
        >
          <Svg name="image" />
          {uploading ? "Mengupload..." : "Gambar"}
        </button>
      </div>

      {linkDraft !== null && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2">
          <span className="text-xs font-semibold text-slate-600">Link ke:</span>
          <input
            autoFocus
            type="url"
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkDraft(null);
            }}
            aria-label="Alamat link"
            placeholder="https://..."
            className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-[#C7974C] focus:ring-4 focus:ring-[#C7974C]/15"
          />
          <button
            type="button"
            onClick={applyLink}
            className="h-8 rounded-md bg-[#0f1932] px-3 text-xs font-semibold text-white hover:bg-[#1b2a4d]"
          >
            Simpan link
          </button>
          {s.link && (
            <button
              type="button"
              onClick={removeLink}
              className="h-8 rounded-md px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Hapus link
            </button>
          )}
          <button
            type="button"
            onClick={() => setLinkDraft(null)}
            className="h-8 rounded-md px-2.5 text-xs font-semibold text-slate-500 hover:bg-white"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}

// Images pasted from Word point at local files (file:///...) that browsers can't load
const stripLocalImages = (html: string) => html.replace(/<img[^>]+src=["']file:[^>]*>/gi, "");

export function RichTextEditor({ value, onChange, onUploadImage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // editorProps handlers are created once, so they reach the editor through refs
  const editorRef = useRef<Editor | null>(null);
  const uploadRef = useRef(onUploadImage);

  const editor = useEditor({
    // Required with SSR (Next.js): render on the client only
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Mulai tulis artikel di sini, atau tempel (paste) dari Word..." }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "article-content min-h-[420px] px-6 py-5 text-[15px] outline-none",
        "aria-label": "Konten artikel",
      },
      transformPastedHTML: stripLocalImages,
      // Pasted or dropped image files are uploaded, then inserted
      handlePaste: (_view, event) => uploadFromEvent(event.clipboardData?.files),
      handleDrop: (_view, event) => uploadFromEvent((event as DragEvent).dataTransfer?.files),
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
    uploadRef.current = onUploadImage;
  });

  function uploadFromEvent(files?: FileList | null) {
    const images = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!images.length) return false;
    images.forEach((file) => insertImage(file));
    return true;
  }

  async function insertImage(file?: File) {
    if (!file || !editorRef.current) return;
    setUploading(true);
    try {
      const src = await uploadRef.current(file);
      // Insert the image plus an empty paragraph so the cursor lands below it;
      // otherwise the image stays selected and the next keystroke replaces it
      editorRef.current
        ?.chain()
        .focus()
        .insertContent([
          { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } },
          { type: "paragraph" },
        ])
        .run();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!editor) {
    return <div className="min-h-[470px] animate-pulse bg-slate-50" />;
  }

  return (
    <div>
      <Toolbar editor={editor} uploading={uploading} onPickImage={() => fileRef.current?.click()} />
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => insertImage(e.target.files?.[0])}
      />
    </div>
  );
}
