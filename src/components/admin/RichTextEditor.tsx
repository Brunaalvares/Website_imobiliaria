"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { EDITOR_FONT_FAMILIES, EDITOR_FONT_SIZES } from "@/lib/constants";
import { FontSize } from "@/lib/tiptap-font-size";
import { prepareImageForUpload } from "@/lib/image-client";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-navy transition hover:bg-ice disabled:opacity-40",
        active && "bg-navy text-white hover:bg-navy-dark",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "blog-image" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder: placeholder || "Escreva ou cole o artigo aqui...",
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-editor-content min-h-[420px] px-5 py-4 outline-none",
      },
      transformPastedHTML(html) {
        // Keep structure from ChatGPT/Word/Docs; strip unsafe bits.
        return sanitizeBlogHtml(html)
          .replace(/<\/?o:p[^>]*>/gi, "")
          .replace(/class="?Mso[^"]*"/gi, "");
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="rounded-2xl border border-gray-light bg-white p-8 text-sm text-gray-muted">Carregando editor...</div>;
  }

  async function uploadInlineImage(file: File) {
    if (!editor) return;
    const prepared = await prepareImageForUpload(file);
    const fd = new FormData();
    fd.append("file", prepared);
    fd.append("folder", "blog");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no upload");
    const alt = window.prompt("Texto alternativo da imagem (SEO/acessibilidade):", file.name) || "";
    editor.chain().focus().setImage({ src: data.url, alt }).run();
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", previous || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function insertTable() {
    if (!editor) return;
    const rows = Number(window.prompt("Número de linhas:", "3") || "3");
    const cols = Number(window.prompt("Número de colunas:", "3") || "3");
    if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows < 1 || cols < 1) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  }

  const words = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-[var(--shadow)]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-gray-light bg-white/95 p-2 backdrop-blur">
        <ToolbarButton label="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 size={16} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Sublinhado"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Tachado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Destaque"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#FFF3B0" }).run()}
        >
          <Highlighter size={16} />
        </ToolbarButton>
        <label className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-navy hover:bg-ice" title="Cor do texto">
          Cor
          <input
            type="color"
            className="h-5 w-5 cursor-pointer border-0 bg-transparent"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
        <select
          className="h-8 rounded-lg border border-gray-light bg-white px-2 text-xs text-navy"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          aria-label="Família tipográfica"
        >
          <option value="">Fonte</option>
          {EDITOR_FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded-lg border border-gray-light bg-white px-2 text-xs text-navy"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(v).run();
          }}
          aria-label="Tamanho da fonte"
        >
          <option value="">Tamanho</option>
          {EDITOR_FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton
          label="Título H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Título H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Título H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton label="Esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Centro"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Direita"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Justificado"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify size={16} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton label="Tarefas" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListTodo size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton label="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={16} />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Tabela" onClick={insertTable}>
          <TableIcon size={16} />
        </ToolbarButton>
        <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-navy hover:bg-ice" title="Inserir imagem">
          <ImageIcon size={16} />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadInlineImage(file).catch((err) => window.alert(err.message));
              e.currentTarget.value = "";
            }}
          />
        </label>
        <ToolbarButton label="Limpar formatação" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting size={16} />
        </ToolbarButton>
        {editor.isActive("table") ? (
          <div className="ml-1 flex flex-wrap gap-1">
            <button type="button" className="rounded-lg border border-gray-light px-2 py-1 text-[11px]" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              + Coluna
            </button>
            <button type="button" className="rounded-lg border border-gray-light px-2 py-1 text-[11px]" onClick={() => editor.chain().focus().deleteColumn().run()}>
              − Coluna
            </button>
            <button type="button" className="rounded-lg border border-gray-light px-2 py-1 text-[11px]" onClick={() => editor.chain().focus().addRowAfter().run()}>
              + Linha
            </button>
            <button type="button" className="rounded-lg border border-gray-light px-2 py-1 text-[11px]" onClick={() => editor.chain().focus().deleteRow().run()}>
              − Linha
            </button>
            <button type="button" className="rounded-lg border border-gray-light px-2 py-1 text-[11px]" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
              Cabeçalho
            </button>
            <button type="button" className="rounded-lg border border-gray-light px-2 py-1 text-[11px]" onClick={() => editor.chain().focus().deleteTable().run()}>
              Excluir tabela
            </button>
          </div>
        ) : null}
      </div>
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-gray-light px-4 py-2 text-xs text-gray-muted">
        <span>Cole conteúdos do ChatGPT, Word ou Docs — a formatação principal é preservada.</span>
        <span>{words} palavras · ~{Math.max(1, Math.ceil(words / 200))} min</span>
      </div>
    </div>
  );
}
