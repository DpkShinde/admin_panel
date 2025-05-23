"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/text-editors/RichTextEditor"; // Your Tiptap-based editor

interface Blog {
  title: string;
  content: string; // Change from EditorState to string (HTML)
  author: string;
  category: string;
}

const CreateBlog: React.FC = () => {
  const [blog, setBlog] = useState<Blog>({
    title: "",
    content: "", // Initialize with an empty string for HTML
    author: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  // This function now expects and stores the HTML string from RichTextEditor
  const handleContentChange = (htmlContent: string) => {
    setBlog({ ...blog, content: htmlContent });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const contentHtml = blog.content; // Directly use the HTML string

      console.log(contentHtml); // Log the HTML content
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: blog.title,
          content: contentHtml, // Send the HTML string
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
        content: "", // Reset to empty string
        author: "",
        category: "",
      });

      toast.success(data.message);
      router.push(`/super-admin/database/blogs`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-2 bg-white shadow-2xl rounded-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center py-4 rounded-2xl bg-amber-300">
        Create Blog
      </h3>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block font-medium text-gray-700 mb-4"
          >
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
          <label
            htmlFor="content"
            className="block font-medium text-gray-700 mb-4"
          >
            Blog Content:
          </label>
          {/* Now passing HTML string to content and expecting HTML string from onChange */}
          <RichTextEditor
            content={blog.content}
            onChange={handleContentChange}
            placeholder="Your content will appear here as you type..."
            minHeight="400px"
            showPreview={true}
          />
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
        <div className="flex justify-between">
          <div>
            {" "}
            <button
              type="submit"
              disabled={loading}
              className="p-2 text-white w-32 ml-2 bg-green-600 hover:bg-green-800 cursor-pointer rounded mt-4 transition"
            >
              {loading ? "Adding..." : "Add Blog"}
            </button>
          </div>
          <div>
            <button
              className="p-2 w-32 mr-2 text-white bg-red-600 hover:bg-red-800 cursor-pointer rounded mt-4 transition"
              onClick={() => router.push(`/super-admin/database/blogs`)}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
