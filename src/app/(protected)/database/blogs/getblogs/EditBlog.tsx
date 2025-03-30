'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from "next/dynamic";
import {
    convertToRaw,
    convertFromRaw,
    EditorState,
    RichUtils,
    ContentState,
    DraftInlineStyleType,
} from "draft-js";
const Editor = dynamic(() => import("draft-js").then((mod) => mod.Editor), {
    ssr: false,
});

import "draft-js/dist/Draft.css";

type CustomInlineStyleType = DraftInlineStyleType |
    'STRIKETHROUGH' | 'SUPERSCRIPT' | 'SUBSCRIPT' |
    'FONTSIZE-12' | 'FONTSIZE-14' | 'FONTSIZE-16' | 'FONTSIZE-18' | 'FONTSIZE-20' | 'FONTSIZE-24' | 'FONTSIZE-30' | 'FONTSIZE-36' |
    'FONT-ARIAL' | 'FONT-TIMES' | 'FONT-COURIER' | 'FONT-GEORGIA' | 'FONT-VERDANA' | 'FONT-ROBOTO' |
    'COLOR-BLACK' | 'COLOR-RED' | 'COLOR-BLUE' | 'COLOR-GREEN' | 'COLOR-PURPLE' | 'COLOR-ORANGE' |
    'BG-YELLOW' | 'BG-CYAN' | 'BG-LIME' | 'BG-PINK' | 'BG-LIGHTBLUE' | 'BG-LIGHTGRAY';

// Custom style map
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
};

interface Blog {
    id: number;
    title: string;
    content: string;
    author: string;
    category: string;
    created_at: string;
}

interface EditBlogProps {
    blog: Blog;
    onSave: (updatedBlog: Blog) => void;
    onCancel: () => void;
}

const EditBlog: React.FC<EditBlogProps> = ({ blog, onSave, onCancel }) => {
    const [selectedBlogEditorState, setSelectedBlogEditorState] = useState<EditorState>(() => {
        try {
            const contentString = blog.content || "";
            const parsedContent = JSON.parse(contentString);
            const contentState = convertFromRaw(parsedContent);
            return EditorState.createWithContent(contentState);
        } catch (error) {
            console.error("Error parsing blog content:", error);
            const contentState = ContentState.createFromText(blog.content || "");
            return EditorState.createWithContent(contentState);
        }
    });

    const [editedBlog, setEditedBlog] = useState<Blog>({ ...blog });
    const [loading, setLoading] = useState<boolean>(false);

    // Rich Text Editing Helper Functions (similar to previous implementation)
    const toggleInlineStyle = (style: CustomInlineStyleType) => {
        const newEditorState = RichUtils.toggleInlineStyle(selectedBlogEditorState, style);
        setSelectedBlogEditorState(newEditorState);
    };

    const toggleBlockType = (blockType: string) => {
        const newEditorState = RichUtils.toggleBlockType(selectedBlogEditorState, blockType);
        setSelectedBlogEditorState(newEditorState);
    };

    const applyInlineStyle = (prefix: string, value: string) => {
        // Remove existing styles with the same prefix
        const currentStyles = selectedBlogEditorState.getCurrentInlineStyle().toArray();
        let newState = selectedBlogEditorState;

        currentStyles.forEach((style) => {
            if (style.startsWith(prefix)) {
                newState = RichUtils.toggleInlineStyle(newState, style as CustomInlineStyleType);
            }
        });

        // Apply the new style
        const styleToApply = `${prefix}-${value}` as CustomInlineStyleType;
        setSelectedBlogEditorState(RichUtils.toggleInlineStyle(newState, styleToApply));
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

    // Helper function to determine if a style is currently active
    const hasInlineStyle = (prefix: string, value: string): boolean => {
        const styleToCheck = prefix ? `${prefix}-${value}` : value;
        return selectedBlogEditorState.getCurrentInlineStyle().has(styleToCheck);
    };

    const isBlockType = (blockType: string): boolean => {
        const selection = selectedBlogEditorState.getSelection();
        const blockKey = selection.getStartKey();
        const currentBlockType = selectedBlogEditorState
            .getCurrentContent()
            .getBlockForKey(blockKey)
            .getType();
        return currentBlockType === blockType;
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            // Convert EditorState to raw JSON
            const contentRaw = JSON.stringify(convertToRaw(selectedBlogEditorState.getCurrentContent()));

            const updatedBlog = {
                ...editedBlog,
                content: contentRaw
            };

            onSave(updatedBlog);
        } catch (error) {
            console.error("Error updating blog:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <div className="mb-4">
                <label htmlFor="title" className="block font-small text-gray-700">
                    Blog Title:
                </label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editedBlog.title}
                    onChange={(e) => setEditedBlog(prev => ({ ...prev, title: e.target.value }))}
                />
            </div>

            <div className="border border-gray-300 rounded">
                {/* Formatting toolbar (same as previous implementation) */}
                <div className="bg-gray-100 p-2 border-b border-gray-300">
                    {/* Text formatting buttons */}
                    {/* (Keep the existing toolbar implementation from the previous component) */}
                    {/* ... existing toolbar code ... */}
                </div>

                {/* Editor area */}
                <div className="min-h-[300px] border p-3 bg-white text-black">
                    {Editor && (
                        <Editor
                            placeholder="Enter Content here..."
                            editorState={selectedBlogEditorState}
                            onChange={setSelectedBlogEditorState}
                            customStyleMap={customStyleMap}
                        />
                    )}
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="author" className="block font-small text-gray-700">
                    Author:
                </label>
                <input
                    type="text"
                    className="w-full p-2 mt-2 border rounded"
                    value={editedBlog.author}
                    onChange={(e) => setEditedBlog(prev => ({ ...prev, author: e.target.value }))}
                />
            </div>

            <div className="mt-4">
                <label htmlFor="category" className="block font-small text-gray-700">
                    Category:
                </label>
                <input
                    type="text"
                    className="w-full p-2 mt-2 border rounded"
                    value={editedBlog.category}
                    onChange={(e) => setEditedBlog(prev => ({ ...prev, category: e.target.value }))}
                />
            </div>

            <div className="mt-4 flex space-x-2">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default EditBlog;