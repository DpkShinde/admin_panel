'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Error from 'next/error';

interface Blog {
    id: number;
    title: string;
    content: string;
    author: string;
    category: string;
    created_at: string;
}

const EditDeleteBlog: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/api/blogs/all'); // Replace with actual API URL
                if (!response.ok) throw new Error('Failed to fetch blogs');

                const result = await response.json();
                console.log("Fetched data:", result.data);

                // Extract `data` array from response
                if (Array.isArray(result.data)) {
                    setBlogs(result.data);
                } else {
                    throw new Error("Invalid API response: Data is not an array");
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setBlogs([]); // Ensure blogs is always an array
            }
        };
        fetchBlogs();
    }, []);


    const handleEdit = (blog: Blog) => {
        setSelectedBlog(blog);
        setIsEdit(true);
    };

    const handleDelete = (blog: Blog) => {
        setSelectedBlog(blog);
        setIsEdit(false);
    };

    const confirmDelete = async () => {
        if (!selectedBlog) return;

        try {
            const response = await fetch(`/api/blogs/delete?id=${selectedBlog.id}&confirm_delete_blog=1`, {
                method: 'DELETE',
            });

            const data = await response.json(); // Try to parse JSON response
            console.log("DELETE Response:", data); // Log the full response

            if (!response.ok) {
                throw new Error(`Failed to delete blog: ${data?.error || response.status}`);
            }

            setBlogs(blogs.filter(blog => blog.id !== selectedBlog.id));
            setSelectedBlog(null);
        } catch (error) {
            console.error("Error deleting blog:", error);
        }
    };


    const handleSave = () => {
        if (selectedBlog) {
            setBlogs(blogs.map(blog => (blog.id === selectedBlog.id ? selectedBlog : blog)));
            setSelectedBlog(null);
        }
    };

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((blog) => (
                <Card key={blog.id} className="p-4 shadow-lg rounded-lg">
                    <CardContent>
                        <h2 className="text-xl font-bold">{blog.title}</h2>
                        <p className="text-gray-600 line-clamp-3">{blog.content}</p>
                        <p className="text-sm text-gray-500">Author: {blog.author}</p>
                        <p className="text-sm text-gray-500">Category: {blog.category}</p>
                        <p className="text-sm text-gray-400">Published: {new Date(blog.created_at).toLocaleDateString()}</p>
                        <div className="mt-4 flex space-x-2">
                            <Button onClick={() => handleEdit(blog)}>Edit</Button>
                            <Button variant="destructive" onClick={() => handleDelete(blog)}>Delete</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Edit Blog' : 'Confirm Delete'}
                        </DialogTitle>
                    </DialogHeader>
                    <div>
                        {isEdit ? (
                            <div>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={selectedBlog?.title || ''}
                                    onChange={(e) =>
                                        setSelectedBlog((prev) => prev ? { ...prev, title: e.target.value } : null)
                                    }
                                />
                                <textarea
                                    className="w-full p-2 mt-2 border rounded"
                                    value={selectedBlog?.content || ''}
                                    onChange={(e) =>
                                        setSelectedBlog((prev) => prev ? { ...prev, content: e.target.value } : null)
                                    }
                                />
                                <input
                                    type="text"
                                    className="w-full p-2 mt-2 border rounded"
                                    value={selectedBlog?.author || ''}
                                    onChange={(e) =>
                                        setSelectedBlog((prev) => prev ? { ...prev, author: e.target.value } : null)
                                    }
                                />
                                <input
                                    type="text"
                                    className="w-full p-2 mt-2 border rounded"
                                    value={selectedBlog?.category || ''}
                                    onChange={(e) =>
                                        setSelectedBlog((prev) => prev ? { ...prev, category: e.target.value } : null)
                                    }
                                />
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 mt-2 border rounded"
                                    value={selectedBlog?.created_at?.slice(0, 16) || ''}
                                    onChange={(e) =>
                                        setSelectedBlog((prev) => prev ? { ...prev, created_at: e.target.value } : null)
                                    }
                                />
                            </div>
                        ) : (
                            <p>Are you sure you want to delete this blog?</p>
                        )}
                    </div>
                    <DialogFooter>
                        {isEdit ? (
                            <Button onClick={handleSave}>Save</Button>
                        ) : (
                            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedBlog(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditDeleteBlog;
