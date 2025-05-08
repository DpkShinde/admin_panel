"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

// #region INTERFACES (These should match what the backend expects for items within arrays)
// QuarterlyFinancials interface removed

export interface CompanyInfo {
  company_id: number; // Primary ID, can be 0 initially if user needs to input it
  name: string;
  description?: string;
  registered_address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  telephone?: string;
  fax?: string;
  email?: string;
  website?: string;
  bse_code?: string;
  nse_code?: string;
  series?: string;
  isin?: string;
  registrar_name?: string;
  registrar_address?: string;
  registrar_city?: string;
  registrar_state?: string;
  registrar_pin_code?: string;
  registrar_telephone?: string;
  registrar_fax?: string;
  registrar_website?: string;
}

export interface QBalanceSheet {
  company_id?: number | undefined;
  fiscal_year: number; // Year is part of the key, so not null
  share_capital?: number;
  reserves_surplus?: number;
  minority_interest?: number;
  deposits?: number;
  borrowings?: number;
  other_liabilities?: number;
  total_liabilities?: number;
  fixed_assets?: number;
  loans_advances?: number;
  investments?: number;
  other_assets?: number;
  total_assets?: number;
}

export interface BusinessArea {
  company_id?: number | undefined;
  area_name: string;
  description?: string;
}

export interface QCashFlow {
  company_id?: number | undefined;
  fiscal_year: number;
  cash_operating?: number;
  cash_investing?: number;
  cash_financing?: number;
  cash_others?: number;
  net_cash_flow?: number;
}

export interface QFinancialRatios {
  company_id?: number | undefined;
  fiscal_year: number;
  basic_eps?: number;
  diluted_eps?: number;
  book_value_per_share?: number;
  dividend_per_share?: number;
  face_value?: number;
  net_interest_margin?: number;
  operating_profit_margin?: number;
  net_profit_margin?: number;
  return_on_equity?: number;
  roce?: number;
  return_on_assets?: number;
  casa_percentage?: number;
  capital_adequacy_ratio?: number;
}

export interface IncomeStatement {
  company_id?: number | undefined;
  fiscal_year: number;
  interest_earned?: number;
  other_income?: number;
  total_income?: number;
  total_expenditure?: number;
  operating_profit?: number;
  provisions_contingencies?: number;
  profit_before_tax?: number;
  tax?: number;
  net_profit?: number;
}

export interface Management {
  company_id?: number | undefined;
  name: string;
  position: string;
  join_date?: string | null; // Allow null for dates
  leave_date?: string | null; // Allow null for dates
}

export interface News {
  company_id?: number | undefined;
  title: string;
  content?: string;
  publish_date?: string | null; // Allow null for dates
  source?: string;
  url?: string;
}

export interface NPA {
  company_id?: number | undefined;
  fiscal_year: number;
  gross_npa_amount?: number;
  gross_npa_percentage?: number;
  net_npa_amount?: number;
  net_npa_percentage?: number;
}

export interface QPeerAnalysis {
  company_id?: number | undefined;
  company_name: string;
  price?: number;
  change_percentage?: number;
  market_cap?: number; // Can be large, string on FE if needed, but number for backend
  ttm_pe?: number;
  pb_ratio?: number;
  roe?: number;
  one_year_performance?: number;
  car?: number;
  interest_earned?: number;
  nim?: number;
  analysis_date?: string | null; // Allow null for dates
}

export interface QuarterlyEarnings {
  company_id?: number | undefined;
  year: number;
  quarter: number;
  revenue?: number;
  net_profit?: number;
  eps?: number;
  bvps_percentage?: number; // Matched to backend
  roe?: number;
  nim?: number;
}

export interface Shareholding {
  company_id?: number | undefined;
  quarter_year: string; // e.g., "2023-Q1"
  promoters?: number;
  foreign_institutions?: number;
  dii?: number;
  public?: number;
  others?: number;
}

