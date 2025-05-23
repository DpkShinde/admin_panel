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
import { convertFromRaw, EditorState } from "draft-js";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Editor = dynamic(() => import("draft-js").then((mod) => mod.Editor), {
  ssr: false,
});

interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
}

const BlogListTable: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs/all");
        if (!response.ok) throw new Error("Failed to fetch blogs");

        const result = await response.json();
        if (Array.isArray(result.data)) {
          setBlogs(result.data);
        } else {
          throw new Error("Invalid API response: Data is not an array");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  const handleEdit = (blog: Blog) => {
    // Navigate to separate edit component
    router.push(`/super-admin/database/blogs/${blog.id}`);
  };

  const handleDelete = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedBlog) return;

    try {
      const response = await fetch(
        `/api/blogs/delete?id=${selectedBlog.id}&confirm_delete_blog=1`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to delete blog: ${data?.error || response.status}`
        );
      }

      setBlogs(blogs.filter((blog) => blog.id !== selectedBlog.id));
      setSelectedBlog(null);
      setShowDeleteDialog(false);
      toast.success(data.message || "Successfully delete blog");
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const renderContent = (content: string) => {
    try {
      const rawContent = JSON.parse(content);
      const contentState = convertFromRaw(rawContent);
      const editorState = EditorState.createWithContent(contentState);
      const plainText = contentState.getPlainText();
      return plainText.length > 100
        ? plainText.substring(0, 100) + "..."
        : plainText;
    } catch (error) {
      return content.length > 100 ? content.substring(0, 100) + "..." : content;
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(blogs.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Blogs</h1>
            <Button
              onClick={() =>
                router.push("/super-admin/database/blogs/createblogs")
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Add Blog
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    IMAGE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TITLE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONTENT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AUTHOR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CATEGORY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED AT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-content-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs">
                        {blog.title.length > 50
                          ? blog.title.substring(0, 50) + "..."
                          : blog.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {renderContent(blog.content)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(blog)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(blog)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, blogs.length)}
                    </span>{" "}
                    of <span className="font-medium">{blogs.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <Button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </Button>
                      )
                    )}
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogListTable;
