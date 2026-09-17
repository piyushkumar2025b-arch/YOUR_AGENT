import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Undo,
  Redo
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing rich content..."
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/90 text-zinc-100 flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-950 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("bold") ? "bg-indigo-600/40 text-indigo-300 font-bold" : "text-zinc-400"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("italic") ? "bg-indigo-600/40 text-indigo-300" : "text-zinc-400"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-indigo-600/40 text-indigo-300" : "text-zinc-400"
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-indigo-600/40 text-indigo-300" : "text-zinc-400"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("bulletList") ? "bg-indigo-600/40 text-indigo-300" : "text-zinc-400"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("orderedList") ? "bg-indigo-600/40 text-indigo-300" : "text-zinc-400"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
            editor.isActive("codeBlock") ? "bg-indigo-600/40 text-indigo-300" : "text-zinc-400"
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 min-h-[160px] prose prose-invert max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
