// src/app/[protected]/super-admin/database/news/createnews/page.tsx

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
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
  Type,
  Superscript as SuperIcon,
  Subscript as SubIcon,
  Highlighter,
} from "lucide-react";

interface NewsForm {
  title: string;
  image_url: string;
  content: string;
}

const CreateNews: React.FC = () => {
  const [news, setNews] = useState<NewsForm>({
    title: "",
    image_url: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const router = useRouter();

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
    content: news.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNews((prev) => ({ ...prev, content: html }));
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNews({ ...news, [e.target.name]: e.target.value });
  };

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
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: news.title,
          image_url: news.image_url,
          content: news.content,
          action: "create",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to create news");
        throw new Error(data.message || "Failed to create news");
      }

      setMessage(data.message || "News created successfully!");
      toast.success(data.message || "News created successfully!");

      setNews({
        title: "",
        image_url: "",
        content: "",
      });

      editor?.commands.setContent("");

      setTimeout(() => {
        router.push(`/super-admin/database/news`);
      }, 1000);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!editor) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl -mx-6 -mt-6 mb-6">
        <h3 className="text-3xl font-bold text-center">Create News Article</h3>
        <p className="text-center mt-2 text-blue-100">
          Craft engaging news content with our advanced editor
        </p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block font-semibold text-gray-700 mb-2"
            >
              Article Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter a compelling news title..."
              value={news.title}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="image_url"
              className="block font-semibold text-gray-700 mb-2"
            >
              Featured Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              placeholder="https://example.com/image.jpg"
              value={news.image_url}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {news.image_url && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Image Preview:</h4>
            <img
              src={news.image_url}
              alt="Featured preview"
              className="max-w-sm h-48 object-cover rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Article Content
          </label>

          {/* Toolbar */}
          <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3">
            <div className="flex flex-wrap gap-2">
              {/* Text Formatting */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("bold") ? "bg-blue-200 text-blue-800" : ""
                  }`}
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("italic") ? "bg-blue-200 text-blue-800" : ""
                  }`}
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("underline")
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Underline"
                >
                  <UnderlineIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("strike") ? "bg-blue-200 text-blue-800" : ""
                  }`}
                  title="Strikethrough"
                >
                  <Strikethrough size={16} />
                </button>
              </div>

              {/* Script */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleSuperscript().run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("superscript")
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Superscript"
                >
                  <SuperIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleSubscript().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("subscript")
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Subscript"
                >
                  <SubIcon size={16} />
                </button>
              </div>

              {/* Headers */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("heading", { level: 1 })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Heading 1"
                >
                  <Heading1 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("heading", { level: 2 })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Heading 2"
                >
                  <Heading2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("heading", { level: 3 })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Heading 3"
                >
                  <Heading3 size={16} />
                </button>
              </div>

              {/* Lists */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("bulletList")
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("orderedList")
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
              </div>

              {/* Alignment */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: "left" })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: "center" })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: "right" })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive({ textAlign: "justify" })
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Justify"
                >
                  <AlignJustify size={16} />
                </button>
              </div>

              {/* Colors */}
              <div className="flex gap-1 border-r border-gray-300 pr-2 relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Text Color"
                >
                  <Palette size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Highlight"
                >
                  <Highlighter size={16} />
                </button>

                {showColorPicker && (
                  <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10">
                    <div className="grid grid-cols-6 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {showHighlightPicker && (
                  <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10">
                    <div className="grid grid-cols-4 gap-1">
                      {highlightColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            editor
                              .chain()
                              .focus()
                              .toggleHighlight({ color })
                              .run();
                            setShowHighlightPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Media & Other */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={addLink}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("link") ? "bg-blue-200 text-blue-800" : ""
                  }`}
                  title="Add Link"
                >
                  <LinkIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={addImage}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Add Image"
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={addTable}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Add Table"
                >
                  <TableIcon size={16} />
                </button>
              </div>

              {/* Quote & Code */}
              <div className="flex gap-1 border-r border-gray-300 pr-2">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("blockquote")
                      ? "bg-blue-200 text-blue-800"
                      : ""
                  }`}
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    editor.isActive("code") ? "bg-blue-200 text-blue-800" : ""
                  }`}
                  title="Inline Code"
                >
                  <Code size={16} />
                </button>
              </div>

              {/* Undo/Redo */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white h-72 overflow-y-scroll">
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Live Preview
          </h4>
          <div
            className="prose prose-lg max-w-none bg-white p-6 rounded border min-h-24"
            dangerouslySetInnerHTML={{
              __html:
                news.content ||
                '<p class="text-gray-400">Your content will appear here as you type...</p>',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !news.title.trim() ||
            !news.image_url.trim() ||
            !news.content.trim()
          }
          className="w-full p-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Article...
            </span>
          ) : (
            "Publish News Article"
          )}
        </button>
      </form>

      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          padding: 1.5rem;
          outline: none;
          min-height: 300px;
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
    </div>
  );
};

export default CreateNews;
