"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { StockPrise } from "@/types";

export default function EditStock() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<StockPrise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        const res = await fetch(`/api/stocks_prise_history/${id}`);
        if (!res.ok) throw new Error("Failed to fetch stock data");
        const response = await res.json();
        const data = response.data;
        setFormData(data);
      } catch (err) {
        setError("Error loading stock data");
        toast.error("Error loading stock data");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchStockData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev ? { ...prev, [name]: value === "" ? null : value } : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/stocks_prise_history/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      toast.success("Stock updated successfully");
      router.push("/database/stock-tables/stocks-prise");
    } catch (err) {
      setError("Failed to update stock");
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="p-6 shadow-lg rounded-lg bg-white max-w-lg mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-green-800 mb-4">Edit Stock</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        formData && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="stock_name"
              value={formData.stock_name || ""}
              onChange={handleChange}
              placeholder="Stock Name"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="stock_symbol"
              value={formData.stock_symbol || ""}
              onChange={handleChange}
              placeholder="Stock Symbol"
              className="w-full p-2 border rounded"
            />
            {Object.keys(formData).map((key) =>
              key.startsWith("2025-") ? (
                <input
                  key={key}
                  type="number"
                  name={key}
                  value={
                    (formData as unknown as Record<string, number | null>)[
                      key
                    ] || ""
                  }
                  onChange={handleChange}
                  placeholder={`Price on ${key}`}
                  className="w-full p-2 border rounded"
                />
              ) : null
            )}
            <Button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Update Stock
            </Button>
          </form>
        )
      )}
    </div>
  );
}
