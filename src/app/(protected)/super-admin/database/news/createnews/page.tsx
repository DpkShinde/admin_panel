// src/app/[protected]/super-admin/database/news/createnews/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RichTextEditor from "@/components/text-editors/RichTextEditor";

interface NewsForm {
  title: string;
  image_url: string;
  content: string;
}

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
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-0">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl -mx-6 -mt-6 mb-6">
        <h3 className="text-3xl font-bold text-center">Create News Article</h3>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block font-semibold text-gray-700 mb-2"
            >
              Article Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter a compelling news title..."
              value={news.title}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="image_url"
              className="block font-semibold text-gray-700 mb-2"
            >
              Featured Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              placeholder="https://example.com/image.jpg"
              value={news.image_url}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {news.image_url && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Image Preview:</h4>
            <img
              src={news.image_url}
              alt="Featured preview"
              className="max-w-sm h-48 object-cover rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Article Content
          </label>
          <RichTextEditor
            content={news.content}
            onChange={handleContentChange}
            placeholder="Your content will appear here as you type..."
            minHeight="400px"
            showPreview={true}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <button
              type="submit"
              disabled={
                loading ||
                !news.title.trim() ||
                !news.image_url.trim() ||
                !news.content.trim()
              }
              className="w-52 p-2 cursor-pointer text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Article...
                </span>
              ) : (
                "Publish News Article"
              )}
            </button>
          </div>
          <div>
            <button
              type="button"
              className="w-52 p-2 cursor-pointer text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => router.push(`/super-admin/database/news`)}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateNews;
