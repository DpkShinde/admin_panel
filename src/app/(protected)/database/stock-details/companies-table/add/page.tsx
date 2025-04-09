"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormData from "@/types";

export default function AddStockRecord() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    market_cap_category: "",

    cash_flow: {
      fiscal_year: "",
      cash_from_operations: null,
      cash_from_investing: null,
      cash_from_financing: null,
      net_cash_flow: null,
    },

    balance_sheet: {
      fiscal_year: "",
      equity_capital: null,
      reserves: null,
      borrowings: null,
      other_liabilities: null,
      total_liabilities: null,
      fixed_assets: null,
      cwip: null,
      investments: null,
      other_assets: null,
      total_assets: null,
    },

    annual_profit_loss: {
      expenses: null,
      net_profit: null,
      fiscal_year: "",
      sales_cr: null,
      operating_profit: null,
      opm_percent: null,
      other_income: null,
      interest: null,
      depreciation: null,
      profit_before_tax: null,
      tax_percent: null,
      eps: null,
      dividend_payout: null,
    },

    financial_metrics: {
      metric_type: "",
      three_year: null,
      five_year: null,
      ten_year: null,
      ttm: null,
    },

    financial_ratios: {
      fiscal_year: "",
      debtor_days: null,
      inventory_days: null,
      days_payable: null,
      cash_conversion_cycle: null,
      working_capital_days: null,
      roce_percent: null,
    },

    valuation_inputs: {
      eps_growth_rate: null,
      expected_return_rate: null,
      future_pe: null,
      dps: null,
      mos_percent: null,
      base_eps: null,
      mrp: null,
      dp: null,
      valuation_date: "",
    },

    peer_analysis: {
      cmp: null,
      change_percent: null,
      net_sales_cr: null,
      latest_eps: null,
      net_profit_margin: null,
    },

    peer_valuations: {
      valuation: "",
      pe_ratio: null,
      ev_ebitda: null,
      peg_ratio: null,
    },

    quarterly_financials: {
      quarter_id: null,
      year: null,
      sales_cr: null,
      expenses: null,
      operating_profit: null,
      opm_percent: null,
      other_income: null,
      interest: null,
      depreciation: null,
      profit_before_tax: null,
      tax_percent: null,
      net_profit: null,
      eps: null,
      quarterly_financialscol: "",
    },
  });

  // Improved type handling for input fields
  const getFieldType = (key: string, value: any): string => {
    // Handle date fields
    if (key.includes("date") || key === "valuation_date") {
      return "date";
    }

    // Handle year fields
    if (key === "year" || key === "fiscal_year") {
      return "text"; // Could be numeric but often formatted with text
    }

    // Handle numeric fields
    if (
      key.includes("percent") ||
      key.includes("ratio") ||
      key.includes("days") ||
      key.includes("eps") ||
      key.includes("profit") ||
      key.includes("cash") ||
      key.includes("sales") ||
      key.includes("revenue") ||
      key.includes("expenses") ||
      key.includes("assets") ||
      key.includes("liabilities") ||
      key.includes("capital") ||
      key.includes("reserves") ||
      key.includes("investments") ||
      key.includes("income") ||
      key.includes("interest") ||
      key.includes("depreciation") ||
      key.includes("tax") ||
      key.includes("dividend") ||
      key.includes("cmp") ||
      key.includes("change") ||
      key.includes("cycle") ||
      key.includes("rate") ||
      key.includes("pe") ||
      key.includes("dps") ||
      key.includes("mos") ||
      key.includes("mrp") ||
      key.includes("dp") ||
      key === "ttm" ||
      key === "quarter_id" ||
      key.includes("year")
    ) {
      return "number";
    }

    // Default to text for everything else
    return "text";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    section?: string
  ) => {
    const { name, value } = e.target;

    // Better value parsing based on type
    let parsedValue: string | number | null = value;

    if (value === "") {
      parsedValue = null;
    } else if (e.target.type === "number" && !isNaN(Number(value))) {
      parsedValue = Number(value);
    }

    setFormData((prev: any) => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [name]: parsedValue,
          },
        };
      } else {
        return {
          ...prev,
          [name]: parsedValue,
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/stock_details_tables/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add stock record.");
      }

      toast.success("Stock record added successfully!");
      setTimeout(
        () => router.push("/database/stock-details/companies-table"),
        1200
      );
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    }
  };

  const renderSection = (section: string, label: string, color: string) => {
    // Type assertion to get section data
    const sectionData = formData[section as keyof typeof formData] as Record<
      string,
      any
    >;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className={`font-semibold text-xl mb-4 ${color} border-b pb-2`}>
          {label}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {Object.entries(sectionData).map(([key, val]) => {
            const fieldType = getFieldType(key, val);

            return (
              <div key={key} className="mb-2">
                <label className="capitalize block mb-1 font-medium text-gray-700 text-sm">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type={fieldType}
                  name={key}
                  value={val ?? ""}
                  onChange={(e) => handleChange(e, section)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                  step={fieldType === "number" ? "any" : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50">
      <div className="bg-white shadow-xl rounded-xl p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 border-b pb-4">
          Add Stock Record
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="font-semibold text-xl mb-4 text-indigo-600 border-b pb-2">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange(e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-1">
                  Market Cap Category
                </label>
                <input
                  type="text"
                  name="market_cap_category"
                  value={formData.market_cap_category}
                  onChange={(e) => handleChange(e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {renderSection("cash_flow", "Cash Flow", "text-green-600")}
          {renderSection("balance_sheet", "Balance Sheet", "text-blue-600")}
          {renderSection(
            "annual_profit_loss",
            "Annual Profit & Loss",
            "text-red-600"
          )}
          {renderSection(
            "financial_metrics",
            "Financial Metrics",
            "text-purple-600"
          )}
          {renderSection(
            "financial_ratios",
            "Financial Ratios",
            "text-indigo-600"
          )}
          {renderSection(
            "valuation_inputs",
            "Valuation Inputs",
            "text-yellow-700"
          )}
          {renderSection("peer_analysis", "Peer Analysis", "text-orange-600")}
          {renderSection(
            "peer_valuations",
            "Peer Valuations",
            "text-green-600"
          )}
          {renderSection(
            "quarterly_financials",
            "Quarterly Financials",
            "text-pink-600"
          )}

          <div className="text-center pt-4">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto py-3 px-8 rounded-md shadow-md transition-all font-medium"
            >
              Add Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
