"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/text-editors/RichTextEditor"; 
import { CBlog } from "@/types";
import {
  BlogAuthorIcon,
  BlogContentIcon,
  BlogTitle,
  CancelBtnIcon,
  CreateBlogBtnIcon,
  CreateNewBlogIcon,
  MessageIcon,
} from "../(utils)/assets";

const CreateBlog: React.FC = () => {
  const [blog, setBlog] = useState<CBlog>({
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <CreateNewBlogIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Create New Blog
                </h1>
                <p className="text-green-100 mt-1">
                  Share your insights and knowledge with the world
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <MessageIcon />
              </div>
              <div>
                <h3 className="text-red-800 font-medium">
                  Error Creating Blog
                </h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Blog Title */}
            <div className="space-y-3">
              <label
                htmlFor="title"
                className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
              >
                <BlogTitle />
                <span>Blog Title</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter an engaging blog title..."
                value={blog.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                         focus:border-green-500 focus:ring-4 focus:ring-green-100 
                         transition-all duration-200 bg-gray-50 hover:bg-white
                         placeholder-gray-400 text-lg"
              />
            </div>

            {/* Blog Content */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <BlogContentIcon />
                <span>Blog Content</span>
              </label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors duration-200">
                <RichTextEditor
                  content={blog.content}
                  onChange={handleContentChange}
                  placeholder="Your content will appear here as you type..."
                  minHeight="500px"
                  showPreview={true}
                />
              </div>
            </div>

            {/* Author and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Author */}
              <div className="space-y-3">
                <label
                  htmlFor="author"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <BlogAuthorIcon />
                  <span>Author</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  placeholder="Enter author name..."
                  value={blog.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                           focus:border-green-500 focus:ring-4 focus:ring-green-100 
                           transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400"
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label
                  htmlFor="category"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <span>Category</span>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="Enter blog category..."
                  value={blog.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                         focus:border-green-500 focus:ring-4 focus:ring-green-100 
                         transition-all duration-200 bg-gray-50 hover:bg-white
                         placeholder-gray-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CreateBlogBtnIcon />
                    <span>Create Blog</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/super-admin/database/blogs`)}
                className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 
                         border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-gray-200"
              >
                <CancelBtnIcon />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
