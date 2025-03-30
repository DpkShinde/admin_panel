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
