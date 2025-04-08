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
  Analyst_Rating : string | null;
}

export interface StockScreenerValuation {
  id: number;
  Symbol: string;
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
}

export interface StockScreenerIncomeStatement {
  id: number;
  Symbol: string;
  Revenue: number;
  RevenueGrowth: number;
  GrossProfit: number;
  OperatingIncome: number;
  NetIncome: number;
  EBITDA: number;
  EPS_Diluted: number;
  EPSDilutedGrowth: number;
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
