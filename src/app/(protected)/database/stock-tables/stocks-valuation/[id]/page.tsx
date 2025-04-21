"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { StockScreenerValuation } from "@/types";

export default function UpdateStocks() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [formData, setFormData] = useState<StockScreenerValuation>({
    id: 0,
    Symbol: "",
    sector: "",
    MarketCap: 0,
    MarketCapPercentage: 0,
    PERatio: 0,
    PSRatio: 0,
    PBRatio: 0,
    PFCFRatio: null,
    Price: 0,
    EnterpriseValue: 0,
    EVRevenue: 0,
    EVEBIT: 0,
    EVEBITDA: 0,
    Market_cap_crore: 0,
    perf: "",
    index: "",
    market_cap_category: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch stock details if ID is available
  useEffect(() => {
    if (!id) return;

    async function fetchStockData() {
      try {
        const res = await fetch(`/api/stocks_screener_valuetion/${id}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch stock details.");
        const data = await res.json();
        console.log(data);

        setFormData((prev) => ({
          ...prev, // Keep previous state
          id: data[0]?.id || 0, // Ensure no errors if `data[0]` is undefined
          Symbol: data?.Symbol || "",
          sector: data?.sector || "",
          MarketCap: parseFloat(data?.MarketCap) || 0,
          MarketCapPercentage: parseFloat(data?.MarketCapPercentage) || 0,
          PERatio: parseFloat(data?.PERatio) || 0,
          PSRatio: parseFloat(data?.PSRatio) || 0,
          PBRatio: parseFloat(data?.PBRatio) || 0,
          PFCFRatio: data[0]?.PFCFRatio ? parseFloat(data?.PFCFRatio) : null,
          Price: parseFloat(data?.Price) || 0,
          EnterpriseValue: parseFloat(data?.EnterpriseValue) || 0,
          EVRevenue: parseFloat(data?.EVRevenue) || 0,
          EVEBIT: parseFloat(data?.EVEBIT) || 0,
          EVEBITDA: parseFloat(data?.EVEBITDA) || 0,
          Market_cap_crore: parseFloat(data?.Market_cap_crore) || 0,
          perf: data?.perf || "",
          index: data?.index || "",
          market_cap_category: data?.market_cap_category || "",
        }));
      } catch (error: any) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [id]);

  // Handle input changes
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]:
        name === "Symbol" ||
        "sector" ||
        "perf" ||
        "index" ||
        "market_cap_category"
          ? value
          : parseFloat(value) || 0,
    });
  }

  // Handle form submission
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/stocks_screener_valuetion/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok)
        throw new Error("Failed to update the record. Please try again.");

      toast.success("Stock record updated successfully!");
      setTimeout(() => {
        router.push("/database/stock-tables/stocks-valuation");
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  }

  if (loading)
    return <p className="text-center text-gray-600">Loading stock data...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Update Stock Record
      </h1>

      {errorMessage && (
        <p className="text-red-600 text-center">{errorMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData)
            .filter((key) => key !== "id" && key !== "0")
            .map((key) => (
              <div key={key} className="flex flex-col">
                <label className="text-gray-700 font-semibold">{key}:</label>
                <input
                  type={
                    key === "Symbol" ||
                    "sector" ||
                    "index" ||
                    "perf" ||
                    "market_cap_category"
                      ? "text"
                      : "number"
                  }
                  name={key}
                  value={formData[key as keyof typeof formData] ?? ""}
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
            Update Record
          </button>
        </div>
      </form>
    </div>
  );
}
