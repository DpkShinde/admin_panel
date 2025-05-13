"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface CompanyFinancialResult {
  company_name: string;
  result_type: string;
  ltp_rs?: number | null;
  market_cap?: string | null;
  revenue_cr?: number | null;
  change_percent?: number | null;
  tentative_date?: string | Date | null;
  gross_profit_percent?: number | null;
  net_profit_percent?: number | null;
  tag?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

const getInputType = (key: string): string => {
  if (key.includes("date") || key.includes("_at")) return "date";
  if (key.includes("email")) return "email";
  if (key.includes("url") || key.includes("website") || key.includes("tag"))
    return "url";

  const numericPatterns = [
    "_id",
    "year",
    "quarter",
    "_percent",
    "_rs",
    "amount",
    "value",
    "price",
    "margin",
    "eps",
    "roe",
    "roce",
    "nim",
    "car",
    "ttm_pe",
    "pb_ratio",
    "capital",
    "surplus",
    "interest",
    "deposits",
    "borrowings",
    "liabilities",
    "assets",
    "loans",
    "advances",
    "investments",
    "expenditure",
    "profit",
    "tax",
    "dii",
    "promoters",
    "public",
    "others",
    "performance",
    "revenue_cr",
    "change_percent",
    "gross_profit_percent",
    "net_profit_percent",
  ];

  if (numericPatterns.some((p) => key.toLowerCase().includes(p)))
    return "number";
  return "text";
};

const formatDateForInput = (
  dateValue: string | Date | null | undefined
): string => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export default function EditCompanyDataPage() {
  const [companyData, setCompanyData] = useState<CompanyFinancialResult | null>(
    null
  );
  const router = useRouter();
  const { id } = useParams();
  console.log("Record ID from URL:", id);
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          console.log("Fetching data for record ID:", id);
          const res = await fetch(`/api/quaterly-earnings/${id}`);
          if (!res.ok) throw new Error("Failed to fetch record");
          const data = await res.json();
          console.log("Fetched data:", data.company_financial_results[0]);
          setCompanyData(data?.company_financial_results[0]);
        } catch (err: any) {
          console.error(err);
          alert(`Error fetching data: ${err.message}`);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleChange = (field: keyof CompanyFinancialResult, value: any) => {
    setCompanyData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyData || !id) return;
    console.log(companyData);
    try {
      const res = await fetch(`/api/quaterly-earnings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: companyData }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update");

      alert("Record updated successfully!");
      router.push("/super-admin/database/quarterly-earnings");
    } catch (err: any) {
      console.error(err);
      alert(`Error updating record: ${err.message}`);
    }
  };

  if (!companyData)
    return <div className="p-6 text-center">Loading record...</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Edit Company Financial Result
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg shadow bg-white">
          {(
            Object.entries(companyData) as [keyof CompanyFinancialResult, any][]
          )
            .filter(([key]) => key !== "created_at" && key !== "updated_at")
            .map(([key, value]) => {
              const inputType = getInputType(key);
              const displayValue =
                inputType === "date" ? formatDateForInput(value) : value ?? "";

              return (
                <div key={key}>
                  <label
                    htmlFor={`edit-${key}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <input
                    type={inputType}
                    step={inputType === "number" ? "any" : undefined}
                    id={`edit-${key}`}
                    name={key}
                    value={displayValue}
                    onChange={(e) => {
                      const newValue =
                        inputType === "number"
                          ? e.target.value === ""
                            ? null
                            : parseFloat(e.target.value)
                          : e.target.value === ""
                          ? null
                          : e.target.value;
                      handleChange(key, newValue);
                    }}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    placeholder={`Enter ${key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}`}
                  />
                </div>
              );
            })}
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white hover:bg-green-700"
          >
            Update Record
          </Button>
        </div>
      </form>
    </div>
  );
}
