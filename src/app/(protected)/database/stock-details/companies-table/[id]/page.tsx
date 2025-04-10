"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

// Type definitions
interface CashFlow {
  fiscal_year: string;
  cash_from_operations: number | null;
  cash_from_investing: number | null;
  cash_from_financing: number | null;
  net_cash_flow: number | null;
}

interface BalanceSheet {
  fiscal_year: string;
  equity_capital: number | null;
  reserves: number | null;
  borrowings: number | null;
  other_liabilities: number | null;
  total_liabilities: number | null;
  fixed_assets: number | null;
  cwip: number | null;
  investments: number | null;
  other_assets: number | null;
  total_assets: number | null;
}

interface AnnualProfitLoss {
  expenses: number | null;
  net_profit: number | null;
  fiscal_year: string;
  sales_cr: number | null;
  operating_profit: number | null;
  opm_percent: number | null;
  other_income: number | null;
  interest: number | null;
  depreciation: number | null;
  profit_before_tax: number | null;
  tax_percent: number | null;
  eps: number | null;
  dividend_payout: number | null;
}

interface FinancialMetrics {
  metric_type: string;
  three_year: number | null;
  five_year: number | null;
  ten_year: number | null;
  ttm: number | null;
}

interface FinancialRatios {
  fiscal_year: string;
  debtor_days: number | null;
  inventory_days: number | null;
  days_payable: number | null;
  cash_conversion_cycle: number | null;
  working_capital_days: number | null;
  roce_percent: number | null;
}

interface ValuationInputs {
  eps_growth_rate: number | null;
  expected_return_rate: number | null;
  future_pe: number | null;
  dps: number | null;
  mos_percent: number | null;
  base_eps: number | null;
  mrp: number | null;
  dp: number | null;
  valuation_date: string;
}

interface PeerAnalysis {
  cmp: number | null;
  change_percent: number | null;
  net_sales_cr: number | null;
  latest_eps: number | null;
  net_profit_margin: number | null;
}

interface PeerValuations {
  valuation: string;
  pe_ratio: number | null;
  ev_ebitda: number | null;
  peg_ratio: number | null;
}

interface QuarterlyFinancials {
  quarter_id: number | null;
  year: number | null;
  sales_cr: number | null;
  expenses: number | null;
  operating_profit: number | null;
  opm_percent: number | null;
  other_income: number | null;
  interest: number | null;
  depreciation: number | null;
  profit_before_tax: number | null;
  tax_percent: number | null;
  net_profit: number | null;
  eps: number | null;
  quarterly_financialscol: string;
}

interface FormDataType {
  name: string;
  market_cap_category: string;
  cash_flow: Partial<CashFlow>;
  balance_sheet: Partial<BalanceSheet>;
  annual_profit_loss: Partial<AnnualProfitLoss>;
  financial_metrics: Partial<FinancialMetrics>;
  financial_ratios: Partial<FinancialRatios>;
  valuation_inputs: Partial<ValuationInputs>;
  peer_analysis: Partial<PeerAnalysis>;
  peer_valuations: Partial<PeerValuations>;
  quarterly_financials: Partial<QuarterlyFinancials>[];
}

// Financial section configuration for DRY code
const financialSections = [
  { id: "cash_flow", title: "Cash Flow" },
  { id: "balance_sheet", title: "Balance Sheet" },
  { id: "annual_profit_loss", title: "Annual Profit & Loss" },
  { id: "financial_metrics", title: "Financial Metrics" },
  { id: "financial_ratios", title: "Financial Ratios" },
  { id: "valuation_inputs", title: "Valuation Inputs" },
  { id: "peer_analysis", title: "Peer Analysis" },
  { id: "peer_valuations", title: "Peer Valuations" },
];

export default function UpdateStocks() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    market_cap_category: "",
    cash_flow: {},
    balance_sheet: {},
    annual_profit_loss: {},
    financial_metrics: {},
    financial_ratios: {},
    valuation_inputs: {},
    peer_analysis: {},
    peer_valuations: {},
    quarterly_financials: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle input change for regular fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    section?: string,
    index?: number
  ) => {
    const { name, value } = event.target;
    const parsedValue = isNaN(Number(value)) || value === "" ? value : Number(value);

    setFormData((prev : any) => {
      if (section === "quarterly_financials" && typeof index === "number") {
        const updatedQuarterlies = [...prev.quarterly_financials];
        updatedQuarterlies[index] = {
          ...updatedQuarterlies[index],
          [name]: parsedValue,
        };
        return { ...prev, quarterly_financials: updatedQuarterlies };
      } else if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof FormDataType],
            [name]: parsedValue,
          },
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  // Fetch stock data
  useEffect(() => {
    if (!id) return;

    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/stock_details_tables/companies/${id}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch stock details: ${res.statusText}`);
        }

        const responseData = await res.json();
        const data = responseData.data;

        if (!data) throw new Error("No data found for this stock");

        setFormData({
          name: data.name || "",
          market_cap_category: data.market_cap_category || "",
          cash_flow: data.cash_flow || {},
          balance_sheet: data.balance_sheet || {},
          annual_profit_loss: data.annual_profit_loss || {},
          financial_metrics: data.financial_metrics || {},
          financial_ratios: data.financial_ratios || {},
          valuation_inputs: data.valuation_inputs || {},
          peer_analysis: data.peer_analysis || {},
          peer_valuations: data.peer_valuations || {},
          quarterly_financials: data.quarterly_financials || [],
        });
      } catch (error: any) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [id]);

  // Form submission handler
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/stock_details_tables/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Failed to update record: ${res.statusText}`);
      }

      toast.success("Stock record updated successfully!");
      setTimeout(() => {
        router.push("/database/stock-details/companies-table");
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
      toast.error(error.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a section of financial data
  const renderFinancialSection = (section: string, title: string) => (
    <div key={section} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formData[section as keyof FormDataType] &&
          Object.entries(formData[section as keyof FormDataType]).map(([field, value]) => (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                name={field}
                value={value ?? ""}
                onChange={(e) => handleChange(e, section)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Update Company Record
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Make changes to the company data and financial metrics
        </p>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Market Cap Category
                </label>
                <input
                  type="text"
                  name="market_cap_category"
                  value={formData.market_cap_category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Section Cards */}
          <div className="grid grid-cols-1 gap-6">
            {financialSections.map(section => renderFinancialSection(section.id, section.title))}
          </div>

          {/* Quarterly Financials */}
          {formData.quarterly_financials.length > 0 && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Quarterly Financials
              </h3>
              
              <div className="space-y-8">
                {formData.quarterly_financials.map((quarterData, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">Quarter {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(quarterData).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, " ")}
                          </label>
                          <input
                            type="text"
                            name={key}
                            value={value ?? ""}
                            onChange={(e) => handleChange(e, "quarterly_financials", index)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-indigo-400 font-medium text-sm flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Record</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}