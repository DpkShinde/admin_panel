"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { StockList, StockScreenerData } from "@/types";

export default function UpdateStocks() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<Omit<StockList, "id">>({
    company: "",
    ltp_inr: 0,
    change_percent: 0,
    market_cap_cr: 0,
    roe: 0,
    pe: 0,
    pbv: 0,
    ev_ebitda: 0,
    sales_growth_5y: 0,
    profit_growth_5y: 0,
    clarification: "",
    sector: "",
    High_52W_INR: 0,
    Low_52W_INR: 0,
    stock_index: "",
    event_date: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchStockData() {
      console.log(id);
      try {
        const res = await fetch(`/api/stocks_list/${id}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch stock details.");

        const data = await res.json();
        console.log(data);
        if (!data) throw new Error("No record found.");

        setFormData({
          company:data[0].company || "",
          ltp_inr:data[0].ltp_inr || 0,
          change_percent:data[0].change_percent || 0,
          market_cap_cr:data[0].market_cap_cr || 0,
          roe:data[0].roe || 0,
          pe:data[0].pe || 0,
          pbv:data[0].pbv || 0,
          ev_ebitda:data[0].ev_ebitda || 0,
          sales_growth_5y:data[0].sales_growth_5y || 0,
          profit_growth_5y:data[0].profit_growth_5y || 0,
          clarification:data[0].clarification || "",
          sector:data[0].sector || "",
          High_52W_INR:data[0].High_52W_INR || 0,
          Low_52W_INR:data[0].Low_52W_INR || 0,
          stock_index:data[0].Low_52W_INR || "",
          event_date:data[0].event_date || "",
        });
      } catch (error: any) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/stocks_list/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update the record.");

      toast.success("Stock record updated successfully!");
      setTimeout(() => {
        router.push("/super-admin/database/stock-tables/stocks_list");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col">
              <label htmlFor={key} className="text-gray-700 font-semibold">
                {key}:
              </label>
              <input
                type={
                  key === "event_date"
                    ? "date"
                    : typeof formData[key as keyof typeof formData] === "number"
                    ? "number"
                    : "text"
                }
                id={key}
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
