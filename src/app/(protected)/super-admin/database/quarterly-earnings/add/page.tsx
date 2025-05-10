"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// #region INTERFACES
export interface CompanyFinancialResult {
  company_name: string; // Name linked to the company
  result_type: string;
  ltp_rs?: number | null;
  market_cap?: string | null; // Kept as string if it can include non-numeric like "Cr."
  revenue_cr?: number | null;
  change_percent?: number | null;
  tentative_date?: string | Date | null;
  gross_profit_percent?: number | null;
  net_profit_percent?: number | null;
  tag?: string | null;
  created_at?: string | Date | null; // Usually backend-set
  updated_at?: string | Date | null; // Usually backend-set
}
// #endregion

// #region HELPER FUNCTIONS (Outside component)
function getInputType(key: string, value: any): string {
  if (key.includes("date") || key.includes("_at")) return "date";
  if (key.includes("email")) return "email";
  if (key.includes("website") || key.includes("url") || key.includes("tag"))
    return "url"; // Treat tag as URL as per placeholder comment

  const numericKeysPatterns = [
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
    "performance", // Added for one_year_performance
    "revenue_cr", // Added for CompanyFinancialResult
    "change_percent", // Added for CompanyFinancialResult
    "gross_profit_percent", // Added for CompanyFinancialResult
    "net_profit_percent", // Added for CompanyFinancialResult
  ];
  if (
    typeof value === "number" ||
    numericKeysPatterns.some((p) => key.toLowerCase().includes(p)) // Use toLowerCase for broader matching
  ) {
    return "number";
  }
  return "text";
}

function getFieldPlaceholder(key: string): string {
  const lowerKey = String(key).toLowerCase();

  if (lowerKey.includes("company_id")) return "e.g., 101";
  if (lowerKey === "name" || lowerKey === "company_name")
    return "e.g., Reliance Industries Ltd.";

  if (lowerKey === "result_type") return "e.g., Quarterly, Annual";
  if (lowerKey.includes("ltp_rs")) return "e.g., 2500.75 (in Rs.)";
  if (lowerKey.includes("market_cap")) return "e.g., 1500000 Cr."; // Keeping string placeholder as per interface comment
  if (lowerKey.includes("revenue_cr")) return "e.g., 15000.50 (in Crores)";
  if (lowerKey.includes("change_percent")) return "e.g., 2.5 (for 2.5%)";
  if (lowerKey.includes("tentative_date")) return "Select date";
  if (lowerKey.includes("gross_profit_percent")) return "e.g., 35.0";
  if (lowerKey.includes("net_profit_percent")) return "e.g., 12.0";
  if (lowerKey.includes("tag"))
    return "Enter the URL you want to show on the query";

  // Default placeholder if no specific match
  const formattedKey = String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return `Enter ${formattedKey}`;
}

const formatDateForInput = (
  dateValue: string | Date | null | undefined
): string => {
  if (!dateValue) return "";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(3, "0"); // Changed to 3 for padding example, maybe keep 2? Let's keep 2.
    return `${year}-${month}-${day}`;
  } catch (e) {
    return "";
  }
};
// #endregion

