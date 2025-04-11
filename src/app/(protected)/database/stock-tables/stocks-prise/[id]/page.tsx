"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // Group dates by week for better UI organization
  const getWeeklyGroups = () => {
    if (!formData) return [];

    const weeks = [];
    const datesToShow = Object.keys(formData).filter((key) =>
      key.startsWith("2025-")
    );
    datesToShow.sort(); 

    for (let i = 0; i < datesToShow.length; i += 7) {
      weeks.push(datesToShow.slice(i, i + 7));
    }

    return weeks;
  };

  return (
    <div
      data-slot="card"
      className="bg-white text-black flex flex-col gap-6 rounded-xl border py-6 shadow-sm max-w-4xl mx-auto p-6"
    >
      <div className="px-6">
        <h2 className="text-2xl font-bold text-green-800">Edit Stock</h2>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading stock data...</p>
        </div>
      ) : formData ? (
        <div className="px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="stock_name">Stock Name</Label>
                <Input
                  id="stock_name"
                  name="stock_name"
                  value={formData.stock_name || ""}
                  onChange={handleChange}
                  placeholder="Enter stock name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="stock_symbol">Stock Symbol</Label>
                <Input
                  id="stock_symbol"
                  name="stock_symbol"
                  value={formData.stock_symbol || ""}
                  onChange={handleChange}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-4">
                April 2025 Price History
              </h3>

              {getWeeklyGroups().map((weekDates, weekIndex) => (
                <div key={`week-${weekIndex}`} className="mb-6">
                  <h4 className="font-medium mb-2">Week {weekIndex + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weekDates.map((date) => (
                      <div key={date} className="flex flex-col">
                        <Label htmlFor={date} className="text-sm">
                          {new Date(`${date}T00:00:00`).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Label>
                        <Input
                          id={date}
                          type="number"
                          name={date}
                          value={
                            (
                              formData as unknown as Record<
                                string,
                                number | null
                              >
                            )[date] || ""
                          }
                          onChange={handleChange}
                          placeholder="Price"
                          step="0.01"
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push("/database/stock-tables/stocks-prise")
                }
                className="w-32"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white w-32"
              >
                Update Stock
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-red-600">Stock data not found</p>
          <Button
            onClick={() => router.push("/database/stock-tables/stocks-prise")}
            className="mt-4"
          >
            Back to Stocks
          </Button>
        </div>
      )}
    </div>
  );
}
