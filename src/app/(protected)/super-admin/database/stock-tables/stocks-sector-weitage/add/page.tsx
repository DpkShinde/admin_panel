"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function AddStockRecord() {
  const [formData, setFormData] = useState({
    Sector: "",
    NumberOfCompanies: 0,
    Weightage: 0,
    MarketCap: 0,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/stocks_sector_weitage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        throw new Error("Failed to add the record. Please try again.");
      } else {
        toast.success("Sector record added successfully!");
        setTimeout(() => {
          router.push("/super-admin/database/stock-tables/stocks-sector-weitage");
        }, 1000);
      }

      const data = await res.json();
      setFormData({
        Sector: "",
        NumberOfCompanies: 0,
        Weightage: 0,
        MarketCap: 0,
      });
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Add Stock Record
      </h1>

      {successMessage && (
        <p className="text-green-600 text-center">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 text-center">{errorMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Layout for Two Inputs Per Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-gray-700 font-semibold">{key}:</label>
              <input
                type={key === "Sector" ? "text" : "number"}
                name={key}
                value={formData[key as keyof typeof formData]}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full"
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Add Record
          </button>
        </div>
      </form>
    </div>
  );
}
