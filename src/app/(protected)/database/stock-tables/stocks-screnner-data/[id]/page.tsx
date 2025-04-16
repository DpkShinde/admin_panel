"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { StockScreenerData } from "@/types";

export default function UpdateStocks() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<Omit<StockScreenerData, "id">>({
    CompanyName: "",
    LastTradedPrice: 0,
    ChangePercentage: null,
    MarketCap: null,
    High52W: null,
    Low52W: null,
    Sector: "",
    CurrentPE: null,
    IndexName: null,
    RecordDate: "",
    ROE: null,
    PBV: null,
    EV_EBITDA: null,
    FiveYearSalesGrowth: null,
    FiveYearProfitGrowth: null,
    Volume: null,
    EPS: null,
    EPSGrowth: null,
    DividendYield: null,
    DividendAmount: null,
    ROCE: null,
    Analyst_Rating:null,
    Market_cap_crore:null,
    sector_earnings_yoy:null,
    sector_earnings_yoy_per:null,
    Industries:"",
    NIFTY_50:"",
    NIFTY_NEXT_50:"",
    NIFTY_100:"",
    NIFTY_200:"",
    NIFTY_SMALLCAP_100:"",
    NIFTY_MIDSMALLCAP_400:"",
    NIFTY_LARGEMIDCAP_250:"",
    NIFTY_500:"",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchStockData() {
      console.log(id);
      try {
        const res = await fetch(`/api/stocks_screnner_data/${id}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch stock details.");

        const data = await res.json();
        console.log(data);
        if (!data) throw new Error("No record found.");

        setFormData({
          CompanyName: data.CompanyName || "",
          LastTradedPrice: data.LastTradedPrice || 0,
          ChangePercentage: data.ChangePercentage || null,
          MarketCap: data.MarketCap || null,
          High52W: data.High52W || null,
          Low52W: data.Low52W || null,
          Sector: data.Sector || "",
          CurrentPE: data.CurrentPE || null,
          IndexName: data.IndexName || "",
          RecordDate: data.RecordDate
            ? new Date(data.RecordDate).toISOString().split("T")[0]
            : "",
          ROE: data.ROE || null,
          PBV: data.PBV || null,
          EV_EBITDA: data.EV_EBITDA || null,
          FiveYearSalesGrowth: data.FiveYearSalesGrowth || null,
          FiveYearProfitGrowth: data.FiveYearProfitGrowth || null,
          Volume: data.Volume || null,
          EPS: data.EPS || null,
          EPSGrowth: data.EPSGrowth || null,
          DividendYield: data.DividendYield || null,
          DividendAmount: data.DividendAmount || null,
          ROCE: data.ROCE || null,
          Analyst_Rating: data.Analyst_Rating || "",
          Market_cap_crore : data.Market_cap_crore || null,
          sector_earnings_yoy : data.sector_earnings_yoy || null,
          sector_earnings_yoy_per : data.sector_earnings_yoy_per || null,
          Industries : data.Industries || "",
          NIFTY_50 : data.NIFTY_50 || "",
          NIFTY_NEXT_50 : data.NIFTY_NEXT_50 || "",
          NIFTY_100 : data.NIFTY_100 || "",
          NIFTY_200 : data.NIFTY_200 || "",
          NIFTY_SMALLCAP_100 : data.NIFTY_SMALLCAP_100 || "",
          NIFTY_MIDSMALLCAP_400 : data.NIFTY_MIDSMALLCAP_400 || "",
          NIFTY_LARGEMIDCAP_250 : data.NIFTY_LARGEMIDCAP_250 || "",
          NIFTY_500 : data.NIFTY_500 || "",
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
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "RecordDate" ? value : parseFloat(value) || value || "",
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/stocks_screnner_data/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update the record.");

      toast.success("Stock record updated successfully!");
      setTimeout(() => {
        router.push("/database/stock-tables/stocks-screnner-data");
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
                  key === "RecordDate"
                    ? "date"
                    : typeof formData[key as keyof typeof formData] === "string"
                    ? "text"
                    : "number"
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
