"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  convertToRaw,
  EditorState,
  RichUtils,
  Modifier,
  DraftInlineStyleType,
} from "draft-js";

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import("draft-js").then((mod) => mod.Editor), {
  ssr: false,
});

import "draft-js/dist/Draft.css";

// Extended type for custom inline styles
type CustomInlineStyleType =
  | DraftInlineStyleType
  | "STRIKETHROUGH"
  | "SUPERSCRIPT"
  | "SUBSCRIPT"
  | "FONTSIZE-12"
  | "FONTSIZE-14"
  | "FONTSIZE-16"
  | "FONTSIZE-18"
  | "FONTSIZE-20"
  | "FONTSIZE-24"
  | "FONTSIZE-30"
  | "FONTSIZE-36"
  | "FONT-ARIAL"
  | "FONT-TIMES"
  | "FONT-COURIER"
  | "FONT-GEORGIA"
  | "FONT-VERDANA"
  | "FONT-ROBOTO"
  | "COLOR-BLACK"
  | "COLOR-RED"
  | "COLOR-BLUE"
  | "COLOR-GREEN"
  | "COLOR-PURPLE"
  | "COLOR-ORANGE"
  | "BG-YELLOW"
  | "BG-CYAN"
  | "BG-LIME"
  | "BG-PINK"
  | "BG-LIGHTBLUE"
  | "BG-LIGHTGRAY";

interface NewsForm {
  title: string;
  image_url: string;
  content: EditorState;
}

const customStyleMap: Record<string, React.CSSProperties> = {
  // Font sizes
  "FONTSIZE-12": { fontSize: "12px" },
  "FONTSIZE-14": { fontSize: "14px" },
  "FONTSIZE-16": { fontSize: "16px" },
  "FONTSIZE-18": { fontSize: "18px" },
  "FONTSIZE-20": { fontSize: "20px" },
  "FONTSIZE-24": { fontSize: "24px" },
  "FONTSIZE-30": { fontSize: "30px" },
  "FONTSIZE-36": { fontSize: "36px" },
  // Text formatting
  BOLD: { fontWeight: "bold" },
  ITALIC: { fontStyle: "italic" },
  UNDERLINE: { textDecoration: "underline" },
  STRIKETHROUGH: { textDecoration: "line-through" },
  SUPERSCRIPT: { verticalAlign: "super", fontSize: "smaller" },
  SUBSCRIPT: { verticalAlign: "sub", fontSize: "smaller" },
  // Font families
  "FONT-ARIAL": { fontFamily: "Arial, sans-serif" },
  "FONT-TIMES": { fontFamily: "Times New Roman, serif" },
  "FONT-COURIER": { fontFamily: "Courier New, monospace" },
  "FONT-GEORGIA": { fontFamily: "Georgia, serif" },
  "FONT-VERDANA": { fontFamily: "Verdana, sans-serif" },
  "FONT-ROBOTO": { fontFamily: "Roboto, sans-serif" },
  // Text colors
  "COLOR-BLACK": { color: "#000000" },
  "COLOR-RED": { color: "#FF0000" },
  "COLOR-BLUE": { color: "#0000FF" },
  "COLOR-GREEN": { color: "#008000" },
  "COLOR-PURPLE": { color: "#800080" },
  "COLOR-ORANGE": { color: "#FFA500" },
  // Background colors
  "BG-YELLOW": { backgroundColor: "#FFFF00" },
  "BG-CYAN": { backgroundColor: "#00FFFF" },
  "BG-LIME": { backgroundColor: "#00FF00" },
  "BG-PINK": { backgroundColor: "#FFC0CB" },
  "BG-LIGHTBLUE": { backgroundColor: "#ADD8E6" },
  "BG-LIGHTGRAY": { backgroundColor: "#D3D3D3" },
  // Text alignment is handled by block styling
};

