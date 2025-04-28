"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { FundDetails } from "@/types";

type EditableFundDetails = Omit<FundDetails, "ID">;

export default function UpdateFund() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<EditableFundDetails>({
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

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchFundData() {
      try {
        const res = await fetch(`/api/funds/${id}`);
        if (!res.ok) throw new Error("Failed to fetch fund details.");

        const data = await res.json();
        const { ID, ...editableData } = data?.data;
        // console.log(data.data);
        if (!data) throw new Error("No record found.");

        setFormData((prevData) => ({ ...prevData, ...editableData }));
      } catch (error: any) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFundData();
  }, [id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: [
        "Scheme_Code",
        "NAV",
        "AuM_Cr",
        "Column_1D_Change",
        "Column_52W_High",
        "Column_52W_Low",
        "Column_1W",
        "Column_1M",
      ].includes(name)
        ? value === ""
          ? null
          : Number(value)
        : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/funds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update the record.");

      toast.success("Mutual fund record updated successfully!");
      setTimeout(() => router.push("/super-admin/database/Funds/fund_details"), 1000);
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  }

  if (loading)
    return <p className="text-center text-gray-600">Loading fund data...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Update Mutual Fund Record
      </h1>
      {errorMessage && (
        <p className="text-red-600 text-center">{errorMessage}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(formData).map((key) => {
            const typedKey = key as keyof EditableFundDetails;
            return (
              <div key={key} className="flex flex-col">
                <label htmlFor={key} className="text-gray-700 font-semibold">
                  {key.replace(/_/g, " ")}:
                </label>
                <input
                  type={key.includes("Date") ? "date" : "text"}
                  id={key}
                  name={key}
                  value={formData[typedKey] ?? ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full"
                  required
                />
              </div>
            );
          })}
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
