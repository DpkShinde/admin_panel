"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import RichTextEditor from "@/components/text-editors/RichTextEditor";
import { NewsForm } from "@/types";
import {
  ArticleContentIcons,
  ArticleTitleIcon,
  CancelButtonSvg,
  ImageIcon,
  ImagePreviewIcon,
  UpdateArticleIcon,
  UpdateArticleSvg,
} from "../(utils)/assets";

const UpdateNews: React.FC = () => {
  const [news, setNews] = useState<NewsForm>({
    title: "",
    image_url: "",
    content: "",
    created_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  //getting id from params
  const { id } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNews({ ...news, [e.target.name]: e.target.value });
  };

  const handleContentChange = (content: string) => {
    setNews((prev) => ({ ...prev, content }));
  };

  //getting data of selected news
  const getData = async () => {
    if (!id) {
      setError("No news ID provided");
      setFetchingData(false);
      return;
    }

    setFetchingData(true);
    try {
      const response = await fetch(`/api/news/${id}`);
      const data = await response.json();

      const formattedDate = data.created_at
        ? data.created_at.slice(0, 10) // YYYY-MM-DD
        : "";

      console.log(formattedDate);

      if (response.ok) {
        setNews({
          title: data.title,
          image_url: data.image_url,
          content: data.content || "",
          created_date: formattedDate,
        });
        setError(null);
      } else {
        setError(data.message || "Failed to fetch news");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError("Something went wrong while fetching data");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: news.title,
          image_url: news.image_url,
          content: news.content,
          created_at: news.created_date,
          action: "update",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update news");
        throw new Error(data.message || "Failed to update news");
      }

      toast.success(data.message || "News updated successfully!");
      setTimeout(() => {
        router.push(`/super-admin/database/news`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to update news article");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600 font-medium">Loading news article...</p>
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
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading News</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <UpdateArticleSvg />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Update News Article
                </h1>
                <p className="text-green-100 mt-1">
                  Edit and update your news content
                </p>
              </div>
            </div>
          </div>
        </div>

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

              <div className="space-y-3">
                <label
                  htmlFor="created_date"
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
                >
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h.01M7 12h.01M7 15h.01M17 12h.01M17 15h.01M17 18h.01M16 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Created Date</span>
                </label>
                <input
                  type="date"
                  id="created_date"
                  name="created_date"
                  value={news.created_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-lg"
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
                <ArticleContentIcons />
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <UpdateArticleIcon />
                    <span>Update Article</span>
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

export default UpdateNews;
