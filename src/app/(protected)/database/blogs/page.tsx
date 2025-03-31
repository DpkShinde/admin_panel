'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import dynamic from "next/dynamic";
import {
    convertToRaw,
    convertFromRaw,
    EditorState,
    RichUtils,
    DraftInlineStyleType,
    ContentState,
} from "draft-js";
const Editor = dynamic(() => import("draft-js").then((mod) => mod.Editor), {
    ssr: false,
});

import "draft-js/dist/Draft.css";
import { useRouter } from 'next/navigation';

// Extended type for custom inline styles
type CustomInlineStyleType = DraftInlineStyleType |
    'STRIKETHROUGH' | 'SUPERSCRIPT' | 'SUBSCRIPT' |
    'FONTSIZE-12' | 'FONTSIZE-14' | 'FONTSIZE-16' | 'FONTSIZE-18' | 'FONTSIZE-20' | 'FONTSIZE-24' | 'FONTSIZE-30' | 'FONTSIZE-36' |
    'FONT-ARIAL' | 'FONT-TIMES' | 'FONT-COURIER' | 'FONT-GEORGIA' | 'FONT-VERDANA' | 'FONT-ROBOTO' |
    'COLOR-BLACK' | 'COLOR-RED' | 'COLOR-BLUE' | 'COLOR-GREEN' | 'COLOR-PURPLE' | 'COLOR-ORANGE' |
    'BG-YELLOW' | 'BG-CYAN' | 'BG-LIME' | 'BG-PINK' | 'BG-LIGHTBLUE' | 'BG-LIGHTGRAY';

interface Blog {
    id: number;
    title: string;
    content: string;
    author: string;
    category: string;
    created_at: string;
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
};

const EditDeleteBlog: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [selectedBlogEditorState, setSelectedBlogEditorState] = useState<EditorState | null>(null);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter()

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/api/blogs/all');
                if (!response.ok) throw new Error('Failed to fetch blogs');

                const result = await response.json();
                if (Array.isArray(result.data)) {
                    setBlogs(result.data);
                    console.log(result.data)
                } else {
                    throw new Error("Invalid API response: Data is not an array");
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setBlogs([]);
            }
        };
        fetchBlogs();
    }, []);

    const getDefaultContent = (content: string) => ({
        blocks: [{ text: content, type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] }],
        entityMap: {}
    });

    const handleEdit = (blog: Blog) => {
        try {
            console.log("Raw blog content:", blog.content);

            const contentString = blog.content || ""; // Ensure content is always a string
            let parsedContent;

            try {
                parsedContent = JSON.parse(contentString);
            } catch (parseError) {
                console.error("Failed to parse blog content:", parseError);
                parsedContent = getDefaultContent(contentString);
            }

            if (!parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
                console.error("Invalid content structure", parsedContent);
                parsedContent = getDefaultContent(contentString);
            }

            const contentState = convertFromRaw(parsedContent);
            const editorState = EditorState.createWithContent(contentState);

            setSelectedBlog(blog);
            setSelectedBlogEditorState(editorState);
            setIsEdit(true);
        } catch (error) {
            console.error("Error in handleEdit:", error);
            const contentState = ContentState.createFromText(blog.content || "");
            const editorState = EditorState.createWithContent(contentState);

            setSelectedBlog(blog);
            setSelectedBlogEditorState(editorState);
            setIsEdit(true);
        }
    };

    const handleDelete = (blog: Blog) => {
        setSelectedBlog(blog);
        setIsEdit(false);
    };

    const confirmDelete = async () => {
        if (!selectedBlog) return;

        try {
            const response = await fetch(
                `/api/blogs/delete?id=${selectedBlog.id}&confirm_delete_blog=1`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    `Failed to delete blog: ${data?.error || response.status}`
                );
            }

            setBlogs(blogs.filter(blog => blog.id !== selectedBlog.id));
            setSelectedBlog(null);
        } catch (error) {
            console.error("Error deleting blog:", error);
        }
    };

    const handleSave = async () => {
        if (!selectedBlog || !selectedBlogEditorState) return;

        setLoading(true);

        try {
            // Convert EditorState to raw JSON
            const contentRaw = JSON.stringify(convertToRaw(selectedBlogEditorState.getCurrentContent()));

            const response = await fetch(`/api/blogs/${selectedBlog.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedBlog.id,
                    title: selectedBlog.title,
                    content: contentRaw,
                    author: selectedBlog.author,
                    category: selectedBlog.category,
                    created_at: selectedBlog.created_at,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Failed to update blog: ${data?.error || response.status}`);
            }

            // Update blog list in state
            setBlogs(blogs.map(blog => (blog.id === selectedBlog.id ? { ...selectedBlog, content: contentRaw } : blog)));

            setSelectedBlog(null);
            setSelectedBlogEditorState(null);
        } catch (error) {
            console.error("Error updating blog:", error);
        } finally {
            setLoading(false);
        }
    };

    // Rich Text Editing Helper Functions
    const toggleInlineStyle = (style: CustomInlineStyleType) => {
        if (!selectedBlogEditorState) return;
        const newEditorState = RichUtils.toggleInlineStyle(selectedBlogEditorState, style);
        setSelectedBlogEditorState(newEditorState);
    };

    const toggleBlockType = (blockType: string) => {
        if (!selectedBlogEditorState) return;
        const newEditorState = RichUtils.toggleBlockType(selectedBlogEditorState, blockType);
        setSelectedBlogEditorState(newEditorState);
    };

    const applyInlineStyle = (prefix: string, value: string) => {
        if (!selectedBlogEditorState) return;

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
        if (!selectedBlogEditorState) return false;
        const styleToCheck = prefix ? `${prefix}-${value}` : value;
        return selectedBlogEditorState.getCurrentInlineStyle().has(styleToCheck);
    };

    const isBlockType = (blockType: string): boolean => {
        if (!selectedBlogEditorState) return false;
        const selection = selectedBlogEditorState.getSelection();
        const blockKey = selection.getStartKey();
        const currentBlockType = selectedBlogEditorState
            .getCurrentContent()
            .getBlockForKey(blockKey)
            .getType();
        return currentBlockType === blockType;
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Blogs</h1>
                <Button onClick={() => router.push('/database/blogs/createblogs')}>Add Blog</Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map((blog) => {
                    let contentToDisplay;

                    try {

                        const rawContent = JSON.parse(blog.content);
                        const contentState = convertFromRaw(rawContent);
                        const editorState = EditorState.createWithContent(contentState);
                        contentToDisplay = <Editor editorState={editorState} readOnly={true} onChange={function (editorState: EditorState): void {
                            throw new Error('Function not implemented.');
                        }} />;
                    } catch (error) {

                        contentToDisplay = <p className="text-gray-600">{blog.content}</p>;
                    }

                    return (
                        <Card key={blog.id} className="p-4 shadow-lg rounded-lg">
                            <CardContent>
                                <h2 className="text-xl font-bold">{blog.title}</h2>
                                <div className="line-clamp-3">{contentToDisplay}</div>
                                <p className="text-sm text-gray-500">Author: {blog.author}</p>
                                <p className="text-sm text-gray-500">Category: {blog.category}</p>
                                <p className="text-sm text-gray-400">Published: {new Date(blog.created_at).toLocaleDateString()}</p>
                                <div className="mt-4 flex space-x-2">
                                    <Button onClick={() => handleEdit(blog)}>Edit</Button>
                                    <Button variant="destructive" onClick={() => handleDelete(blog)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}


                <Dialog open={!!selectedBlog} onOpenChange={() => {
                    setSelectedBlog(null);
                    setSelectedBlogEditorState(null);
                }}>
                    <DialogContent className="max-w-8xl">
                        <DialogHeader>
                            <DialogTitle className="bg-white text-gray-600 border-gray-600">
                                {isEdit ? 'Edit Blog' : 'Confirm Delete'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[600px] bg-white text-gray-600 border-gray-600">
                            {isEdit && selectedBlog && selectedBlogEditorState ? (
                                <div>
                                    <div className="mb-4">
                                        <label htmlFor="title" className="block font-small text-gray-700">
                                            Blog Title:
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            value={selectedBlog.title}
                                            onChange={(e) =>
                                                setSelectedBlog((prev) => prev ? { ...prev, title: e.target.value } : null)
                                            }
                                        />
                                    </div>

                                    <div className="border border-gray-300 rounded">
                                        {/* Formatting toolbar */}
                                        <div className="bg-gray-100 p-2 border-b border-gray-300">
                                            {/* Text formatting section */}
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${hasInlineStyle("", "BOLD") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleInlineStyle("BOLD")}
                                                    title="Bold"
                                                >
                                                    <strong>B</strong>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${hasInlineStyle("", "ITALIC") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleInlineStyle("ITALIC")}
                                                    title="Italic"
                                                >
                                                    <em>I</em>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${hasInlineStyle("", "UNDERLINE") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleInlineStyle("UNDERLINE")}
                                                    title="Underline"
                                                >
                                                    <span className="underline">U</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${hasInlineStyle("", "STRIKETHROUGH") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleInlineStyle("STRIKETHROUGH")}
                                                    title="Strikethrough"
                                                >
                                                    <span className="line-through">S</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${hasInlineStyle("", "SUPERSCRIPT") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleInlineStyle("SUPERSCRIPT")}
                                                    title="Superscript"
                                                >
                                                    x<sup>2</sup>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${hasInlineStyle("", "SUBSCRIPT") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleInlineStyle("SUBSCRIPT")}
                                                    title="Subscript"
                                                >
                                                    H<sub>2</sub>O
                                                </button>

                                                {/* Block type controls */}
                                                <div className="border-l border-gray-300 mx-1"></div>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("header-one") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("header-one")}
                                                    title="Heading 1"
                                                >
                                                    H1
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("header-two") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("header-two")}
                                                    title="Heading 2"
                                                >
                                                    H2
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("header-three") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("header-three")}
                                                    title="Heading 3"
                                                >
                                                    H3
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("unordered-list-item") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("unordered-list-item")}
                                                    title="Bullet List"
                                                >
                                                    • List
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("ordered-list-item") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("ordered-list-item")}
                                                    title="Numbered List"
                                                >
                                                    1. List
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("blockquote") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("blockquote")}
                                                    title="Quote"
                                                >
                                                    " Quote
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("code-block") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
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
                                                    <option value="" disabled>Font Family</option>
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
                                                    <option value="" disabled>Font Size</option>
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
                                                    <option value="" disabled>Text Color</option>
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
                                                    <option value="" disabled>Background</option>
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
                                                    className={`px-2 py-1 ${isBlockType("left") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("left")}
                                                    title="Align Left"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("center") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("center")}
                                                    title="Align Center"
                                                >
                                                    ↔
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("right") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("right")}
                                                    title="Align Right"
                                                >
                                                    →
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 ${isBlockType("justify") ? "bg-gray-400" : "bg-gray-200"} hover:bg-gray-300 rounded text-xs`}
                                                    onClick={() => toggleBlockType("justify")}
                                                    title="Justify"
                                                >
                                                    ⇌
                                                </button>
                                            </div>
                                        </div>

                                        {/* Editor area */}
                                        <div className="min-h-[250px] border p-3 bg-white text-black">
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
                                            value={selectedBlog.author}
                                            onChange={(e) =>
                                                setSelectedBlog((prev) => prev ? { ...prev, author: e.target.value } : null)
                                            }
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label htmlFor="category" className="block font-small text-gray-700">
                                            Category:
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2 mt-2 border rounded"
                                            value={selectedBlog.category}
                                            onChange={(e) =>
                                                setSelectedBlog((prev) => prev ? { ...prev, category: e.target.value } : null)
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white text-gray-600 border-gray-600">
                                    <p>Are you sure you want to delete this blog?</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            {isEdit ? (
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            ) : (
                                <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                            )}
                            <Button variant="secondary" onClick={() => {
                                setSelectedBlog(null);
                                setSelectedBlogEditorState(null);
                            }}>Cancel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default EditDeleteBlog;