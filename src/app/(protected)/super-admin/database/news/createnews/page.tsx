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
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNews({ ...news, [e.target.name]: e.target.value });
  };

  const handleContentChange = (content: string) => {
    setNews((prev) => ({ ...prev, content }));
  };

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

      setTimeout(() => {
        router.push(`/super-admin/database/news`);
      }, 1000);
    } catch (err) {
      setMessage((err as Error).message);
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
        {message && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Article Title */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <ArticleTitleIcon />
                  <span>Article Title</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter a compelling news title..."
                  value={news.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                           focus:border-green-500 focus:ring-4 focus:ring-green-100 
                           transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400 text-lg"
                />
              </div>

              {/* Featured Image URL */}
              <div className="space-y-3">
                <label
                  htmlFor="image_url"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <ImageIcon />
                  <span>Featured Image URL</span>
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  placeholder="https://example.com/image.jpg"
                  value={news.image_url}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 
                           focus:border-green-500 focus:ring-4 focus:ring-green-100 
                           transition-all duration-200 bg-gray-50 hover:bg-white
                           placeholder-gray-400"
                />
              </div>
            </div>

            {/* Image Preview */}
            {news.image_url && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <ImagePreviewIcon />
                  <h4 className="font-semibold text-gray-800">Image Preview</h4>
                </div>
                <div className="flex justify-center">
                  <img
                    src={news.image_url}
                    alt="Featured preview"
                    className="max-w-md h-48 object-cover rounded-lg shadow-md border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
               <ArticleContentIcons/>
                <span>Article Content</span>
              </label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors duration-200">
                <RichTextEditor
                  content={news.content}
                  onChange={handleContentChange}
                  placeholder="Your content will appear here as you type..."
                  minHeight="500px"
                  showPreview={true}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={
                  loading ||
                  !news.title.trim() ||
                  !news.image_url.trim() ||
                  !news.content.trim()
                }
                className="w-full sm:w-auto px-8 py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Article...</span>
                  </>
                ) : (
                  <>
                    <PublishArticleSvg/>
                    <span>Publish News Article</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/super-admin/database/news`)}
                className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 
                         border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-gray-200"
              >
                <CancelButtonSvg/>
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
