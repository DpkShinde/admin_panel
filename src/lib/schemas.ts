// lib/schemas.ts
import { z } from "zod";

// Helper for optional numbers (if a field can be null/undefined AND is a number)
const optionalNumber = z.number().nullable().optional();
const optionalString = z.string().nullable().optional(); // For truly optional strings

// --- research_stock_balance_sheet Schema ---
export const researchStockBalanceSheetSchema = z.object({
  // stock_id is removed here if frontend doesn't provide it directly,
  // or it should be marked as optional if backend can infer/assign it.
  // For 'add' operations, it's typically assigned by backend.
  // If stock_id is necessary for *partial updates* where the section is present,
  // then it should be added back as z.number().int().positive().optional() or similar
  // if you expect to include it conditionally. For this "Add Detail Info" form,
  // we assume stock_id is managed by the backend after initial stock creation.
  // If you need to link to an *existing* stock, the form should take a stock_id.
  // For a new full entry, stock_id should not be part of sub-schemas.
  // Assuming stock_id will be added by the backend *after* stock creation,
  // or that this schema is used for backend validation where stock_id is always present.
  // For frontend form submission of *new* full data, stock_id won't be known initially.
  // Let's keep it partial for now for frontend flexibility.

  // If `stock_id` is truly required in the backend API for *each* nested object
  // upon submission, then the frontend must capture it or the backend must inject it.
  // For initial creation of a 'full' record, the backend would typically
  // create the main `stock` record first, get its `research_stock_id`,
  // then use that ID to insert related records.
  // For the purpose of this frontend `AddDetailInfo` component,
  // if `stock_id` is only generated *after* the base stock is created,
  // then the sub-schemas should *not* require `stock_id` for frontend submission.
  // If the form selects an *existing* stock, then stock_id would be present.

  // To make this schema work for frontend 'add' operation where stock_id is backend-generated:
  // We'll keep it as optional for the partial schema, but if present, it must be valid.
  stock_id: z.number().int().positive().optional(), // Make optional for frontend

  fiscal_year: z.number().int().min(1900).max(2100),
 is_estimate: z.boolean().optional(), 
  equity_capital: z
    .number()
    .multipleOf(0.01)
    .min(0, "Equity Capital must be non-negative."),
  reserves: z.number().multipleOf(0.01),
  borrowings: optionalNumber,
  long_term_borrowings: optionalNumber,
  short_term_borrowings: optionalNumber,
  lease_liabilities: optionalNumber,
  other_borrowings: optionalNumber,
  other_liabilities: optionalNumber,
  trade_payables: optionalNumber,
  advance_from_customers: optionalNumber,
  other_liability_items: optionalString, // Changed back to string
  gross_block: optionalNumber,
  accumulated_depreciation: optionalNumber,
  fixed_assets: optionalNumber,
  land: optionalNumber,
  building: optionalNumber,
  plant_machinery: optionalNumber,
  equipments: optionalNumber,
  furniture_n_fittings: optionalNumber,
  vehicles: optionalNumber,
  other_fixed_assets: optionalNumber,
  cwip: optionalNumber,
  investments: optionalNumber,
  other_assets: optionalNumber,
  inventories: optionalNumber,
  trade_receivables: optionalNumber,
  cash_equivalents: optionalNumber,
  loans_n_advances: optionalNumber,
  other_asset_items: optionalString, // Changed back to string
  total_assets: z
    .number()
    .multipleOf(0.01)
    .min(0, "Total Assets must be non-negative."),
});

// --- research_stock_details Schema ---
export const researchStockDetailsSchema = z.object({
  stock_id: z.number().int().positive().optional(), // Make optional for frontend
  report_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Invalid report date format. Expected YYYY-MM-DD."
    ), // Changed date format expectation
  target_period: z
    .string()
    .max(50, "Target period cannot exceed 50 characters.")
    .optional(), // Added optional
  price_at_reco: z
    .number()
    .multipleOf(0.01)
    .min(0, "Price at recommendation must be non-negative.")
    .optional(), // Added optional
  target_price: z
    .number()
    .multipleOf(0.01)
    .min(0, "Target price must be non-negative.")
    .optional(), // Added optional
  potential_returns: z
    .number()
    .multipleOf(0.01)
    .min(-100, "Potential returns cannot be less than -100%.")
    .max(1000, "Potential returns seem too high.")
    .optional(),
  recommendation: z
    .string()
    .max(20, "Recommendation cannot exceed 20 characters.")
    .optional(),
  company_overview: z.string().optional(), // .min(1) removed for optional text areas
  investment_rationale: z.string().optional(), // .min(1) removed for optional text areas
  industry_overview: z.string().optional(), // .min(1) removed for optional text areas
  risks_concerns: z.string().optional(), // .min(1) removed for optional text areas
  analyst_name: z
    .string()
    .max(100, "Analyst name cannot exceed 100 characters.")
    .optional(),
});

