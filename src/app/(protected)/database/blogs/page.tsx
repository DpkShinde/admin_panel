'use client'
import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
    EditorState,
    RichUtils,
    Modifier,
    DraftInlineStyleType,
} from "draft-js";
const Editor = dynamic(() => import("draft-js").then((mod) => mod.Editor), {
    ssr: false,
});

import "draft-js/dist/Draft.css";

interface Blog {
    title: string;
    content: EditorState;
    author: string;
    category: string;
}

const customStyleMap: Record<string, React.CSSProperties> = {
    "FONTSIZE-12": { fontSize: "12px" },
    "FONTSIZE-14": { fontSize: "14px" },
    "FONTSIZE-16": { fontSize: "16px" },
    "FONTSIZE-18": { fontSize: "18px" },
    "FONTSIZE-20": { fontSize: "20px" },
    "FONTSIZE-24": { fontSize: "24px" },
    BOLD: { fontWeight: "bold" },
    ITALIC: { fontStyle: "italic" },
    UNDERLINE: { textDecoration: "underline" },
};

const CreateBlog: React.FC = () => {
    const [blog, setBlog] = useState<Blog>({
        title: "",
        content: EditorState.createEmpty(),
        author: "",
        category: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBlog({ ...blog, [e.target.name]: e.target.value });
    };

    const handleEditorChange = (editorState: EditorState) => {
        setBlog({ ...blog, content: editorState });
    };

    const toggleInlineStyle = (style: DraftInlineStyleType) => {
        handleEditorChange(RichUtils.toggleInlineStyle(blog.content, style));
    };

    const applyFontSize = (fontSize: string) => {
        const selection = blog.content.getSelection();
        const contentState = blog.content.getCurrentContent();
        const newContentState = Modifier.applyInlineStyle(
            contentState,
            selection,
            `FONTSIZE-${fontSize}`
        );
        handleEditorChange(
            EditorState.push(blog.content, newContentState, "change-inline-style")
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const contentRaw = JSON.stringify(blog.content.getCurrentContent());
            const response = await fetch("/api/blogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: blog.title,
                    content: contentRaw,
                    author: blog.author,
                    category: blog.category,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create blog");
            }

            console.log("New Blog Created:", data.message);
            setBlog({
                title: "",
                content: EditorState.createEmpty(),
                author: "",
                category: "",
            });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Create Blog
            </h3>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block font-medium text-gray-700">
                        Blog Title:
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Enter blog title"
                        value={blog.title}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border text-black border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block font-medium text-gray-700">
                        Blog Content:
                    </label>
                    <div className="border border-gray-300 rounded p-3">
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                className="px-3 py-1 bg-[#2B2D31] hover:bg-gray-300 rounded text-sm"
                                onClick={() => toggleInlineStyle("BOLD")}
                            >
                                Bold
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 bg-[#2B2D31] hover:bg-gray-300 rounded text-sm"
                                onClick={() => toggleInlineStyle("ITALIC")}
                            >
                                Italic
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 bg-[#2B2D31] hover:bg-gray-300 rounded text-sm"
                                onClick={() => toggleInlineStyle("UNDERLINE")}
                            >
                                Underline
                            </button>

                            <select
                                className="px-3 py-1 bg-[#2B2D31] border border-gray-300 rounded text-sm"
                                onChange={(e) => applyFontSize(e.target.value)}
                                defaultValue=""
                            >
                                <option value="">Font Size</option>
                                <option value="12">12px</option>
                                <option value="14">14px</option>
                                <option value="16">16px</option>
                                <option value="18">18px</option>
                                <option value="20">20px</option>
                                <option value="24">24px</option>
                            </select>
                        </div>

                        <div className="min-h-[150px] border text-black p-2 bg-white">
                            {Editor && (
                                <Editor
                                    placeholder="Enter Content here"
                                    editorState={blog.content}
                                    onChange={handleEditorChange}
                                    customStyleMap={customStyleMap}
                                />
                            )}

                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="author" className="block font-medium text-gray-700">
                        Author:
                    </label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        placeholder="Enter author name"
                        value={blog.author}
                        onChange={handleChange}
                        required
                        className="w-full p-2 text-black border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block font-medium text-gray-700">
                        Category:
                    </label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        placeholder="Enter blog category"
                        value={blog.category}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border text-black border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 text-white bg-gray-600 hover:bg-indigo-700 rounded mt-4 transition"
                >
                    {loading ? "Adding..." : "Add Blog"}
                </button>
            </form>
        </div>
    );
};

export default CreateBlog;
