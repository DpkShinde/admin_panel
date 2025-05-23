"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface News {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

const EditDeleteNews: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const router = useRouter();

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const fetchNews = async (pageNumber = 1) => {
    try {
      const res = await fetch(
        `/api/news/all?page=${pageNumber}&limit=${limit}`
      );
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setNewsList(data?.data);
        setTotalPages(data?.totalPages);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to fetch news articles.");
    }
  };

  const handleEdit = (news: News) => {
    // Navigate to separate edit component/page
    router.push(`/super-admin/database/news/${news.id}`);
  };

  const handleDelete = (news: News) => {
    setSelectedNews(news);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedNews(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedNews) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${selectedNews.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete news");
      }
      setNewsList(newsList.filter((n) => n.id !== selectedNews.id));
      toast.success("News article deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error deleting news article.");
      console.error("Error deleting news:", error);
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[--text-color-dark]">
          Manage News
        </h1>
        <Button
          onClick={() => router.push("/super-admin/database/news/createnews")}
          variant={"destructive"}
          className="cursor-pointer"
        >
          Add News
        </Button>
      </div>

      {/* News Table */}
      <div className="bg-[--bg-color-card] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-[--bg-color-light]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-color-dark] uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-color-dark] uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-color-dark] uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-color-dark] uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[--text-color-dark] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-color-light]">
              {newsList.map((news) => (
                <tr
                  key={news.id}
                  className="hover:bg-[--bg-color-light] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("placeholder-image.jpg")) {
                          target.src = "/placeholder-image.jpg";
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[--text-color-dark] max-w-xs">
                      {truncateText(news.title, 50)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[--text-color-default] max-w-md">
                      {truncateText(stripHtml(news.content), 100)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[--text-color-light]">
                      {new Date(news.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                        onClick={() => handleEdit(news)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                        onClick={() => handleDelete(news)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {newsList.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[--text-color-light] text-lg">
              No news articles found.
            </p>
          </div>
        )}
      </div>

      {/* paginetion */}
      <div className="flex justify-between items-center mt-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[--text-color-dark]">
              Delete News Article
            </DialogTitle>
          </DialogHeader>

          <div className="text-center p-4">
            <p className="text-lg text-[--text-color-default] mb-4">
              Are you sure you want to delete the news article "
              <span className="font-semibold text-[--text-color-dark]">
                {selectedNews?.title}
              </span>
              "? This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDeleteDialog}
              className="px-6 py-2 rounded-lg text-[--button-text-color-secondary] border-[--border-color-default] hover:bg-[--hover-bg-color] transition-colors"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDeleteNews;
