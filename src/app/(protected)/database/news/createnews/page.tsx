'use client'
import { useState } from "react";

interface NewsForm {
  title: string;
  image_url: string;
  content: string;
}

const postNews = async (newsData: NewsForm) => {
  try {
    const response = await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...newsData, action: "create" }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error posting news:", error);
    return { success: false, message: "Error posting news" };
  }
};

export default function CreateNews() {
  const [formData, setFormData] = useState<NewsForm>({
    title: "",
    image_url: "",
    content: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await postNews(formData);
    setMessage(result.message);
  };

  return (
    <div id="create_news_section" className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Create News</h3>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          name="title"
          placeholder="News Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="p-2 border rounded-md"
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={handleChange}
          required
          className="p-2 border rounded-md"
        />
        <textarea
          name="content"
          placeholder="News Content"
          rows={5}
          value={formData.content}
          onChange={handleChange}
          required
          className="p-2 border rounded-md"
        ></textarea>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add News
        </button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
