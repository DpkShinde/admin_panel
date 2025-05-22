"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you have sonner installed for toasts

// Tiptap Editor Imports
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

// Lucide React Icons
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
  Type, // Type for Font Family if needed
  Superscript as SuperIcon,
  Subscript as SubIcon,
  Highlighter,
} from "lucide-react";

interface News {
  id: number;
  title: string;
  content: string; // This will now hold HTML content
  image_url: string;
  created_at: string;
}

const EditDeleteNews: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState(""); // Will hold HTML content for editing
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false); // For save/delete operations

  const router = useRouter();

  // Define colors and font sizes for the editor toolbar
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

  // Tiptap Editor instance for the Dialog
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
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
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: editContent, // Bind to editContent state
    onUpdate: ({ editor }) => {
      setEditContent(editor.getHTML()); // Update state with HTML from editor
    },
    editorProps: {
      attributes: {
        // Apply styling consistent with CreateNews
        class:
          "prose prose-lg max-w-none min-h-[200px] p-4 focus:outline-none border border-[--border-color-default] rounded-b-lg",
      },
    },
  });

  // Use useEffect to sync editor content when dialog opens or selectedNews changes
  useEffect(() => {
    if (selectedNews && isEdit && editor) {
      // Set editor content with the HTML from selectedNews
      editor.commands.setContent(selectedNews.content || "");
      setEditTitle(selectedNews.title);
      setEditImageUrl(selectedNews.image_url);
    } else if (!dialogOpen && editor) {
      // Clear editor content when dialog closes if editor is always mounted
      editor.commands.setContent("");
    }
  }, [selectedNews, isEdit, editor, dialogOpen]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news/all");
      const data = await res.json();
      if (Array.isArray(data)) setNewsList(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to fetch news articles.");
    }
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setIsEdit(true);
    setDialogOpen(true);
    // editContent will be set by the useEffect when the editor is ready
  };

  const handleDelete = (news: News) => {
    setSelectedNews(news);
    setIsEdit(false);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedNews(null);
    setDialogOpen(false);
    setEditTitle("");
    setEditContent(""); // Clear content when dialog closes
    setEditImageUrl("");
    // editor?.destroy(); // If you want to destroy and re-create the editor, manage this carefully
  };

  const confirmDelete = async () => {
    if (!selectedNews) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${selectedNews.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete news");
      }
      setNewsList(newsList.filter((n) => n.id !== selectedNews.id));
      toast.success("News article deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error deleting news article.");
      console.error("Error deleting news:", error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleSave = async () => {
    if (!selectedNews) return;
    setLoading(true);

    // The content is already HTML from the Tiptap editor
    const body = {
      title: editTitle,
      content: editContent, // This is already HTML
      image_url: editImageUrl,
    };

    try {
      const res = await fetch(`/api/news/${selectedNews.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update news");
      }

      setNewsList(
        newsList.map((n) => (n.id === selectedNews.id ? { ...n, ...body } : n))
      );
      toast.success("News article updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating news article.");
      console.error("Error updating news:", error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // Tiptap Toolbar handlers
  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
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

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[--text-color-dark]">
          Manage News
        </h1>
        <Button
          onClick={() => router.push("/super-admin/database/news/createnews")}
          className="bg-gradient-to-r from-[--button-bg-gradient-from] to-[--button-bg-gradient-to] hover:from-[--button-bg-gradient-hover-from] hover:to-[--button-bg-gradient-hover-to] text-[--button-text-color] px-6 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Add News
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((news) => (
          <Card
            key={news.id}
            className="overflow-hidden bg-[--bg-color-card] shadow-md rounded-lg"
          >
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold line-clamp-2 h-14 text-[--text-color-dark]">
                {news.title}
              </h2>
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-40 object-cover my-2 rounded-md"
              />
              <div
                // Directly render HTML content
                className="text-sm text-[--text-color-default] h-24 overflow-y-scroll"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
              <p className="text-xs text-[--text-color-light] mt-2">
                {new Date(news.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                  onClick={() => handleEdit(news)}
                >
                  Edit
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                  onClick={() => handleDelete(news)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[--text-color-dark]">
              {isEdit ? "Edit News Article" : "Delete News Article"}
            </DialogTitle>
          </DialogHeader>

          {isEdit ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="editTitle"
                  className="block font-semibold text-[--text-color-default] mb-2"
                >
                  Article Title
                </label>
                <input
                  type="text"
                  id="editTitle"
                  className="w-full p-3 border-2 text-black border-[--border-color-default] rounded-lg focus:ring-2 focus:ring-[--theme-primary-500] focus:border-[--theme-primary-500] transition-all duration-200"
                  placeholder="Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="editImageUrl"
                  className="block font-semibold text-[--text-color-default] mb-2"
                >
                  Featured Image URL
                </label>
                <input
                  type="url"
                  id="editImageUrl"
                  className="w-full p-3 border-2 text-black border-[--border-color-default] rounded-lg focus:ring-2 focus:ring-[--theme-primary-500] focus:border-[--theme-primary-500] transition-all duration-200"
                  placeholder="Image URL"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
              </div>
              {editImageUrl && (
                <div className="bg-[--bg-color-light] p-4 rounded-lg">
                  <h4 className="font-semibold text-[--text-color-default] mb-2">
                    Image Preview:
                  </h4>
                  <img
                    src={editImageUrl}
                    alt="Featured preview"
                    className="max-w-sm h-48 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-[--text-color-default] mb-2">
                  Article Content
                </label>
                {/* Tiptap Toolbar for the Dialog Editor */}
                <div className="border border-[--border-color-default] rounded-t-lg bg-[--bg-color-toolbar] p-3">
                  <div className="flex flex-wrap gap-2">
                    {/* Text Formatting */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("bold")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Bold"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("italic")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Italic"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleUnderline().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("underline")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Underline"
                      >
                        <UnderlineIcon size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleStrike().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("strike")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Strikethrough"
                      >
                        <Strikethrough size={16} />
                      </button>
                    </div>

                    {/* Script */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleSuperscript().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("superscript")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Superscript"
                      >
                        <SuperIcon size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleSubscript().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("subscript")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Subscript"
                      >
                        <SubIcon size={16} />
                      </button>
                    </div>

                    {/* Headers */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("heading", { level: 1 })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Heading 1"
                      >
                        <Heading1 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("heading", { level: 2 })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Heading 2"
                      >
                        <Heading2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("heading", { level: 3 })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Heading 3"
                      >
                        <Heading3 size={16} />
                      </button>
                    </div>

                    {/* Lists */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleBulletList().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("bulletList")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Bullet List"
                      >
                        <List size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleOrderedList().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("orderedList")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Numbered List"
                      >
                        <ListOrdered size={16} />
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("left").run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive({ textAlign: "left" })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("center").run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive({ textAlign: "center" })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("right").run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive({ textAlign: "right" })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Align Right"
                      >
                        <AlignRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("justify").run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive({ textAlign: "justify" })
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Justify"
                      >
                        <AlignJustify size={16} />
                      </button>
                    </div>

                    {/* Colors */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2 relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors"
                        title="Text Color"
                      >
                        <Palette size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowHighlightPicker(!showHighlightPicker)
                        }
                        className="p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors"
                        title="Highlight"
                      >
                        <Highlighter size={16} />
                      </button>

                      {showColorPicker && (
                        <div className="absolute top-12 left-0 bg-[var(--bg-color-card)] border border-[--border-color-default] rounded-lg p-2 shadow-lg z-10">
                          <div className="grid grid-cols-6 gap-1">
                            {colors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-6 h-6 rounded border border-[--border-color-light] hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  editor?.chain().focus().setColor(color).run();
                                  setShowColorPicker(false);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {showHighlightPicker && (
                        <div className="absolute top-12 left-0 bg-[var(--bg-color-card)] border border-[--border-color-default] rounded-lg p-2 shadow-lg z-10">
                          <div className="grid grid-cols-4 gap-1">
                            {highlightColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-6 h-6 rounded border border-[--border-color-light] hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  editor
                                    ?.chain()
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
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={addLink}
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("link")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Add Link"
                      >
                        <LinkIcon size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={addImage}
                        className="p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors"
                        title="Add Image"
                      >
                        <ImageIcon size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={addTable}
                        className="p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors"
                        title="Add Table"
                      >
                        <TableIcon size={16} />
                      </button>
                    </div>

                    {/* Quote & Code */}
                    <div className="flex gap-1 border-r border-[--border-color-light] pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleBlockquote().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("blockquote")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Blockquote"
                      >
                        <Quote size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          editor?.chain().focus().toggleCodeBlock().run()
                        }
                        className={`p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors ${
                          editor?.isActive("codeBlock")
                            ? "bg-[--toolbar-button-active-bg] text-[--toolbar-button-active-text]"
                            : ""
                        }`}
                        title="Code Block"
                      >
                        <Code size={16} />
                      </button>
                    </div>

                    {/* Undo/Redo */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().undo().run()}
                        disabled={!editor?.can().undo()}
                        className="p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                      >
                        <Undo size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().redo().run()}
                        disabled={!editor?.can().redo()}
                        className="p-2 rounded hover:bg-[--toolbar-button-hover-bg] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                      >
                        <Redo size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <EditorContent editor={editor} />
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-lg text-[--text-color-default] mb-4">
                Are you sure you want to delete the news article "
                <span className="font-semibold text-[--text-color-dark]">
                  {selectedNews?.title}
                </span>
                "? This action cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2 rounded-lg text-[--button-text-color-secondary] border-[--border-color-default] hover:bg-[--hover-bg-color] transition-colors"
              disabled={loading}
            >
              Cancel
            </Button>
            {isEdit ? (
              <Button
                type="button"
                onClick={handleSave}
                className="bg-gradient-to-r from-[--button-bg-gradient-from] to-[--button-bg-gradient-to] hover:from-[--button-bg-gradient-hover-from] hover:to-[--button-bg-gradient-hover-to] text-[--button-text-color] px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDeleteNews;
