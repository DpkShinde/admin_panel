export interface StockScreenerData {
  id: number;
  CompanyName: string;
  LastTradedPrice: number;
  ChangePercentage: number | null;
  MarketCap: number | null;
  High52W: number | null;
  Low52W: number | null;
  Sector: string;
  CurrentPE: number | null;
  IndexName?: string | null;
  RecordDate: string;
  ROE: number | null;
  PBV: number | null;
  EV_EBITDA: number | null;
  FiveYearSalesGrowth: number | null;
  FiveYearProfitGrowth: number | null;
  Volume: number | null;
  EPS: number | null;
  EPSGrowth: number | null;
  DividendYield: number | null;
  DividendAmount: number | null;
  ROCE: number | null;
  Analyst_Rating: string | null;
  Market_cap_crore: number | null;
  sector_earnings_yoy: number | null;
  sector_earnings_yoy_per: number | null;
  Industries: string | null;
  NIFTY_50: string | null;
  NIFTY_NEXT_50: string | null;
  NIFTY_100: string | null;
  NIFTY_200: string | null;
  NIFTY_SMALLCAP_100: string | null;
  NIFTY_MIDSMALLCAP_400: string | null;
  NIFTY_LARGEMIDCAP_250: string | null;
  NIFTY_500: string | null;
}

export interface StockScreenerValuation {
  id: number;
  Symbol: string;
  sector: string;
  MarketCap: number;
  MarketCapPercentage: number;
  PERatio: number;
  PSRatio: number;
  PBRatio: number;
  PFCFRatio: number | null; // To handle null values
  Price: number;
  EnterpriseValue: number;
  EVRevenue: number;
  EVEBIT: number;
  EVEBITDA: number;
  Market_cap_crore: number;
  perf: string;
  index: string;
  market_cap_category: string;
}

export interface StockScreenerIncomeStatement {
  id: number;
  Symbol: string;
  Market_cap: string;
  sector: string;
  Revenue: number;
  RevenueGrowth: number;
  GrossProfit: number;
  OperatingIncome: number;
  NetIncome: number;
  EBITDA: number;
  EPS_Diluted: number;
  EPSDilutedGrowth: number;
  Market_cap_crore: number;
  pToE: number;
  pToB: number;
  peg: number;
  pToS: number;
  pToCF: number;
  price: number;
  ev: number;
  evEbitda: number;
  evSales: number;
  evEbit: number;
  index: string;
  marketCapCategory: string;
}

export interface SectorWeightage {
  id: number;
  Sector: string;
  NumberOfCompanies: number;
  Weightage: number;
  MarketCap: number;
}

export interface FundDetails {
  ID: number;
  Scheme_Name?: string;
  Scheme_Code?: number | null;
  Scheme_Type?: string;
  Sub_Category?: string;
  NAV?: number | null;
  AuM_Cr?: number | null;
  Column_1D_Change?: number | null;
  NAV_Date?: string;
  Column_52W_High?: number | null;
  Column_52WH_as_on?: string;
  Column_52W_Low?: number | null;
  Column_52WL_as_on?: string;
  Column_1W?: number | null;
  Column_1M?: number | null;
  Column_3M?: string;
  Column_6M?: string;
  YTD?: string;
  Column_1Y?: string;
  Column_2Y?: string;
  Column_3Y?: string;
  Column_5Y?: string;
  Column_10Y?: string;
}

export interface StockList {
  id: number;
  company: string;
  ltp_inr: number;
  change_percent: number;
  market_cap_cr: number;
  roe: number;
  pe: number;
  pbv: number;
  ev_ebitda: number;
  sales_growth_5y: number;
  profit_growth_5y: number;
  clarification?: string;
  sector: string;
  High_52W_INR: number;
  Low_52W_INR: number;
  stock_index?: string;
  event_date?: string;
}

export interface StockPrise {
  id: number;
  stock_name: string;
  stock_symbol: string;
  "2025-04-01"?: number;
  "2025-04-02"?: number;
  "2025-04-03"?: number;
  "2025-04-04"?: number;
  "2025-04-05"?: number;
  "2025-04-06"?: number;
  "2025-04-07"?: number;
  "2025-04-08"?: number;
  "2025-04-09"?: number;
  "2025-04-10"?: number;
  "2025-04-11"?: number;
  "2025-04-12"?: number;
  "2025-04-13"?: number;
  "2025-04-14"?: number;
  "2025-04-15"?: number;
  "2025-04-16"?: number;
  "2025-04-17"?: number;
  "2025-04-18"?: number;
  "2025-04-19"?: number;
  "2025-04-20"?: number;
  "2025-04-21"?: number;
  "2025-04-22"?: number;
  "2025-04-23"?: number;
  "2025-04-24"?: number;
  "2025-04-25"?: number;
  "2025-04-26"?: number;
  "2025-04-27"?: number;
  "2025-04-28"?: number;
  "2025-04-29"?: number;
  "2025-04-30"?: number;
}

