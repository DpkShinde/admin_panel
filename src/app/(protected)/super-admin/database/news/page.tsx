"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";


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
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // State for editable fields in the dialog
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState(""); // Will hold plain text for textarea
  const [editImageUrl, setEditImageUrl] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news/all");
        if (!response.ok) throw new Error("Failed to fetch news");

        const result = await response.json();
        console.log("Fetched news data:", result);

        if (Array.isArray(result)) {
          setNewsList(result);
        } else {
          console.error("API response is not an array:", result);
          setNewsList([]);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsList([]);
      }
    };
    fetchNews();
  }, []);

  // --- Helper to convert Draft.js raw JSON string to simple HTML for display ---
  // This is a custom, basic converter to avoid draftjs-to-html dependency
  // It only handles unstyled blocks as paragraphs and basic bold styles.
  // Extend it if you need more formatting.
  const convertDraftJsToSimpleHtml = (jsonContent: string): string => {
    try {
      const rawContentState = JSON.parse(jsonContent);
      if (!rawContentState || !Array.isArray(rawContentState.blocks)) {
        return "<p>Invalid content format or empty.</p>";
      }

      let html = "";
      rawContentState.blocks.forEach((block: any) => {
        let blockText = block.text;

        // Apply inline styles (e.g., bold)
        if (block.inlineStyleRanges && Array.isArray(block.inlineStyleRanges)) {
          // Sort ranges by offset to apply from right to left, preventing index issues
          const sortedRanges = [...block.inlineStyleRanges].sort((a, b) => b.offset - a.offset);

          sortedRanges.forEach((range: any) => {
            const start = range.offset;
            const end = range.offset + range.length;
            const textToStyle = blockText.substring(start, end);

            switch (range.style) {
              case "BOLD":
                blockText =
                  blockText.substring(0, start) +
                  `<strong>${textToStyle}</strong>` +
                  blockText.substring(end);
                break;
              case "ITALIC":
                blockText =
                  blockText.substring(0, start) +
                  `<em>${textToStyle}</em>` +
                  blockText.substring(end);
                break;
              // Add more styles here as needed (e.g., UNDERLINE, CODE)
              default:
                // If an unknown style, just use plain text
                break;
            }
          });
        }

        // Apply block types
        switch (block.type) {
          case "unstyled":
          case "paragraph":
            html += `<p>${blockText}</p>`;
            break;
          case "header-one":
            html += `<h1>${blockText}</h1>`;
            break;
          case "header-two":
            html += `<h2>${blockText}</h2>`;
            break;
          case "ordered-list-item":
            // For proper nested lists, you'd need more complex logic.
            // This is a basic flat list item.
            html += `<li>${blockText}</li>`;
            break;
          case "unordered-list-item":
            // Basic flat list item
            html += `<li>${blockText}</li>`;
            break;
          case "blockquote":
            html += `<blockquote>${blockText}</blockquote>`;
            break;
          case "code-block":
            html += `<pre><code>${blockText}</code></pre>`;
            break;
          // Add more block types as needed
          default:
            html += `<p>${blockText}</p>`; // Default to paragraph for unknown types
        }
      });
      return html;
    } catch (e) {
      console.error("Error custom converting Draft.js content to HTML:", e);
      return "<p>Error loading content.</p>";
    }
  };

  // Helper to extract plain text from Draft.js JSON for the textarea
  const extractPlainTextFromDraftJs = (jsonContent: string): string => {
    try {
      const rawContentState = JSON.parse(jsonContent);
      if (rawContentState && Array.isArray(rawContentState.blocks)) {
        return rawContentState.blocks.map((block: { text: string }) => block.text).join("\n\n");
      }
      return "";
    } catch (e) {
      console.error("Error extracting plain text from Draft.js content:", e);
      return "";
    }
  };

  // Helper to convert plain text from textarea back to a *minimal* Draft.js JSON structure
  // This is a LOSS of formatting. If you switch to another editor, you'd convert to its format.
  const convertPlainTextToDraftJs = (plainText: string): string => {
    const blocks = plainText.split(/\n\s*\n/).map((paragraph) => ({
      key: Math.random().toString(36).substring(2, 10), // Simple unique key
      text: paragraph,
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    }));
    return JSON.stringify({
      entityMap: {},
      blocks: blocks,
    });
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setIsEdit(true);
    setDialogOpen(true);
    setEditTitle(news.title);
    setEditContent(extractPlainTextFromDraftJs(news.content)); // Populate textarea with plain text
    setEditImageUrl(news.image_url);
  };

  const handleDelete = (news: News) => {
    setSelectedNews(news);
    setIsEdit(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedNews(null);
    setDialogOpen(false);
    // Clear edit states
    setEditTitle("");
    setEditContent("");
    setEditImageUrl("");
  };

  const confirmDelete = async () => {
    if (!selectedNews) return;

    try {
      const response = await fetch(`/api/news/${selectedNews.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log("DELETE Response:", data);

      if (!response.ok) {
        throw new Error(`Failed to delete news: ${data?.error || response.status}`);
      }

      setNewsList(newsList.filter((news) => news.id !== selectedNews.id));
      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting news:", error);
      // Optionally show an error message to the user
    }
  };

  const handleSave = async () => {
    if (!selectedNews) return;

    try {
      // Convert plain text from textarea back to minimal Draft.js JSON for the backend
      const updatedContentJson = convertPlainTextToDraftJs(editContent);

      const response = await fetch(`/api/news/${selectedNews.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          content: updatedContentJson,
          image_url: editImageUrl,
        }),
      });

      const data = await response.json();
      console.log("UPDATE Response:", data);

      if (!response.ok) {
        throw new Error(`Failed to update news: ${data?.error || response.status}`);
      }

      // Update the newsList with the new data
      setNewsList(
        newsList.map((news) =>
          news.id === selectedNews.id
            ? {
                ...news,
                title: editTitle,
                content: updatedContentJson, // Update with new JSON string
                image_url: editImageUrl,
              }
            : news
        )
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating news:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Manage News Articles</h1>
        <Button
          onClick={() => router.push("/super-admin/database/news/createnews")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md"
        >
          Add New Article
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <Card
              key={news.id}
              className="shadow-lg rounded-xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 h-20 overflow-hidden">
                  {news.title}
                </h2>
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                {/* Display content using the custom HTML converter */}
                <div
                  className="text-gray-700 text-sm mb-4 line-clamp-4 h-24 overflow-y-scroll p-2"
                  dangerouslySetInnerHTML={{
                    __html: convertDraftJsToSimpleHtml(news.content),
                  }}
                />
                <p className="text-xs text-gray-500 mb-4">
                  Published: {new Date(news.created_at).toLocaleDateString()}
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleEdit(news)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(news)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg mt-8">
           Loading....
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {isEdit ? "Edit News Article" : "Confirm Deletion"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isEdit && selectedNews ? (
              <div className="grid gap-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title:
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Content:
                  </label>
                  {/* Using a simple textarea instead of Draft.js Editor */}
                  <textarea
                    id="content"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                  />
                </div>
                <div>
                  <label
                    htmlFor="image_url"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Image URL:
                  </label>
                  <input
                    id="image_url"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-lg">
                Are you sure you want to delete the article titled "
                <span className="font-semibold">{selectedNews?.title}</span>"? This action cannot be
                undone.
              </p>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            {isEdit ? (
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            ) : (
              <Button variant="destructive" onClick={confirmDelete}>
                Confirm Delete
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditDeleteNews;