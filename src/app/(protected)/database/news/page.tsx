'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

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

    const router = useRouter()

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news/all');
                if (!response.ok) throw new Error('Failed to fetch news');

                const result = await response.json();
                console.log("Fetched data:", result);

                if (Array.isArray(result)) {
                    setNewsList(result);
                } else {
                    throw new Error("Invalid API response: Data is not an array");
                }
            } catch (error) {
                console.error("Error fetching news:", error);
                setNewsList([]);
            }
        };
        fetchNews();
    }, []);

    const handleEdit = (news: News) => {
        setSelectedNews(news);
        setIsEdit(true);
    };

    const handleDelete = (news: News) => {
        setSelectedNews(news);
        setIsEdit(false);
    };

    const confirmDelete = async () => {
        if (!selectedNews) return;

        try {
            const response = await fetch(`/api/news/${selectedNews.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            console.log("DELETE Response:", data);

            if (!response.ok) {
                throw new Error(`Failed to delete news: ${data?.error || response.status}`);
            }

            setNewsList(newsList.filter(news => news.id !== selectedNews.id));
            setSelectedNews(null);
        } catch (error) {
            console.error("Error deleting news:", error);
        }
    };

    const handleSave = async () => {
        if (!selectedNews) return;

        try {
            const response = await fetch(`/api/news/${selectedNews.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: selectedNews.title,
                    content: selectedNews.content,
                    image_url: selectedNews.image_url,
                }),
            });

            const data = await response.json();
            console.log("UPDATE Response:", data);

            if (!response.ok) {
                throw new Error(`Failed to update news: ${data?.error || response.status}`);
            }

            setNewsList(newsList.map(news => (news.id === selectedNews.id ? selectedNews : news)));
            setSelectedNews(null);
        } catch (error) {
            console.error("Error updating news:", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">News</h1>
                <Button onClick={() => router.push('/database/news/createnews')}>Add News</Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsList.map((news) => (
                    <Card key={news.id} className="p-4 shadow-lg rounded-lg">
                        <CardContent>
                            <h2 className="text-xl font-bold">{news.title}</h2>
                            <p className="text-gray-600 line-clamp-3">{news.content}</p>
                            <img src={news.image_url} alt={news.title} className="w-full h-32 object-cover mt-2 rounded" />
                            <p className="text-sm text-gray-500">Published: {new Date(news.created_at).toLocaleDateString()}</p>
                            <div className="mt-4 flex space-x-2">
                                <Button onClick={() => handleEdit(news)}>Edit</Button>
                                <Button variant="destructive" onClick={() => handleDelete(news)}>Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="block font-small text-gray-700">{isEdit ? 'Edit News' : 'Confirm Delete'}</DialogTitle>
                        </DialogHeader>
                        <div>
                            {isEdit ? (
                                <div>
                                    <label className="block font-small text-gray-700">Title:</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-gray-700 border rounded"
                                        value={selectedNews?.title || ''}
                                        onChange={(e) => setSelectedNews((prev) => prev ? { ...prev, title: e.target.value } : null)}
                                    />
                                    <label className="block font-small text-gray-700">Content:</label>
                                    <textarea
                                        className="w-full p-2 mt-2 text-gray-700 border rounded"
                                        value={selectedNews?.content || ''}
                                        onChange={(e) => setSelectedNews((prev) => prev ? { ...prev, content: e.target.value } : null)}
                                    />
                                    <label className="block font-small text-gray-700">Image URL:</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-gray-700 border rounded"
                                        value={selectedNews?.image_url || ''}
                                        onChange={(e) => setSelectedNews((prev) => prev ? { ...prev, image_url: e.target.value } : null)}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white text-gray-600 border-gray-600">
                                    <p>Are you sure you want to delete this news?</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            {isEdit ? (
                                <Button onClick={handleSave}>Save</Button>
                            ) : (
                                <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                            )}
                            <Button variant="secondary" onClick={() => setSelectedNews(null)}>Cancel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default EditDeleteNews;