export interface CompanyFinancialResult {
  company_id: number; // Should be linked to companyInfo.company_id when sending
  company_name: string; // Should be linked to companyInfo.name when sending
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

// #region INITIAL STATES FOR LIST ITEMS (company_id is undefined, id field removed)
// initialQuarterlyFinancials removed

const initialQBalanceSheet: QBalanceSheet = {
  company_id: undefined,
  fiscal_year: new Date().getFullYear(),
  share_capital: undefined,
  reserves_surplus: undefined,
  minority_interest: undefined,
  deposits: undefined,
  borrowings: undefined,
  other_liabilities: undefined,
  total_liabilities: undefined,
  fixed_assets: undefined,
  loans_advances: undefined,
  investments: undefined,
  other_assets: undefined,
  total_assets: undefined,
};

const initialBusinessArea: BusinessArea = {
  company_id: undefined,
  area_name: "",
  description: "",
};

const initialQCashFlow: QCashFlow = {
  company_id: undefined,
  fiscal_year: new Date().getFullYear(),
  cash_operating: undefined,
  cash_investing: undefined,
  cash_financing: undefined,
  cash_others: undefined,
  net_cash_flow: undefined,
};

const initialQFinancialRatios: QFinancialRatios = {
  company_id: undefined,
  fiscal_year: new Date().getFullYear(),
  basic_eps: undefined,
  diluted_eps: undefined,
  book_value_per_share: undefined,
  dividend_per_share: undefined,
  face_value: undefined,
  net_interest_margin: undefined,
  operating_profit_margin: undefined,
  net_profit_margin: undefined,
  return_on_equity: undefined,
  roce: undefined,
  return_on_assets: undefined,
  casa_percentage: undefined,
  capital_adequacy_ratio: undefined,
};

const initialIncomeStatement: IncomeStatement = {
  company_id: undefined,
  fiscal_year: new Date().getFullYear(),
  interest_earned: undefined,
  other_income: undefined,
  total_income: undefined,
  total_expenditure: undefined,
  operating_profit: undefined,
  provisions_contingencies: undefined,
  profit_before_tax: undefined,
  tax: undefined,
  net_profit: undefined,
};

const initialManagement: Management = {
  company_id: undefined,
  name: "",
  position: "",
  join_date: null, // Use null for date inputs that can be empty
  leave_date: null,
};

const initialNews: News = {
  company_id: undefined,
  title: "",
  content: "",
  publish_date: null,
  source: "",
  url: "",
};

const initialNPA: NPA = {
  company_id: undefined,
  fiscal_year: new Date().getFullYear(),
  gross_npa_amount: undefined,
  gross_npa_percentage: undefined,
  net_npa_amount: undefined,
  net_npa_percentage: undefined,
};

const initialQPeerAnalysis: QPeerAnalysis = {
  company_id: undefined,
  company_name: "",
  price: undefined,
  change_percentage: undefined,
  market_cap: undefined,
  ttm_pe: undefined,
  pb_ratio: undefined,
  roe: undefined,
  one_year_performance: undefined,
  car: undefined,
  interest_earned: undefined,
  nim: undefined,
  analysis_date: null,
};

const initialQuarterlyEarnings: QuarterlyEarnings = {
  company_id: undefined,
  year: new Date().getFullYear(),
  quarter: 1, // Default to Q1
  revenue: undefined,
  net_profit: undefined,
  eps: undefined,
  bvps_percentage: undefined,
  roe: undefined,
  nim: undefined,
};

const initialShareholding: Shareholding = {
  company_id: undefined,
  quarter_year: `${new Date().getFullYear()}-Q1`, // Example format
  promoters: undefined,
  foreign_institutions: undefined,
  dii: undefined,
  public: undefined,
  others: undefined,
};
// #endregion

// #region HELPER FUNCTIONS (Outside component)
function getInputType(key: string, value: any): string {
  if (key.includes("date") || key.includes("_at")) return "date";
  if (key.includes("email")) return "email";
  if (key.includes("website") || key.includes("url")) return "url";
  if (typeof value === "boolean") return "checkbox"; // Not directly used for list items here

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
  ];
  if (
    typeof value === "number" ||
    numericKeysPatterns.some((p) => key.toLowerCase().includes(p)) // Use toLowerCase for broader matching
  ) {
    return "number";
  }
  return "text";
}

