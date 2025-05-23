"use client";

import React, { useState, useCallback, useEffect } from "react"; // Import useEffect
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import FontFamily from "@tiptap/extension-font-family";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Palette,
  Superscript as SuperIcon,
  Subscript as SubIcon,
  Highlighter,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  showPreview?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  minHeight = "300px",
  className = "",
  showPreview = true,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Subscript,
      Superscript,
      FontFamily,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none p-4 focus:outline-none`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Add this useEffect hook
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if the content has actually changed to avoid unnecessary re-renders
      editor.commands.setContent(content, false); // `false` prevents setting cursor to the end
    }
  }, [editor, content]); // Depend on editor and content prop

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addTable = useCallback(() => {
    if (editor) {
      // Ask for number of rows and columns
      const rowsInput = window.prompt("Enter number of rows:", "3");
      const colsInput = window.prompt("Enter number of columns:", "3");
      
      if (rowsInput === null || colsInput === null) {
        return; // User cancelled
      }
      
      const rows = parseInt(rowsInput, 10);
      const cols = parseInt(colsInput, 10);
      
      // Validate input
      if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        alert("Please enter valid numbers for rows and columns (minimum 1 each)");
        return;
      }
      
      // Limit maximum size to prevent performance issues
      if (rows > 20 || cols > 10) {
        alert("Maximum table size is 20 rows and 10 columns");
        return;
      }
      
      // Ask if user wants header row
      const withHeader = window.confirm("Do you want to include a header row?");
      
      editor
        .chain()
        .focus()
        .insertTable({ 
          rows, 
          cols, 
          withHeaderRow: withHeader 
        })
        .run();
    }
  }, [editor]);

  const colors = [
    "#000000",
    "#e60000",
    "#ff9900",
    "#ffff00",
    "#008a00",
    "#0066cc",
    "#9933ff",
    "#ffffff",
    "#facccc",
    "#ffebcc",
    "#ffffcc",
    "#cce8cc",
    "#cce0f5",
    "#ebd6ff",
    "#bbbbbb",
    "#f06666",
    "#ffc266",
    "#ffff66",
    "#66b266",
    "#66a3e0",
    "#c285ff",
    "#888888",
    "#a10000",
    "#b26b00",
    "#b2b200",
    "#006100",
    "#0047b2",
    "#6b24b2",
    "#444444",
    "#5c0000",
  ];

  const highlightColors = [
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#ff00ff",
    "#ffa500",
    "#ff69b4",
    "#98fb98",
    "#87ceeb",
    "#dda0dd",
    "#f0e68c",
    "#ffd700",
    "#ffb6c1",
  ];

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-300 rounded-lg bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3">
        <div className="flex flex-wrap gap-2">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </ToolbarButton>
          </div>

          {/* Script */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive("superscript")}
              title="Superscript"
            >
              <SuperIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive("subscript")}
              title="Subscript"
            >
              <SubIcon size={16} />
            </ToolbarButton>
          </div>

          {/* Headers */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              isActive={editor.isActive({ textAlign: "justify" })}
              title="Justify"
            >
              <AlignJustify size={16} />
            </ToolbarButton>
          </div>

          {/* Colors */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
            >
              <Palette size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              title="Highlight"
            >
              <Highlighter size={16} />
            </ToolbarButton>

            {showColorPicker && (
              <ColorPicker
                colors={colors}
                onColorSelect={(color) => {
                  editor.chain().focus().setColor(color).run();
                  setShowColorPicker(false);
                }}
                onClose={() => setShowColorPicker(false)}
              />
            )}

            {showHighlightPicker && (
              <ColorPicker
                colors={highlightColors}
                onColorSelect={(color) => {
                  editor.chain().focus().toggleHighlight({ color }).run();
                  setShowHighlightPicker(false);
                }}
                onClose={() => setShowHighlightPicker(false)}
                columns={4}
              />
            )}
          </div>

          {/* Media & Other */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive("link")}
              title="Add Link"
            >
              <LinkIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Add Image">
              <ImageIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={addTable} title="Insert Table">
              <TableIcon size={16} />
            </ToolbarButton>
          </div>

          {/* Quote & Code */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Inline Code"
            >
              <Code size={16} />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Undo"
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Redo"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        className="border border-t-0 border-gray-300 rounded-b-lg bg-white overflow-y-auto"
        style={{ height: minHeight }}
      >
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="mt-4 bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Live Preview
          </h4>
          <div
            className="prose prose-lg max-w-none bg-white p-6 rounded border h-80 overflow-y-scroll"
            dangerouslySetInnerHTML={{
              __html: content || `<p class="text-gray-400">${placeholder}</p>`,
            }}
          />
        </div>
      )}

      <EditorStyles />
    </div>
  );
};

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
      isActive ? "bg-blue-200 text-blue-800" : ""
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    title={title}
  >
    {children}
  </button>
);

// Color Picker Component
interface ColorPickerProps {
  colors: string[];
  onColorSelect: (color: string) => void;
  onClose: () => void;
  columns?: number;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  onColorSelect,
  onClose,
  columns = 6,
}) => (
  <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10">
    <div className={`grid grid-cols-${columns} gap-1`}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  </div>
);

// Editor Styles Component
const EditorStyles: React.FC = () => (
  <style jsx global>{`
    .tiptap-editor .ProseMirror {
      padding: 1.5rem;
      outline: none;
      font-size: 16px;
      line-height: 1.6;
      color: #374151;
    }

    .tiptap-editor .ProseMirror h1 {
      font-size: 2rem;
      font-weight: bold;
      margin: 1.5rem 0 1rem;
      color: #1f2937;
    }

    .tiptap-editor .ProseMirror h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 1.25rem 0 0.75rem;
      color: #1f2937;
    }

    .tiptap-editor .ProseMirror h3 {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 1rem 0 0.5rem;
      color: #1f2937;
    }

    .tiptap-editor .ProseMirror p {
      margin: 0.75rem 0;
    }

    .tiptap-editor .ProseMirror ul,
    .tiptap-editor .ProseMirror ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .tiptap-editor .ProseMirror blockquote {
      border-left: 4px solid #e5e7eb;
      margin: 1.5rem 0;
      padding-left: 1rem;
      font-style: italic;
      color: #6b7280;
    }

    .tiptap-editor .ProseMirror code {
      background-color: #f3f4f6;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-family: "Courier New", monospace;
    }

    .tiptap-editor .ProseMirror table {
      border-collapse: collapse;
      margin: 1rem 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;
    }

    .tiptap-editor .ProseMirror table td,
    .tiptap-editor .ProseMirror table th {
      border: 2px solid #e5e7eb;
      box-sizing: border-box;
      min-width: 1em;
      padding: 0.5rem;
      position: relative;
      vertical-align: top;
    }

    .tiptap-editor .ProseMirror table th {
      background-color: #f9fafb;
      font-weight: bold;
      text-align: left;
    }

    .tiptap-editor .ProseMirror img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    .tiptap-editor .ProseMirror a {
      color: #2563eb;
      text-decoration: underline;
    }

    .tiptap-editor .ProseMirror a:hover {
      color: #1d4ed8;
    }

    .tiptap-editor .ProseMirror mark {
      border-radius: 0.25rem;
      padding: 0.1rem 0.2rem;
    }

    .prose img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    .prose blockquote {
      border-left: 4px solid #e5e7eb;
      margin: 1.5rem 0;
      padding-left: 1rem;
      font-style: italic;
      color: #6b7280;
    }

    .prose code {
      background-color: #f3f4f6;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .prose table {
      width: 100%;
      margin: 1rem 0;
      border-collapse: collapse;
    }

    .prose table td,
    .prose table th {
      border: 1px solid #e5e7eb;
      padding: 0.5rem;
      text-align: left;
    }

    .prose table th {
      background-color: #f9fafb;
      font-weight: bold;
    }
  `}</style>
);

export default RichTextEditor;