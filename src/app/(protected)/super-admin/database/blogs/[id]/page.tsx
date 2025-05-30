"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import RichTextEditor from "@/components/text-editors/RichTextEditor";
import { CBlog } from "@/types";
import {
  BlogAuthorIcon,
  BlogCategoryIcon,
  BlogContentIcon,
  BlogTitle,
  CancelBtnIcon,
  EditBlogIcon,
  ErrorLoadingBlogIcon,
  UpdateBlogBtn,
} from "../(utils)/assets";

const EditBlog: React.FC = () => {
  const [blog, setBlog] = useState<CBlog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { id } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!blog) return;
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handleContentChange = (htmlContent: string) => {
    if (!blog) return;
    setBlog({ ...blog, content: htmlContent });
  };

  const fetchBlogData = async () => {
    if (!id) {
      setError("No blog ID provided");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch blog");

      setBlog({
        title: data.title,
        content: data.content || "",
        author: data.author,
        category: data.category,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update blog");

      toast.success("Blog updated successfully!");
      router.push("/super-admin/database/blogs");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, [id]);

  if (loading && !blog) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600 font-medium">Loading blog data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ErrorLoadingBlogIcon />
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Blog</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <EditBlogIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Edit Blog Post
                </h1>
                <p className="text-green-100 mt-1">
                  Update and manage your blog content
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleUpdate} className="p-8 space-y-8">
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
                value={blog.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                         focus:border-green-500 focus:ring-4 focus:ring-green-100 
                         transition-all duration-200 bg-gray-50 hover:bg-white
                         placeholder-gray-400 text-lg"
                placeholder="Enter an engaging blog title..."
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
                  placeholder="Share your thoughts and ideas here..."
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
                  value={blog.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                           focus:border-green-500 focus:ring-4 focus:ring-green-100 
                           transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400"
                  placeholder="Author name..."
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label
                  htmlFor="category"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <BlogCategoryIcon />
                  <span>Category</span>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={blog.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                           focus:border-green-500 focus:ring-4 focus:ring-green-100 
                           transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400"
                  placeholder="Blog category..."
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <UpdateBlogBtn />
                    <span>Update Blog</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/super-admin/database/blogs")}
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

export default EditBlog;