function getFieldPlaceholder(key: string, title?: string): string {
  const lowerKey = String(key).toLowerCase();

  if (lowerKey.includes("company_id"))
    return "e.g., 101 (Link to Main Company ID)";
  if (lowerKey.includes("name")) {
    if (title && title.toLowerCase().includes("peer analysis"))
      return "e.g., Infosys Ltd";
    if (title && title.toLowerCase().includes("management"))
      return "e.g., Mr. John Doe";
    return "e.g., Reliance Industries Ltd.";
  }
  if (lowerKey === "description") return "Enter a brief description";
  if (lowerKey.includes("address")) return "e.g., 123 Main St, Anytown";
  if (lowerKey === "city") return "e.g., Mumbai";
  if (lowerKey === "state") return "e.g., Maharashtra";
  if (lowerKey.includes("pin_code")) return "e.g., 400001";
  if (lowerKey.includes("telephone") || lowerKey.includes("fax"))
    return "e.g., +91-22-12345678";
  if (lowerKey.includes("email")) return "e.g., contact@example.com";
  if (lowerKey.includes("website") || lowerKey.includes("url"))
    return "e.g., https://www.example.com";
  if (lowerKey.includes("bse_code")) return "e.g., 500325";
  if (lowerKey.includes("nse_code") || lowerKey.includes("series"))
    return "e.g., RELIANCE";
  if (lowerKey.includes("isin")) return "e.g., INE002A01018";
  if (lowerKey.includes("registrar_name"))
    return "e.g., Link Intime India Pvt Ltd";
  if (lowerKey.includes("year")) return `e.g., ${new Date().getFullYear()}`;
  if (lowerKey.includes("quarter_id") || lowerKey === "quarter")
    return "e.g., 1 (for Q1), 2 (for Q2)";
  if (lowerKey.includes("quarter_year")) return "e.g., 2024-Q1";

  if (
    lowerKey.includes("_cr") ||
    lowerKey.includes("revenue") ||
    lowerKey.includes("sales") ||
    lowerKey.includes("income") ||
    (lowerKey.includes("profit") && !lowerKey.includes("percent"))
  )
    return "e.g., 15000.50 (in Crores)";
  if (lowerKey.includes("expenses") || lowerKey.includes("expenditure"))
    return "e.g., 5000.25 (in Crores)";
  if (
    lowerKey.includes("percent") ||
    lowerKey.includes("margin") ||
    lowerKey.includes("ratio") ||
    lowerKey.includes("roe") ||
    lowerKey.includes("roce")
  )
    return "e.g., 12.5 (for 12.5%)";
  if (lowerKey.includes("eps")) return "e.g., 25.50";
  if (lowerKey.includes("price") || lowerKey.includes("ltp_rs"))
    return "e.g., 2500.75 (in Rs.)";
  if (lowerKey.includes("market_cap")) return "e.g., 1500000 Cr.";
  if (
    lowerKey.includes("capital") ||
    lowerKey.includes("surplus") ||
    lowerKey.includes("deposits") ||
    lowerKey.includes("borrowings") ||
    lowerKey.includes("assets") ||
    lowerKey.includes("liabilities") ||
    lowerKey.includes("loans") ||
    lowerKey.includes("investments") ||
    lowerKey.includes("amount")
  )
    return "e.g., 100000 (numerical value)";

  if (lowerKey === "result_type") return "e.g., Quarterly, Annual";
  if (lowerKey.includes("tag")) return "Enter the URL you want to show on the query";
  if (
    lowerKey.includes("title") &&
    title &&
    title.toLowerCase().includes("news")
  )
    return "e.g., Company announces record profits";
  if (lowerKey.includes("content")) return "Enter detailed content here...";
  if (lowerKey.includes("source"))
    return "e.g., Business Standard, BSE Announcement";
  if (lowerKey.includes("position")) return "e.g., CEO, Managing Director";
  if (lowerKey.includes("area_name")) return "e.g., Petrochemicals, Retail";

  if (
    lowerKey.includes("promoters") ||
    lowerKey.includes("foreign_institutions") ||
    lowerKey.includes("dii") ||
    lowerKey.includes("public") ||
    lowerKey.includes("others")
  )
    return "e.g., 50.5 (percentage)";

  // Default placeholder if no specific match
  const formattedKey = String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return `Enter ${formattedKey}`;
}

