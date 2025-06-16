"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RichTextEditor from "@/components/text-editors/RichTextEditor";
import { NewsForm } from "@/types";
import {
  ArticleContentIcons,
  ArticleTitleIcon,
  CancelButtonSvg,
  CreateArticleIcon,
  ImageIcon,
  ImagePreviewIcon,
  PublishArticleSvg,
  SuccessMessageIcon,
} from "../(utils)/assets";

const CreateNews: React.FC = () => {
  const [news, setNews] = useState<NewsForm>({
    title: "",
    image_url: "",
    content: "",
    created_date: "", // Fixed: consistent naming
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false); // Added: track image loading errors

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNews({ ...news, [name]: value });

    // Reset image error when URL changes
    if (name === "image_url") {
      setImageError(false);
    }
  };

  const handleContentChange = (content: string) => {
    setNews((prev) => ({ ...prev, content }));
  };

  // Added: Image validation function
  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  };

  // Added: Form validation function
  const isFormValid = (): boolean => {
    return (
      news.title.trim().length > 0 &&
      news.image_url.trim().length > 0 &&
      validateImageUrl(news.image_url) &&
      news.content.trim().length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Added: Client-side validation
    if (!isFormValid()) {
      toast.error("Please fill in all required fields with valid data");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Added: Auto-generate created_date if not provided
      const currentDate = new Date().toISOString();

      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: news.title.trim(),
          image_url: news.image_url.trim(),
          content: news.content.trim(),
          created_at: news.created_date || currentDate, // Fixed: use created_date from state or current date
          action: "create",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message ||
          `Failed to create news: ${response.status} ${response.statusText}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const successMessage = data.message || "News created successfully!";
      setMessage(successMessage);
      toast.success(successMessage);

      // Reset form
      setNews({
        title: "",
        image_url: "",
        content: "",
        created_date: "",
      });

      // Navigate after success
      setTimeout(() => {
        router.push(`/super-admin/database/news`);
      }, 1500); // Increased delay for better UX
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setMessage(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Added: Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Added: Reset image error when URL is valid
  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <CreateArticleIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Create News Article
                </h1>
                <p className="text-green-100 mt-1">
                  Create and publish your news content
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {message && !loading && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <SuccessMessageIcon />
              </div>
              <div>
                <h3 className="text-green-800 font-medium">Success</h3>
                <p className="text-green-600 text-sm mt-1">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title and Image URL Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Article Title */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <ArticleTitleIcon />
                  <span>Article Title *</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter a compelling news title..."
                  value={news.title}
                  onChange={handleChange}
                  required
                  maxLength={200} // Added: reasonable title length limit
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                           focus:border-green-500 focus:ring-4 focus:ring-green-100 
                           transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400 text-lg"
                />
                {/* Added: Character counter */}
                <p className="text-sm text-gray-500">
                  {news.title.length}/200 characters
                </p>
              </div>

              {/* Featured Image URL */}
              <div className="space-y-3">
                <label
                  htmlFor="image_url"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <ImageIcon />
                  <span>Featured Image URL *</span>
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  placeholder="https://example.com/image.jpg"
                  value={news.image_url}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 
                           focus:ring-4 transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400 ${
                             imageError ||
                             (news.image_url &&
                               !validateImageUrl(news.image_url))
                               ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                               : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                           }`}
                />
                {/* Added: URL validation feedback */}
                {news.image_url && !validateImageUrl(news.image_url) && (
                  <p className="text-sm text-red-600">
                    Please enter a valid image URL (jpg, jpeg, png, gif, webp,
                    svg)
                  </p>
                )}
              </div>
              {/* Created Date Field - Added */}
              <div className="space-y-3">
                <label
                  htmlFor="created_date"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <span>📅</span>
                  <span>Publication Date*</span>
                </label>
                <input
                  type="date"
                  id="created_date"
                  name="created_date"
                  value={news.created_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                         focus:border-green-500 focus:ring-4 focus:ring-green-100 
                         transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            {/* Image Preview */}
            {news.image_url && validateImageUrl(news.image_url) && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <ImagePreviewIcon />
                  <h4 className="font-semibold text-gray-800">Image Preview</h4>
                </div>
                <div className="flex justify-center">
                  {!imageError ? (
                    <img
                      src={news.image_url}
                      alt="Featured preview"
                      className="max-w-md h-48 object-cover rounded-lg shadow-md border border-gray-200"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                  ) : (
                    <div className="max-w-md h-48 bg-gray-200 rounded-lg shadow-md border border-gray-300 flex items-center justify-center">
                      <p className="text-gray-500">Failed to load image</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <ArticleContentIcons />
                <span>Article Content *</span>
              </label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors duration-200">
                <RichTextEditor
                  content={news.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your news article here..."
                  minHeight="500px"
                  showPreview={true}
                />
              </div>
              {/* Added: Content length indicator */}
              <p className="text-sm text-gray-500">
                Content length: {news.content.replace(/<[^>]*>/g, "").length}{" "}
                characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full sm:w-auto px-8 py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                         disabled:transform-none disabled:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Article...</span>
                  </>
                ) : (
                  <>
                    <PublishArticleSvg />
                    <span>Publish News Article</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/super-admin/database/news`)}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 
                         border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CancelButtonSvg />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNews;