export default function CompanyDataEntryPage() {
  // #region STATES
  const [companyFinancialResult, setCompanyFinancialResult] =
    useState<CompanyFinancialResult>({
      company_name: "", // User will input
      result_type: "",
      ltp_rs: null,
      market_cap: null,
      revenue_cr: null,
      change_percent: null,
      tentative_date: null,
      gross_profit_percent: null,
      net_profit_percent: null,
      tag: null,
      created_at: null, // Backend sets
      updated_at: null, // Backend sets
    });
  // #endregion

  const router = useRouter();

  // #region HANDLERS
  const handleInputChange = <T,>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    field: keyof T,
    value: string | number | boolean | null | Date | undefined
  ) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const parseInputToNumberOrNull = (value: string): number | null => {
    if (value.trim() === "") return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // No need to link companyInfo anymore, company_id and company_name are in the state
    const finalCompanyFinancialResult = { ...companyFinancialResult };

    const allData = {
      companyFinancialResult: finalCompanyFinancialResult,
    };

    console.log("Submitting data:", JSON.stringify(allData, null, 2));

    try {
      // Assuming the API endpoint is designed to handle just this data now
      const response = await fetch("/api/quaterly-earnings", {
        // Or adjust endpoint if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allData),
      });

      const resultText = await response.text();
      console.log("Raw response from server:", resultText);

      if (!response.ok) {
        let errorDetails = resultText;
        try {
          const jsonError = JSON.parse(resultText);
          errorDetails = jsonError.message || jsonError.error || resultText;
        } catch (e) {}
        throw new Error(
          `Network response was not ok (${response.status}): ${errorDetails}`
        );
      }

      let result;
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        throw new Error(
          "Response from server was not valid JSON: " + resultText
        );
      }

      console.log("Parsed response from server:", result);
      alert(
        "Data submitted successfully! Message: " + (result.message || "Success")
      );
      // Redirect after success
      setTimeout(() => {
        router.push("/super-admin/database/financial-results"); // Adjusted redirect based on likely data type
      }, 3000);
    } catch (error: any) {
      console.error("Error during form submission:", error);
      alert(
        `An error occurred while submitting the form: ${error.message}\nPlease check console for details.`
      );
    }
  };
  // #endregion

  const inputStyle =
    "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const buttonStyle =
    "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400";
  const sectionTitleStyle = "text-xl font-semibold mb-3 mt-6 pb-2 border-b";

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Company Financial Result Data Entry
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* CompanyFinancialResult Section */}
        <section>
          <h2 className={sectionTitleStyle}>
            Company Financial Result (Summary)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg shadow bg-white">
            {(
              Object.keys(companyFinancialResult) as Array<
                keyof CompanyFinancialResult
              >
            )
              .filter(
                (key) =>
                  key !== "created_at" && // Backend sets
                  key !== "updated_at" // Backend sets
              )
              .map((key) => {
                const inputType = getInputType(
                  key,
                  companyFinancialResult[key]
                );
                // Handle market_cap specifically if it's string
                const currentValue = companyFinancialResult[key];
                const displayValue =
                  inputType === "date"
                    ? formatDateForInput(currentValue as string | Date | null)
                    : currentValue === null ||
                      currentValue === undefined ||
                      (typeof currentValue === "number" && isNaN(currentValue))
                    ? ""
                    : String(currentValue);

                return (
                  <div key={key}>
                    <label htmlFor={`cfr-${key}`} className={labelStyle}>
                      {String(key)
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      :
                    </label>
                    {key === "market_cap" ? ( // Special handling for market_cap as string
                      <input
                        type="text" // Always text for market_cap
                        id={`cfr-${key}`}
                        name={key}
                        value={displayValue}
                        onChange={(e) => {
                          handleInputChange(
                            setCompanyFinancialResult,
                            key,
                            e.target.value === "" ? null : e.target.value
                          );
                        }}
                        className={inputStyle}
                        placeholder={getFieldPlaceholder(key)}
                      />
                    ) : (
                      <input
                        type={inputType}
                        step={inputType === "number" ? "any" : undefined}
                        id={`cfr-${key}`}
                        name={key}
                        value={displayValue}
                        onChange={(e) => {
                          let val: string | number | null | Date =
                            e.target.value;
                          if (inputType === "number") {
                            val = parseInputToNumberOrNull(e.target.value);
                          } else if (inputType === "date") {
                            val = e.target.value === "" ? null : e.target.value;
                          }
                          handleInputChange(
                            setCompanyFinancialResult,
                            key,
                            val
                          );
                        }}
                        className={inputStyle}
                        placeholder={getFieldPlaceholder(key)}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </section>
        <section>
          <Button
            onClick={() =>
              router.push("/super-admin/database/quarterly-results/add")
            }
          >
            Add Quaterly Results Data
          </Button>
        </section>
      </form>
    </div>
  );
}
