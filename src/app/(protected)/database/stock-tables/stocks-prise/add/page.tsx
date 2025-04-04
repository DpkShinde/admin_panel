"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

export default function AddStock() {
  const router = useRouter();
  const [formData, setFormData]: any = useState({
    stock_name: "",
    stock_symbol: "",
    "2025-04-01": "",
    "2025-04-02": "",
    "2025-04-03": "",
    "2025-04-04": "",
    "2025-04-05": "",
    "2025-04-06": "",
    "2025-04-07": "",
    "2025-04-08": "",
    "2025-04-09": "",
    "2025-04-10": "",
    "2025-04-11": "",
    "2025-04-12": "",
    "2025-04-13": "",
    "2025-04-14": "",
    "2025-04-15": "",
    "2025-04-16": "",
    "2025-04-17": "",
    "2025-04-18": "",
    "2025-04-19": "",
    "2025-04-20": "",
    "2025-04-21": "",
    "2025-04-22": "",
    "2025-04-23": "",
    "2025-04-24": "",
    "2025-04-25": "",
    "2025-04-26": "",
    "2025-04-27": "",
    "2025-04-28": "",
    "2025-04-29": "",
    "2025-04-30": "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // convert empty string values to null before sending
    const processedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );
    try {
      const res = await fetch("/api/stocks_prise_history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });
      if (!res.ok) throw new Error("Failed to add stock");
      toast.success("Stock added successfully");
      router.push("/database/stock-tables/stocks-prise");
    } catch (e) {
      toast.error("Error adding stock");
    }
  };

  return (
    <div className="p-6 shadow-lg rounded-lg bg-white max-w-lg mx-auto">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-green-800 mb-4">Add Stock</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="stock_name"
          placeholder="Stock Name"
          className="w-full p-2 border rounded"
          value={formData.stock_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="stock_symbol"
          placeholder="Stock Symbol"
          className="w-full p-2 border rounded"
          value={formData.stock_symbol}
          onChange={handleChange}
          required
        />
        {Object.keys(formData)
          .filter((key) => key.startsWith("2025-04"))
          .map((date) => (
            <input
              key={date}
              type="number"
              name={date}
              placeholder={date}
              className="w-full p-2 border rounded"
              value={formData[date]}
              onChange={handleChange}
            />
          ))}
        <Button
          type="submit"
          className="w-full bg-green-700 text-white p-2 rounded hover:bg-green-800"
        >
          Add Stock
        </Button>
      </form>
    </div>
  );
}