// --- research_stock_exports_imports Schema ---
// export const researchStockExportsImportsSchema = z
//   .object({
//     stock_id: z.number().int().positive().optional(), // Make optional for frontend
//     fiscal_year: z.number().int().min(1900).max(2100).optional(),
//     exports_crores: z
//       .number()
//       .int()
//       .min(0, "Exports in crores must be non-negative.")
//       .optional(),
//     imports_crores: z
//       .number()
//       .int()
//       .min(0, "Imports in crores must be non-negative.")
//       .optional(),
//   })
//   .partial(); // Make the whole object partial to allow optional fields if needed

// --- research_stock_financial_ratios Schema ---
export const researchStockFinancialRatiosSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    fiscal_year: z.number().int().min(1900).max(2100).optional(),
    period_type: z
      .string()
      .max(10, "Period type cannot exceed 10 characters.")
      .refine(
        (val) => ["Annual", "Quarterly", "Half-Yearly", "YTD"].includes(val),
        "Invalid period type."
      )
      .optional(),
    roe: z.number().multipleOf(0.01).optional(),
    roce: z.number().multipleOf(0.01).optional(),
    current_ratio: z
      .number()
      .multipleOf(0.01)
      .min(0, "Current ratio must be non-negative.")
      .optional(),
    peg_ratio: optionalNumber,
    net_profit_margin: z.number().multipleOf(0.01).optional(),
    ev_ebitda: optionalNumber,
    debt_to_equity: optionalNumber,
    roa: z.number().multipleOf(0.01).optional(),
  })
  .partial();

// --- research_stock_income_statement Schema ---
export const researchStockIncomeStatementSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    fiscal_year: z.number().int().min(1900).max(2100).optional(),
    is_estimate: z.boolean().optional(),
    interest_earned: z.number().int().optional(),
    other_income: z.number().int().optional(),
    total_income: z.number().int().optional(),
    total_expenditure: z.number().int().optional(),
    operating_profit: z.number().int().optional(),
    provisions_contigencies: z.number().int().optional(),
    profit_before_tax: z.number().int().optional(),
    tax: z.number().int().optional(),
    net_profit: z.number().int().optional(),
    gross_npa_percentage: z
      .number()
      .multipleOf(0.01)
      .min(0, "Gross NPA percentage must be non-negative.")
      .max(100, "Gross NPA percentage cannot exceed 100.")
      .optional(),
    gross_npa: z
      .number()
      .int()
      .min(0, "Gross NPA must be non-negative.")
      .optional(),
    net_npa: z
      .number()
      .int()
      .min(0, "Net NPA must be non-negative.")
      .optional(),
    interest_cost: z.number().int().optional(),
    net_npa_percentage: z
      .number()
      .multipleOf(0.01)
      .min(0, "Net NPA percentage must be non-negative.")
      .max(100, "Net NPA percentage cannot exceed 100.")
      .optional(),
  })
  .partial();


  
// --- research_stock_key_metrics Schema ---
export const researchStockKeyMetricsSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    snapshot_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Invalid snapshot date format. Expected YYYY-MM-DD."
      )
      .optional(), // Changed date format expectation
    cmp: z
      .number()
      .multipleOf(0.01)
      .min(0, "CMP must be non-negative.")
      .optional(),
    pe_ratio: optionalNumber,
    enterprise_value: z
      .number()
      .int()
      .min(0, "Enterprise Value must be non-negative.")
      .optional(),
    market_cap: z
      .number()
      .int()
      .min(0, "Market Cap must be non-negative.")
      .optional(),
    fifty_two_week_high: z
      .number()
      .multipleOf(0.01)
      .min(0, "52 Week High must be non-negative.")
      .optional(),
    fifty_two_week_low: z
      .number()
      .multipleOf(0.01)
      .min(0, "52 Week Low must be non-negative.")
      .optional(),
  })
  .partial();

// --- research_stock_performance_metrics Schema ---
export const researchStockPerformanceMetricsSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    period_type: z
      .string()
      .max(10, "Period type cannot exceed 10 characters.")
      .refine(
        (val) =>
          ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "YTD"].includes(val),
        "Invalid period type."
      )
      .optional(),
    stock_return: z.number().multipleOf(0.01).optional(),
    benchmark_return: z.number().multipleOf(0.01).optional(),
  })
  .partial();

