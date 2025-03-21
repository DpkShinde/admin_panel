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
  