function singularize(text: string): string {
  const str = String(text);
  if (str.endsWith("ies")) return str.substring(0, str.length - 3) + "y";
  if (str.endsWith("s")) return str.substring(0, str.length - 1);
  return str;
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
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    return "";
  }
};
// #endregion

export default function CompanyDataEntryPage() {
  // #region STATES
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_id: 0,
    name: "",
    description: "",
    registered_address: "",
    city: "",
    state: "",
    pin_code: "",
    telephone: "",
    fax: "",
    email: "",
    website: "",
    bse_code: "",
    nse_code: "",
    series: "",
    isin: "",
    registrar_name: "",
    registrar_address: "",
    registrar_city: "",
    registrar_state: "",
    registrar_pin_code: "",
    registrar_telephone: "",
    registrar_fax: "",
    registrar_website: "",
  });

  const [companyFinancialResult, setCompanyFinancialResult] =
    useState<CompanyFinancialResult>({
      company_id: 0,
      company_name: "",
      result_type: "",
      ltp_rs: null,
      market_cap: null,
      revenue_cr: null,
      change_percent: null,
      tentative_date: null,
      gross_profit_percent: null,
      net_profit_percent: null,
      tag: null,
      created_at: null,
      updated_at: null,
    });

  const [qBalanceSheets, setQBalanceSheets] = useState<QBalanceSheet[]>([]);
  const [businessAreas, setBusinessAreas] = useState<BusinessArea[]>([]);
  const [qCashFlows, setQCashFlows] = useState<QCashFlow[]>([]);
  const [qFinancialRatiosItems, setQFinancialRatiosItems] = useState<
    QFinancialRatios[]
  >([]);
  const [incomeStatements, setIncomeStatements] = useState<IncomeStatement[]>(
    []
  );
  const [managementPersonnel, setManagementPersonnel] = useState<Management[]>(
    []
  );
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [npaItems, setNpaItems] = useState<NPA[]>([]);
  const [qPeerAnalysisItems, setQPeerAnalysisItems] = useState<QPeerAnalysis[]>(
    []
  );
  const [quarterlyEarningsItems, setQuarterlyEarningsItems] = useState<
    QuarterlyEarnings[]
  >([]);
  const [shareholdingPatterns, setShareholdingPatterns] = useState<
    Shareholding[]
  >([]);
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

  const handleListInputChange = <T,>(
    listSetter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: string | number | boolean | null | Date | undefined
  ) => {
    listSetter((prevList) =>
      prevList.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = <T extends { company_id?: number | undefined }>(
    listSetter: React.Dispatch<React.SetStateAction<T[]>>,
    initialItem: T
  ) => {
    const newItem = { ...initialItem };
    if (companyInfo && companyInfo.company_id && companyInfo.company_id !== 0) {
      newItem.company_id = companyInfo.company_id;
    }
    listSetter((prevList) => [...prevList, newItem]);
  };

  const handleRemoveItem = <T,>(
    listSetter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number
  ) => {
    listSetter((prevList) => prevList.filter((_, i) => i !== index));
  };

  const parseInputToNumberOrNull = (value: string): number | null => {
    if (value.trim() === "") return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  const parseInputToNumberOrUndefined = (value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const finalCompanyFinancialResult = {
      ...companyFinancialResult,
      company_id: companyInfo.company_id,
      company_name: companyInfo.name,
    };

    const allData = {
      companyInfo,
      companyFinancialResult: finalCompanyFinancialResult,
      qBalanceSheets,
      businessAreas,
      qCashFlows,
      qFinancialRatiosItems,
      incomeStatements,
      managementPersonnel,
      newsItems,
      npaItems,
      qPeerAnalysisItems,
      quarterlyEarningsItems,
      shareholdingPatterns,
    };

    console.log("Submitting data:", JSON.stringify(allData, null, 2));

    try {
      const response = await fetch("/api/quaterly-earnings", {
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
      setTimeout(() => {
        router.push("/super-admin/database/quarterly-earnings"); 
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
  const removeButtonStyle =
    "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm";
  const sectionTitleStyle = "text-xl font-semibold mb-3 mt-6 pb-2 border-b";
  const itemCardStyle = "p-4 border rounded-lg mb-3 shadow bg-white";

  // #region GENERIC LIST SECTION RENDERER
  function renderListSection<TItem extends { company_id?: number | undefined }>(
    title: string,
    items: TItem[],
    setter: React.Dispatch<React.SetStateAction<TItem[]>>,
    initialItemState: TItem,
    numberParser?: (value: string) => number | null | undefined
  ) {
    const itemKeys = Object.keys(initialItemState) as Array<keyof TItem>;

    return (
      <section>
        <h2 className={sectionTitleStyle}>{title}</h2>
        <button
          type="button"
          onClick={() => handleAddItem(setter, initialItemState)}
          className={`${buttonStyle} mb-4`}
        >
          Add New {singularize(title)}
        </button>
        {items.map((item, index) => (
          <div key={index} className={itemCardStyle}>
            <h3 className="font-semibold mb-2 text-gray-800">
              {singularize(title)} Item {index + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemKeys.map((key) => {
                const currentFieldValue = item[key];
                const inputType = getInputType(String(key), currentFieldValue);
                const placeholderText = getFieldPlaceholder(String(key), title);

                if (
                  key === "company_id" &&
                  companyInfo.company_id &&
                  companyInfo.company_id !== 0
                ) {
                  // Optionally, show as read-only or hide if company_id is auto-set
                  // For now, we'll render it but it will be pre-filled by handleAddItem
                }

                return (
                  <div key={String(key)}>
                    <label
                      htmlFor={`${title}-${index}-${String(key)}`}
                      className={labelStyle}
                    >
                      {String(key)
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      :
                    </label>
                    <input
                      type={inputType}
                      step={inputType === "number" ? "any" : undefined}
                      id={`${title}-${index}-${String(key)}`}
                      name={String(key)}
                      value={
                        inputType === "date"
                          ? formatDateForInput(
                              currentFieldValue as string | Date | null
                            )
                          : currentFieldValue === null ||
                            currentFieldValue === undefined
                          ? ""
                          : String(currentFieldValue)
                      }
                      onChange={(e) => {
                        let valueToSet: any = e.target.value;
                        if (inputType === "number") {
                          if (numberParser) {
                            valueToSet = numberParser(e.target.value);
                          } else {
                            const isOptionalNullable =
                              Object.getOwnPropertyDescriptor(
                                initialItemState,
                                key
                              ) && typeof initialItemState[key] === "object";
                            if (isOptionalNullable) {
                              valueToSet = parseInputToNumberOrNull(
                                e.target.value
                              );
                            } else {
                              valueToSet = parseInputToNumberOrUndefined(
                                e.target.value
                              );
                            }
                          }
                        } else if (inputType === "date") {
                          valueToSet =
                            e.target.value === "" ? null : e.target.value;
                        }
                        handleListInputChange(setter, index, key, valueToSet);
                      }}
                      className={inputStyle}
                      placeholder={placeholderText}
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem(setter, index)}
              className={`${removeButtonStyle} mt-3`}
            >
              Remove Item {index + 1}
            </button>
          </div>
        ))}
      </section>
    );
  }
  // #endregion

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Company Data Entry
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* CompanyInfo Section */}
        <section>
          <h2 className={sectionTitleStyle}>Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg shadow bg-white">
            {(Object.keys(companyInfo) as Array<keyof CompanyInfo>).map(
              (key) => (
                <div key={key}>
                  <label htmlFor={`companyInfo-${key}`} className={labelStyle}>
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    :
                  </label>
                  <input
                    type={getInputType(key, companyInfo[key])}
                    step={
                      getInputType(key, companyInfo[key]) === "number"
                        ? "any"
                        : undefined
                    }
                    id={`companyInfo-${key}`}
                    name={key}
                    value={
                      companyInfo[key] === null ||
                      companyInfo[key] === undefined
                        ? ""
                        : String(companyInfo[key])
                    }
                    onChange={(e) => {
                      let value: string | number = e.target.value;
                      if (getInputType(key, companyInfo[key]) === "number") {
                        // company_id is number, not null/undefined in its interface
                        value = parseInt(e.target.value, 10) || 0;
                        // Ensure 0 if parsing fails or empty, as company_id is not optional
                      }
                      handleInputChange(setCompanyInfo, key, value);
                    }}
                    className={inputStyle}
                    placeholder={getFieldPlaceholder(key)}
                  />
                </div>
              )
            )}
          </div>
        </section>

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
                  key !== "company_id" &&
                  key !== "company_name" &&
                  key !== "created_at" &&
                  key !== "updated_at"
              )
              .map((key) => {
                const inputType = getInputType(
                  key,
                  companyFinancialResult[key]
                );
                return (
                  <div key={key}>
                    <label htmlFor={`cfr-${key}`} className={labelStyle}>
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      :
                    </label>
                    <input
                      type={inputType}
                      step={inputType === "number" ? "any" : undefined}
                      id={`cfr-${key}`}
                      name={key}
                      value={
                        inputType === "date"
                          ? formatDateForInput(
                              companyFinancialResult[key] as
                                | string
                                | Date
                                | null
                            )
                          : companyFinancialResult[key] === null ||
                            companyFinancialResult[key] === undefined
                          ? ""
                          : String(companyFinancialResult[key])
                      }
                      onChange={(e) => {
                        let val: string | number | null | Date = e.target.value;
                        if (inputType === "number") {
                          val = parseInputToNumberOrNull(e.target.value);
                        } else if (inputType === "date") {
                          val = e.target.value === "" ? null : e.target.value;
                        }
                        handleInputChange(setCompanyFinancialResult, key, val);
                      }}
                      className={inputStyle}
                      placeholder={getFieldPlaceholder(key)}
                    />
                  </div>
                );
              })}
          </div>
        </section>

        {/* Dynamic List Sections */}
        {renderListSection<QBalanceSheet>(
          "Quarterly Balance Sheets",
          qBalanceSheets,
          setQBalanceSheets,
          initialQBalanceSheet,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<BusinessArea>(
          "Business Areas",
          businessAreas,
          setBusinessAreas,
          initialBusinessArea
        )}
        {renderListSection<QCashFlow>(
          "Quarterly Cash Flows",
          qCashFlows,
          setQCashFlows,
          initialQCashFlow,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<QFinancialRatios>(
          "Quarterly Financial Ratios",
          qFinancialRatiosItems,
          setQFinancialRatiosItems,
          initialQFinancialRatios,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<IncomeStatement>(
          "Income Statements (Annual)",
          incomeStatements,
          setIncomeStatements,
          initialIncomeStatement,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<Management>(
          "Management Personnel",
          managementPersonnel,
          setManagementPersonnel,
          initialManagement
        )}
        {renderListSection<News>(
          "News Items",
          newsItems,
          setNewsItems,
          initialNews
        )}
        {renderListSection<NPA>(
          "Non-Performing Assets (NPA)",
          npaItems,
          setNpaItems,
          initialNPA,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<QPeerAnalysis>(
          "Peer Analysis",
          qPeerAnalysisItems,
          setQPeerAnalysisItems,
          initialQPeerAnalysis,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<QuarterlyEarnings>(
          "Quarterly Earnings",
          quarterlyEarningsItems,
          setQuarterlyEarningsItems,
          initialQuarterlyEarnings,
          parseInputToNumberOrUndefined
        )}
        {renderListSection<Shareholding>(
          "Shareholding Patterns",
          shareholdingPatterns,
          setShareholdingPatterns,
          initialShareholding,
          parseInputToNumberOrUndefined
        )}

        <button
          type="submit"
          className={`${buttonStyle} w-full mt-8 py-3 text-lg font-semibold`}
        >
          Submit All Company Data
        </button>
      </form>
    </div>
  );
}
