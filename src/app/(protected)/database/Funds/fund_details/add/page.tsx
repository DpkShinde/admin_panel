"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { FundDetails } from "@/types";
import { Button } from "@/components/ui/button";

export default function AddFundRecord() {
  const [formData, setFormData] = useState<Omit<FundDetails, "ID">>({
    Scheme_Name: "",
    Scheme_Code: null,
    Scheme_Type: "",
    Sub_Category: "",
    NAV: null,
    AuM_Cr: null,
    Column_1D_Change: null,
    NAV_Date: "",
    Column_52W_High: null,
    Column_52WH_as_on: "",
    Column_52W_Low: null,
    Column_52WL_as_on: "",
    Column_1W: null,
    Column_1M: null,
    Column_3M: "",
    Column_6M: "",
    YTD: "",
    Column_1Y: "",
    Column_2Y: "",
    Column_3Y: "",
    Column_5Y: "",
    Column_10Y: "",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        throw new Error("Failed to add the record. Please try again.");
      }
      toast.success("Fund record added successfully!");
      setTimeout(() => {
        router.push("/database/Funds/fund_details");
      }, 1000);

      setFormData({
        Scheme_Name: "",
        Scheme_Code: null,
        Scheme_Type: "",
        Sub_Category: "",
        NAV: null,
        AuM_Cr: null,
        Column_1D_Change: null,
        NAV_Date: "",
        Column_52W_High: null,
        Column_52WH_as_on: "",
        Column_52W_Low: null,
        Column_52WL_as_on: "",
        Column_1W: null,
        Column_1M: null,
        Column_3M: "",
        Column_6M: "",
        YTD: "",
        Column_1Y: "",
        Column_2Y: "",
        Column_3Y: "",
        Column_5Y: "",
        Column_10Y: "",
      });
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value === "" ? null : value });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Add Fund Record
      </h1>

      {successMessage && (
        <p className="text-green-600 text-center">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 text-center">{errorMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid layout for form fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col">
              <label htmlFor={key} className="text-gray-700 font-semibold">
                {key}:
              </label>
              <input
                type={
                  key.includes("Date")
                    ? "date"
                    : key.includes("Column") ||
                      key === "NAV" ||
                      key === "AuM_Cr"
                    ? "number"
                    : "text"
                }
                name={key}
                value={formData[key as keyof typeof formData] ?? ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-indigo-300 w-full"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <Button type="submit" variant="secondary">
            Add Record
          </Button>
        </div>
      </form>
    </div>
  );
}
