"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fullStockResearchSchema } from "@/lib/schemas"; // Ensure this path is correct
import { z } from "zod";

interface CompanyOption {
  research_stock_id: number;
  symbol: string;
  name: string;
}

// Define the type for the form data, inferred from the Zod schema
type FullStockResearchFormData = z.infer<typeof fullStockResearchSchema>;

interface FormField {
  name: string;
  label: string;
  type?: string;
  step?: string;
  required?: boolean;
  isTextArea?: boolean;
  isCheckbox?: boolean;
  // options?: CompanyOption[]; // Not needed here as stock symbol is a dedicated select
}

interface FormSection {
  title: string;
  section: keyof Omit<FullStockResearchFormData, 'stock'>; // Exclude 'stock' from dynamic sections
  bgColor: string;
  borderColor: string;
  textColor: string;
  fields: FormField[];
}

export default function AddDetailInfo() {
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch, // Use watch to observe form values
  } = useForm<FullStockResearchFormData>({
    resolver: zodResolver(fullStockResearchSchema),
    defaultValues: {
      stock: {
        symbol: "", // Only symbol is strictly needed for the initial form state
      },
      // Set default values for other optional sections to undefined to ensure they are not sent if empty
      balance_sheet: undefined,
      details: undefined,
      // exports_imports: undefined,
      financial_ratios: undefined,
      income_statement: undefined,
      key_metrics: undefined,
      performance_metrics: undefined,
      rd_investments: undefined,
      revenue_mix: undefined,
      shareholding_pattern: undefined,
    },
    mode: "onTouched",
  });

  const selectedCompanySymbol = watch("stock.symbol");

  // Define form sections configuration using useMemo for stability
  const formSections: FormSection[] = useMemo(
    () => [
      {
        title: "Balance Sheet",
        section: "balance_sheet",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        fields: [
          { name: "fiscal_year", label: "Fiscal Year", type: "number", required: true }, // Mark required from schema
          { name: "is_estimate", label: "Is Estimate?", isCheckbox: true },
          { name: "equity_capital", label: "Equity Capital", type: "number", required: true },
          { name: "reserves", label: "Reserves", type: "number", required: true },
          { name: "borrowings", label: "Borrowings", type: "number" },
          { name: "long_term_borrowings", label: "Long Term Borrowings", type: "number" },
          { name: "short_term_borrowings", label: "Short Term Borrowings", type: "number" },
          { name: "lease_liabilities", label: "Lease Liabilities", type: "number" },
          { name: "other_borrowings", label: "Other Borrowings", type: "number" },
          { name: "other_liabilities", label: "Other Liabilities", type: "number" },
          { name: "trade_payables", label: "Trade Payables", type: "number" },
          { name: "advance_from_customers", label: "Advance From Customers", type: "number" },
          { name: "other_liability_items", label: "Other Liability Items" },
          { name: "gross_block", label: "Gross Block", type: "number" },
          { name: "accumulated_depreciation", label: "Accumulated Depreciation", type: "number" },
          { name: "fixed_assets", label: "Fixed Assets", type: "number" },
          { name: "land", label: "Land", type: "number" },
          { name: "building", label: "Building", type: "number" },
          { name: "plant_machinery", label: "Plant Machinery", type: "number" },
          { name: "equipments", label: "Equipments", type: "number" },
          { name: "furniture_n_fittings", label: "Furniture & Fittings", type: "number" },
          { name: "vehicles", label: "Vehicles", type: "number" },
          { name: "other_fixed_assets", label: "Other Fixed Assets", type: "number" },
          { name: "cwip", label: "CWIP", type: "number" },
          { name: "investments", label: "Investments", type: "number" },
          { name: "other_assets", label: "Other Assets", type: "number" },
          { name: "inventories", label: "Inventories", type: "number" },
          { name: "trade_receivables", label: "Trade Receivables", type: "number" },
          { name: "cash_equivalents", label: "Cash Equivalents", type: "number" },
          { name: "loans_n_advances", label: "Loans & Advances", type: "number" },
          { name: "other_asset_items", label: "Other Asset Items" },
          { name: "total_assets", label: "Total Assets", type: "number", required: true },
        ],
      },
      {
        title: "Research Details",
        section: "details",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        textColor: "text-purple-700",
        fields: [
          { name: "report_date", label: "Report Date", type: "date", required: true },
          { name: "target_period", label: "Target Period" },
          { name: "price_at_reco", label: "Price At Recommendation", type: "number" },
          { name: "target_price", label: "Target Price", type: "number" },
          { name: "potential_returns", label: "Potential Returns", type: "number" },
          { name: "recommendation", label: "Recommendation" },
          { name: "company_overview", label: "Company Overview", isTextArea: true },
          { name: "investment_rationale", label: "Investment Rationale", isTextArea: true },
          { name: "industry_overview", label: "Industry Overview", isTextArea: true },
          { name: "risks_concerns", label: "Risks & Concerns", isTextArea: true },
          { name: "analyst_name", label: "Analyst Name" },
        ],
      },
      // {
      //   title: "Exports & Imports",
      //   section: "exports_imports",
      //   bgColor: "bg-orange-50",
      //   borderColor: "border-orange-200",
      //   textColor: "text-orange-700",
      //   fields: [
      //     { name: "fiscal_year", label: "Fiscal Year", type: "number" },
      //     { name: "exports_crores", label: "Exports (Crores)", type: "number" },
      //     { name: "imports_crores", label: "Imports (Crores)", type: "number" },
      //   ],
      // },
      {
        title: "Financial Ratios",
        section: "financial_ratios",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        textColor: "text-teal-700",
        fields: [
          { name: "fiscal_year", label: "Fiscal Year", type: "number" },
          { name: "period_type", label: "Period Type" },
          { name: "roe", label: "ROE", type: "number", step: "0.01" },
          { name: "roce", label: "ROCE", type: "number", step: "0.01" },
          { name: "current_ratio", label: "Current Ratio", type: "number", step: "0.01" },
          { name: "peg_ratio", label: "PEG Ratio", type: "number", step: "0.01" },
          { name: "net_profit_margin", label: "Net Profit Margin", type: "number", step: "0.01" },
          { name: "ev_ebitda", label: "EV/EBITDA", type: "number", step: "0.01" },
          { name: "debt_to_equity", label: "Debt to Equity", type: "number", step: "0.01" },
          { name: "roa", label: "ROA", type: "number", step: "0.01" },
        ],
      },
      {
        title: "Income Statement",
        section: "income_statement",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        fields: [
          { name: "fiscal_year", label: "Fiscal Year", type: "number" },
          { name: "is_estimate", label: "Is Estimate?", isCheckbox: true },
          { name: "interest_earned", label: "Interest Earned", type: "number" },
          { name: "other_income", label: "Other Income", type: "number" },
          { name: "total_income", label: "Total Income", type: "number" },
          { name: "total_expenditure", label: "Total Expenditure", type: "number" },
          { name: "operating_profit", label: "Operating Profit", type: "number" },
          { name: "provisions_contigencies", label: "Provisions & Contingencies", type: "number" },
          { name: "profit_before_tax", label: "Profit Before Tax", type: "number" },
          { name: "tax", label: "Tax", type: "number" },
          { name: "net_profit", label: "Net Profit", type: "number" },
          { name: "gross_npa_percentage", label: "Gross NPA Percentage", type: "number", step: "0.01" },
          { name: "gross_npa", label: "Gross NPA", type: "number" },
          { name: "net_npa", label: "Net NPA", type: "number" },
          { name: "interest_cost", label: "Interest Cost", type: "number" },
          { name: "net_npa_percentage", label: "Net NPA Percentage", type: "number", step: "0.01" },
        ],
      },
      {
        title: "Key Metrics",
        section: "key_metrics",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-700",
        fields: [
          { name: "snapshot_date", label: "Snapshot Date", type: "date" },
          { name: "cmp", label: "CMP", type: "number" },
          { name: "pe_ratio", label: "PE Ratio", type: "number", step: "0.01" },
          { name: "enterprise_value", label: "Enterprise Value", type: "number" },
          { name: "market_cap", label: "Market Cap", type: "number" },
          { name: "fifty_two_week_high", label: "52 Week High", type: "number" },
          { name: "fifty_two_week_low", label: "52 Week Low", type: "number" },
        ],
      },
      {
        title: "Performance Metrics",
        section: "performance_metrics",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        textColor: "text-cyan-700",
        fields: [
          { name: "period_type", label: "Period Type" },
          { name: "stock_return", label: "Stock Return", type: "number", step: "0.01" },
          { name: "benchmark_return", label: "Benchmark Return", type: "number", step: "0.01" },
        ],
      },
      {
        title: "R&D Investments",
        section: "rd_investments",
        bgColor: "bg-lime-50",
        borderColor: "border-lime-200",
        textColor: "text-lime-700",
        fields: [
          { name: "fiscal_year", label: "Fiscal Year", type: "number" },
          { name: "rd_investments_crores", label: "R&D Investments (Crores)", type: "number" },
          { name: "rd_as_percent_of_sales", label: "R&D as % of Sales", type: "number", step: "0.01" },
        ],
      },
      {
        title: "Revenue Mix",
        section: "revenue_mix",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        textColor: "text-rose-700",
        fields: [
          { name: "fiscal_year", label: "Fiscal Year", type: "number" },
          { name: "mix_type", label: "Mix Type" },
          { name: "category", label: "Category" },
          { name: "percentage", label: "Percentage", type: "number", step: "0.01" },
        ],
      },
      {
        title: "Shareholding Pattern",
        section: "shareholding_pattern",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        textColor: "text-indigo-700",
        fields: [
          { name: "period_month", label: "Period Month", type: "number" },
          { name: "period_year", label: "Period Year", type: "number" },
          { name: "promoters", label: "Promoters (%)", type: "number", step: "0.01" },
          { name: "share_holding_pledge", label: "Share Holding Pledge (%)", type: "number", step: "0.01" },
          { name: "fii", label: "FII (%)", type: "number", step: "0.01" },
          { name: "public", label: "Public (%)", type: "number", step: "0.01" },
          { name: "total_dil", label: "Total DIL (%)", type: "number", step: "0.01" },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    fetchCompanyOptions();
  }, []);

  const fetchCompanyOptions = async () => {
    try {
      const response = await fetch(`/api/research-table/all/allCompanies`);
      const data = await response.json();
      if (response.status !== 200) {
        toast.error(data.error || "Failed to fetch company options.");
      } else {
        setCompanyOptions(data?.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch company options:", error);
      toast.error("Failed to load company options due to a network error.");
    } finally {
      setLoadingCompanies(false);
    }
  };

  // The transformation logic is now much simpler due to revised Zod schema for 'stock'
  const transformDataForSubmission = (data: FullStockResearchFormData) => {
    const transformedData: FullStockResearchFormData = { ...data };

    // Filter out empty strings for optional string fields to send null or undefined
    // This is generally good practice to align empty string inputs with nullable DB fields
    const cleanedData = JSON.parse(JSON.stringify(transformedData), (key, value) => {
        if (typeof value === 'string' && value.trim() === '') {
            return null; // Convert empty strings to null
        }
        // For numbers, react-hook-form's valueAsNumber already handles empty string to NaN,
        // and Zod's optionalNumber.nullable().optional() handles NaN correctly if it occurs.
        return value;
    });

    // Remove sections that are empty objects (meaning no fields were filled in that section)
    for (const key in cleanedData) {
      // Check if it's a section key (and not 'stock')
      if (key !== "stock" && cleanedData[key as keyof FullStockResearchFormData] &&
          typeof cleanedData[key as keyof FullStockResearchFormData] === 'object' &&
          Object.keys(cleanedData[key as keyof FullStockResearchFormData]!).length === 0) {
        (cleanedData as any)[key] = undefined; // Set to undefined to remove from payload
      }
    }

    return cleanedData;
  };


  const onSubmit = async (data: FullStockResearchFormData) => {
    setIsSubmitting(true);

    const dataToSend = transformDataForSubmission(data);
    console.log("Data to send:", dataToSend); // Log the final payload

    try {
      const response = await fetch("/api/research-table/research-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        reset(); // Clear the form on successful submission
      } else {
        if (response.status === 400 && result.errors) {
          result.errors.forEach((err: { path: string[]; message: string }) => {
            const path = err.path.join(".");
            toast.error(`Validation Error on ${path}: ${err.message}`);
          });
        } else {
          toast.error(
            result.message || "An unknown error occurred during submission."
          );
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        "Failed to submit stock research data. Please check your network connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCompanies) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading company options...
      </div>
    );
  }

  // Helper component to render form fields and error messages
  interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    step?: string;
    section: keyof Omit<FullStockResearchFormData, 'stock'>; // Ensure section is typed correctly
    required?: boolean;
    isTextArea?: boolean;
  }

  const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    type = "text",
    step,
    section,
    required = false,
    isTextArea = false,
  }) => {
    // Correctly construct the path for register and error lookup
    const fullPath = `${section}.${name}`;
    // Access errors using optional chaining for robustness
    const errorMessage = (errors as any)?.[section]?.[name]?.message;

    // Determine if value should be treated as number for react-hook-form's register
    const registerOptions = type === "number" ? { valueAsNumber: true } : {};

    return (
      <div className="mb-4">
        <label
          htmlFor={fullPath}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isTextArea ? (
          <textarea
            id={fullPath}
            {...register(fullPath as any, registerOptions)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 resize-y h-24"
            rows={3}
          />
        ) : (
          <input
            type={type}
            id={fullPath}
            step={step}
            {...register(fullPath as any, registerOptions)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        )}
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
  };

  // Helper component for Checkbox fields
  interface CheckboxFieldProps {
    label: string;
    name: string;
    section: keyof Omit<FullStockResearchFormData, 'stock'>;
  }

  const CheckboxField: React.FC<CheckboxFieldProps> = ({
    label,
    name,
    section,
  }) => {
    const fullPath = `${section}.${name}`;
    const errorMessage = (errors as any)?.[section]?.[name]?.message;
    return (
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id={fullPath}
          {...register(fullPath as any)}
          className="mr-2"
        />
        <label htmlFor={fullPath} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
        Add Full Stock Research Information
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Stock Selection Dropdown */}
        <section
          className={`p-6 border border-blue-200 rounded-xl shadow-md bg-blue-50`}
        >
          <h2 className={`text-2xl font-bold text-blue-700 mb-5`}>
            Select Company
          </h2>
          <div className="mb-4">
            <label
              htmlFor="stock.symbol"
              className="block text-sm font-medium text-gray-700"
            >
              Company Symbol <span className="text-red-500">*</span>
            </label>
            <select
              id="stock.symbol"
              {...register("stock.symbol", { required: true })} // No `as any` needed if schema is aligned
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a company</option>
              {companyOptions.map((company) => (
                <option key={company.research_stock_id} value={company.symbol}>
                  {company.symbol} - {company.name}
                </option>
              ))}
            </select>
            {errors.stock?.symbol && ( // Access errors directly
              <p className="text-red-500 text-sm mt-1">
                {errors.stock.symbol.message}
              </p>
            )}
          </div>
        </section>

        {formSections.map((sec) => (
          <section
            key={sec.section}
            className={`p-6 border ${sec.borderColor} rounded-xl shadow-md ${sec.bgColor}`}
          >
            <h2 className={`text-2xl font-bold ${sec.textColor} mb-5`}>
              {sec.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sec.fields.map((field) => {
                if (field.isCheckbox) {
                  return (
                    <CheckboxField
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      section={sec.section}
                    />
                  );
                }
                return (
                  <InputField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    step={field.step}
                    section={sec.section} // Pass section
                    required={field.required}
                    isTextArea={field.isTextArea}
                  />
                );
              })}
            </div>
          </section>
        ))}

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          disabled={isSubmitting || !selectedCompanySymbol} // Disable if no company is selected
        >
          {isSubmitting ? "Submitting..." : "Submit Full Stock Research"}
        </button>
      </form>
    </div>
  );
}