// --- research_stock_R_D_investments Schema ---
export const researchStockRDInvestmentsSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    fiscal_year: z.number().int().min(1900).max(2100).optional(),
    rd_investments_crores: z
      .number()
      .int()
      .min(0, "R&D Investments must be non-negative.")
      .optional(),
    rd_as_percent_of_sales: z
      .number()
      .multipleOf(0.01)
      .min(0, "R&D as percent of sales must be non-negative.")
      .max(100, "R&D as percent of sales cannot exceed 100.")
      .optional(),
  })
  .partial();

// --- research_stock_revenue_mix Schema ---
export const researchStockRevenueMixSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    fiscal_year: z.number().int().min(1900).max(2100).optional(),
    mix_type: z
      .string()
      .max(50, "Mix type cannot exceed 50 characters.")
      .optional(),
    category: z
      .string()
      .max(100, "Category cannot exceed 100 characters.")
      .optional(),
    percentage: z
      .number()
      .multipleOf(0.01)
      .min(0, "Percentage must be non-negative.")
      .max(100, "Percentage cannot exceed 100.")
      .optional(),
  })
  .partial();

// --- research_stock_shareholding_pattern Schema ---
export const researchStockShareholdingPatternSchema = z
  .object({
    stock_id: z.number().int().positive().optional(), // Make optional for frontend
    period_month: z
      .number()
      .int()
      .min(1)
      .max(12, "Invalid month. Expected a number between 1 and 12.")
      .optional(), // Changed to number
    period_year: z.number().int().min(1900).max(2100).optional(),
    promoters: z
      .number()
      .multipleOf(0.01)
      .min(0, "Promoters percentage must be non-negative.")
      .max(100, "Promoters percentage cannot exceed 100.")
      .optional(),
    share_holding_pledge: z
      .number()
      .multipleOf(0.01)
      .min(0, "Share holding pledge percentage must be non-negative.")
      .max(100, "Share holding pledge percentage cannot exceed 100.")
      .optional(),
    fii: z
      .number()
      .multipleOf(0.01)
      .min(0, "FII percentage must be non-negative.")
      .max(100, "FII percentage cannot exceed 100.")
      .optional(),
    public: z
      .number()
      .multipleOf(0.01)
      .min(0, "Public percentage must be non-negative.")
      .max(100, "Public percentage cannot exceed 100.")
      .optional(),
    total_dil: z
      .number()
      .multipleOf(0.01)
      .min(0, "Total DIL percentage must be non-negative.")
      .max(100, "Total DIL percentage cannot exceed 100.")
      .optional(),
  })
  .partial();

// --- research_stocks Schema (corrected for numerical types and optional strings) ---
export const researchStockSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(45, "Symbol cannot exceed 45 characters."), // Added min(1) for required field
  // date: z
  //   .string()
  //   .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD."), // Changed to YYYY-MM-DD
  // price: z.number().multipleOf(0.01).min(0, "Price must be non-negative."),
  // change_perc: optionalNumber, // Changed to number
  // market_cap: optionalNumber, // Changed to number
  // target: optionalNumber,
  // upside_downside: optionalNumber, // Changed to number
  // rating: optionalString,
  // profit_booked: optionalNumber, // Changed to number
  // icon: optionalString,
  // price_raw: optionalNumber, // Changed to number
});

// --- Master Schema ---
export const fullStockResearchSchema = z.object({
  stock:researchStockSchema,
  balance_sheet: researchStockBalanceSheetSchema.partial().optional(),
  details: researchStockDetailsSchema.partial().optional(),
  // exports_imports: researchStockExportsImportsSchema.partial().optional(),
  financial_ratios: researchStockFinancialRatiosSchema.partial().optional(),
  income_statement: researchStockIncomeStatementSchema.partial().optional(),
  key_metrics: researchStockKeyMetricsSchema.partial().optional(),
  performance_metrics: researchStockPerformanceMetricsSchema
    .partial()
    .optional(),
  rd_investments: researchStockRDInvestmentsSchema.partial().optional(),
  revenue_mix: researchStockRevenueMixSchema.partial().optional(),
  shareholding_pattern: researchStockShareholdingPatternSchema
    .partial()
    .optional(),
});

export type FullStockResearchSchema = z.infer<typeof fullStockResearchSchema>;