//for stocks details tables
export interface Company {
  id: number;
  name?: string;
  market_cap_category?: string;
}

//interfaces for stock details add component
// Cash Flow Interface
interface CashFlow {
  fiscal_year: string;
  cash_from_operations: number | null;
  cash_from_investing: number | null;
  cash_from_financing: number | null;
  net_cash_flow: number | null;
}

// Balance Sheet Interface
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

// Annual Profit & Loss Interface
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

// Financial Metrics Interface
interface FinancialMetrics {
  metric_type: string;
  three_year: number | null;
  five_year: number | null;
  ten_year: number | null;
  ttm: number | null;
}

// Financial Ratios Interface
interface FinancialRatios {
  fiscal_year: string;
  debtor_days: number | null;
  inventory_days: number | null;
  days_payable: number | null;
  cash_conversion_cycle: number | null;
  working_capital_days: number | null;
  roce_percent: number | null;
}

// Valuation Inputs Interface
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

// Peer Analysis Interface
interface PeerAnalysis {
  cmp: number | null;
  change_percent: number | null;
  net_sales_cr: number | null;
  latest_eps: number | null;
  net_profit_margin: number | null;
}

// Peer Valuations Interface
interface PeerValuations {
  valuation: string;
  pe_ratio: number | null;
  ev_ebitda: number | null;
  peg_ratio: number | null;
}

// Quarterly Financials Interface
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

// Form Data Interface
export default interface FormData {
  name: string;
  market_cap_category: string;
  cash_flow: CashFlow;
  balance_sheet: BalanceSheet;
  annual_profit_loss: AnnualProfitLoss;
  financial_metrics: FinancialMetrics;
  financial_ratios: FinancialRatios;
  valuation_inputs: ValuationInputs;
  peer_analysis: PeerAnalysis;
  peer_valuations: PeerValuations;
  quarterly_financials: QuarterlyFinancials;
}

export default interface adminUsers {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

//for quaterly earnings table
export interface CompanyInfo {
  company_id: number;
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
  id: number;
  company_id: number;
  fiscal_year: number;
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
  id: number;
  company_id: number;
  area_name: string;
  description?: string;
}

export interface QCashFlow {
  id: number;
  company_id: number;
  fiscal_year: number;
  cash_operating?: number;
  cash_investing?: number;
  cash_financing?: number;
  cash_others?: number;
  net_cash_flow?: number;
}

export interface QFinancialRatios {
  id: number;
  company_id: number;
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
  id: number;
  company_id: number;
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
  id: number;
  company_id: number;
  name: string;
  position: string;
  join_date?: string; // or Date
  leave_date?: string; // or Date
}

export interface News {
  id: number;
  company_id: number;
  title: string;
  content?: string;
  publish_date?: string; // or Date
  source?: string;
  url?: string;
}

export interface NPA {
  id: number;
  company_id: number;
  fiscal_year: number;
  gross_npa_amount?: number;
  gross_npa_percentage?: number;
  net_npa_amount?: number;
  net_npa_percentage?: number;
}

export interface QPeerAnalysis {
  id: number;
  company_id: number;
  company_name: string;
  price?: number;
  change_percentage?: number;
  market_cap?: number;
  ttm_pe?: number;
  pb_ratio?: number;
  roe?: number;
  one_year_performance?: number;
  car?: number;
  interest_earned?: number;
  nim?: number;
  analysis_date?: string; // or Date
}

export interface QuarterlyEarnings {
  id: number;
  company_id: number;
  year: number;
  quarter: number;
  revenue?: number;
  net_profit?: number;
  eps?: number;
  bvps_percentage?: number;
  roe?: number;
  nim?: number;
}

export interface Shareholding {
  id: number;
  company_id: number;
  quarter_year: string;
  promoters?: number;
  foreign_institutions?: number;
  dii?: number;
  public?: number;
  others?: number;
}

export interface Business_areas {
  id: number;
  companyId: number;
  areaName: string;
  description?: string;
}

export interface CompanyFinancialResult {
  company_id: number;
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