const CreateNews: React.FC = () => {
  const [news, setNews] = useState<NewsForm>({
    title: "",
    image_url: "",
    content: EditorState.createEmpty(),
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNews({ ...news, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (editorState: EditorState) => {
    setNews({ ...news, content: editorState });
  };

  const toggleInlineStyle = (style: CustomInlineStyleType) => {
    handleEditorChange(RichUtils.toggleInlineStyle(news.content, style));
  };

  const toggleBlockType = (blockType: string) => {
    handleEditorChange(RichUtils.toggleBlockType(news.content, blockType));
  };

  const applyInlineStyle = (prefix: string, value: string) => {
    // Remove existing styles with the same prefix
    const currentStyles = news.content.getCurrentInlineStyle().toArray();
    let newState = news.content;

    currentStyles.forEach((style) => {
      if (style.startsWith(prefix)) {
        newState = RichUtils.toggleInlineStyle(
          newState,
          style as CustomInlineStyleType
        );
      }
    });

    // Apply the new style
    const styleToApply = `${prefix}-${value}` as CustomInlineStyleType;
    handleEditorChange(RichUtils.toggleInlineStyle(newState, styleToApply));
  };

  const applyFontSize = (fontSize: string) => {
    applyInlineStyle("FONTSIZE", fontSize);
  };

  const applyFontFamily = (fontFamily: string) => {
    applyInlineStyle("FONT", fontFamily);
  };

  const applyTextColor = (color: string) => {
    applyInlineStyle("COLOR", color);
  };

  const applyBackgroundColor = (color: string) => {
    applyInlineStyle("BG", color);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const contentRaw = JSON.stringify(
        convertToRaw(news.content.getCurrentContent())
      );

      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: news.title,
          image_url: news.image_url,
          content: contentRaw,
          action: "create",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create news");
      }

      setMessage(data.message || "News created successfully!");
      setNews({
        title: "",
        image_url: "",
        content: EditorState.createEmpty(),
      });
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine if a style is currently active
  const hasInlineStyle = (prefix: string, value: string): boolean => {
    const styleToCheck = prefix ? `${prefix}-${value}` : value;
    return news.content.getCurrentInlineStyle().has(styleToCheck);
  };

  const isBlockType = (blockType: string): boolean => {
    const selection = news.content.getSelection();
    const blockKey = selection.getStartKey();
    const currentBlockType = news.content
      .getCurrentContent()
      .getBlockForKey(blockKey)
      .getType();
    return currentBlockType === blockType;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Create News
      </h3>

      {message && <p className="text-green-500 text-center">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium text-gray-700">
            News Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter news title"
            value={news.title}
            onChange={handleChange}
            required
            className="w-full p-2 border text-black border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="image_url"
            className="block font-medium text-gray-700"
          >
            Image URL:
          </label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            placeholder="Enter image URL"
            value={news.image_url}
            onChange={handleChange}
            required
            className="w-full p-2 text-black border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="block font-medium text-gray-700">
            News Content:
          </label>
          <div className="border border-gray-300 rounded">
            {/* Formatting toolbar */}
            <div className="bg-gray-100 p-2 border-b border-gray-300">
              {/* Text formatting section */}
              <div className="flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    hasInlineStyle("", "BOLD") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleInlineStyle("BOLD")}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    hasInlineStyle("", "ITALIC") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleInlineStyle("ITALIC")}
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    hasInlineStyle("", "UNDERLINE")
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleInlineStyle("UNDERLINE")}
                  title="Underline"
                >
                  <span className="underline">U</span>
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    hasInlineStyle("", "STRIKETHROUGH")
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleInlineStyle("STRIKETHROUGH")}
                  title="Strikethrough"
                >
                  <span className="line-through">S</span>
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    hasInlineStyle("", "SUPERSCRIPT")
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleInlineStyle("SUPERSCRIPT")}
                  title="Superscript"
                >
                  x<sup>2</sup>
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    hasInlineStyle("", "SUBSCRIPT")
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleInlineStyle("SUBSCRIPT")}
                  title="Subscript"
                >
                  H<sub>2</sub>O
                </button>

                {/* Block type controls */}
                <div className="border-l border-gray-300 mx-1"></div>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("header-one") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("header-one")}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("header-two") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("header-two")}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("header-three") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("header-three")}
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("unordered-list-item")
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("unordered-list-item")}
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("ordered-list-item")
                      ? "bg-gray-400"
                      : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("ordered-list-item")}
                  title="Numbered List"
                >
                  1. List
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("blockquote") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("blockquote")}
                  title="Quote"
                >
                  " Quote
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("code-block") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("code-block")}
                  title="Code Block"
                >
                  {"</>"}
                </button>
              </div>

              {/* Font control section */}
              <div className="flex flex-wrap gap-1 mb-2">
                <select
                  className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs"
                  onChange={(e) => applyFontFamily(e.target.value)}
                  value=""
                >
                  <option value="" disabled>
                    Font Family
                  </option>
                  <option value="ARIAL">Arial</option>
                  <option value="TIMES">Times New Roman</option>
                  <option value="COURIER">Courier New</option>
                  <option value="GEORGIA">Georgia</option>
                  <option value="VERDANA">Verdana</option>
                  <option value="ROBOTO">Roboto</option>
                </select>

                <select
                  className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs"
                  onChange={(e) => applyFontSize(e.target.value)}
                  value=""
                >
                  <option value="" disabled>
                    Font Size
                  </option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="30">30px</option>
                  <option value="36">36px</option>
                </select>

                <div className="border-l border-gray-300 mx-1"></div>

                <select
                  className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs"
                  onChange={(e) => applyTextColor(e.target.value)}
                  value=""
                >
                  <option value="" disabled>
                    Text Color
                  </option>
                  <option value="BLACK">Black</option>
                  <option value="RED">Red</option>
                  <option value="BLUE">Blue</option>
                  <option value="GREEN">Green</option>
                  <option value="PURPLE">Purple</option>
                  <option value="ORANGE">Orange</option>
                </select>

                <select
                  className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs"
                  onChange={(e) => applyBackgroundColor(e.target.value)}
                  value=""
                >
                  <option value="" disabled>
                    Background
                  </option>
                  <option value="YELLOW">Yellow</option>
                  <option value="CYAN">Cyan</option>
                  <option value="LIME">Lime</option>
                  <option value="PINK">Pink</option>
                  <option value="LIGHTBLUE">Light Blue</option>
                  <option value="LIGHTGRAY">Light Gray</option>
                </select>
              </div>

              {/* Text alignment section */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("left") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("left")}
                  title="Align Left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("center") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("center")}
                  title="Align Center"
                >
                  ↔
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("right") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("right")}
                  title="Align Right"
                >
                  →
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 ${
                    isBlockType("justify") ? "bg-gray-400" : "bg-gray-200"
                  } hover:bg-gray-300 rounded text-xs`}
                  onClick={() => toggleBlockType("justify")}
                  title="Justify"
                >
                  ⇌
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div className="min-h-[300px] border p-3 bg-white text-black">
              {Editor && (
                <Editor
                  placeholder="Enter news content here..."
                  editorState={news.content}
                  onChange={handleEditorChange}
                  customStyleMap={customStyleMap}
                />
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 text-white bg-blue-600 hover:bg-blue-700 rounded mt-4 transition"
        >
          {loading ? "Creating..." : "Create News"}
        </button>
      </form>
    </div>
  );
};

export default CreateNews;
