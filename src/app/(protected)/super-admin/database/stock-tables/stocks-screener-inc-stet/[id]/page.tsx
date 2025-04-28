"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { StockScreenerIncomeStatement } from "@/types";

export default function UpdateStocks() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [formData, setFormData] = useState<StockScreenerIncomeStatement>({
    id: 0,
    Symbol: "",
    Market_cap: "",
    sector: "",
    Revenue: 0,
    RevenueGrowth: 0,
    GrossProfit: 0,
    OperatingIncome: 0,
    NetIncome: 0,
    EBITDA: 0,
    EPS_Diluted: 0,
    EPSDilutedGrowth: 0,
    Market_cap_crore: 0,
    pToE: 0,
    pToB: 0,
    peg: 0,
    pToS: 0,
    pToCF: 0,
    price: 0,
    ev: 0,
    evEbitda: 0,
    evSales: 0,
    evEbit: 0,
    index: "",
    marketCapCategory: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch stock details if ID is available
  useEffect(() => {
    if (!id) return;

    async function fetchStockData() {
      try {
        const res = await fetch(`/api/stocks_screener_inc_stet/${id}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch stock details.");
        const data = await res.json();
        console.log(data[0].id);
        console.log(data);

        setFormData((prev: any) => ({
          ...prev, // Keep previous state
          id: 0,
          Symbol: data[0].Symbol,
          Market_cap: data[0].Market_cap,
          sector: data[0].sector,
          Revenue: data[0].Revenue,
          RevenueGrowth: data[0].RevenueGrowth,
          GrossProfit: data[0].GrossProfit,
          OperatingIncome: data[0].OperatingIncome,
          NetIncome: data[0].NetIncome,
          EBITDA: data[0].EBITDA,
          EPS_Diluted: data[0].EPS_Diluted,
          EPSDilutedGrowth: data[0].EPSDilutedGrowth,
          Market_cap_crore: data[0].Market_cap_crore,
          pToE: data[0].pToE,
          pToB: data[0].pToB,
          peg: data[0].peg,
          pToS: data[0].pToS,
          pToCF: data[0].pToCF,
          price: data[0].price,
          ev: data[0].ev,
          evEbitda: data[0].evEbitda,
          evSales: data[0].evSales,
          evEbit: data[0].evEbit,
          index: data[0].index,
          marketCapCategory: data[0].marketCapCategory,
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
        "Market_cap" ||
        "sector" ||
        "index" ||
        "marketCapCategory"
          ? value
          : parseFloat(value) || 0,
    });
  }

  // Handle form submission
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/stocks_screener_inc_stet/${id}`, {
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
        router.push("/super-admin/database/stock-tables/stocks-screener-inc-stet");
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
                    key === "Market_cap" ||
                    key === "sector" ||
                    key === "index" ||
                    key === "marketCapCategory"
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
