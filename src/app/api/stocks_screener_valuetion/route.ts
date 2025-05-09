import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `
        INSERT INTO stocks_screnner_valuetion
        (Symbol,sector, MarketCap, MarketCapPercentage, PERatio, PSRatio, PBRatio,PCFRatio, PFCFRatio,
        Price, EnterpriseValue, EVRevenue, EVEBIT, EVEBITDA,Market_cap_crore,perf, \`index\`,market_cap_category,NIFTY_50, NIFTY_NEXT_50,  NIFTY_100, NIFTY_200, NIFTY_SMALLCAP_100, NIFTY_MIDSMALLCAP_400, NIFTY_LARGEMIDCAP_250, NIFTY_500)
        VALUES ?
      `;

      const values = data.map((entry: any) => [
        entry.Symbol ?? null,
        entry.sector ?? null,
        entry.MarketCap ?? 0,
        entry.MarketCapPercentage != null
          ? (entry.MarketCapPercentage * 100).toFixed(2) + "%"
          : null,
        entry.PERatio ?? 0,
        entry.PSRatio ?? 0,
        entry.PBRatio ?? 0,
        entry.PCFRatio ?? 0,
        entry.PFCFRatio ?? 0,
        entry.Price ?? 0,
        entry.EnterpriseValue ?? 0,
        entry.EVRevenue ?? 0,
        entry.EVEBIT ?? 0,
        entry.EVEBITDA ?? 0,
        entry.Market_cap_crore ?? 0,
        entry.perf ?? null,
        entry.index ?? null,
        entry.market_cap_category ?? null,
        entry.NIFTY_50 ?? null,
        entry.NIFTY_NEXT_50 ?? null,
        entry.NIFTY_100 ?? null,
        entry.NIFTY_200 ?? null,
        entry.NIFTY_SMALLCAP_100 ?? null,
        entry.NIFTY_MIDSMALLCAP_400 ?? null,
        entry.NIFTY_LARGEMIDCAP_250 ?? null,
        entry.NIFTY_500 ?? null,
      ]);

      const [result] = await pool.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} records added successfully!`,
        },
        { status: 201 }
      );
    }

    console.log(data);

    if (typeof data === "object" && data !== null) {
      const {
        Symbol,
        sector,
        MarketCap,
        MarketCapPercentage,
        PERatio,
        PSRatio,
        PBRatio,
        PCFRatio,
        PFCFRatio,
        Price,
        EnterpriseValue,
        EVRevenue,
        EVEBIT,
        EVEBITDA,
        Market_cap_crore,
        perf,
        index,
        market_cap_category,
        NIFTY_50,
        NIFTY_NEXT_50,
        NIFTY_100,
        NIFTY_200,
        NIFTY_SMALLCAP_100,
        NIFTY_MIDSMALLCAP_400,
        NIFTY_LARGEMIDCAP_250,
        NIFTY_500,
      } = data;

      if (!Symbol) {
        return NextResponse.json(
          { success: false, message: "Symbol is required." },
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO stocks_screnner_valuetion
        (Symbol,sector, MarketCap, MarketCapPercentage, PERatio, PSRatio, PBRatio,PCFRatio, PFCFRatio,
        Price, EnterpriseValue, EVRevenue, EVEBIT, EVEBITDA,Market_cap_crore,perf, \`index\`,market_cap_category,NIFTY_50, NIFTY_NEXT_50,  NIFTY_100, NIFTY_200, NIFTY_SMALLCAP_100, NIFTY_MIDSMALLCAP_400, NIFTY_LARGEMIDCAP_250, NIFTY_500)
        VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        Symbol,
        sector,
        MarketCap ?? 0,
        MarketCap ?? 0,
        MarketCapPercentage != null
          ? (MarketCapPercentage * 100).toFixed(2) + "%"
          : null,
        PERatio ?? 0,
        PSRatio ?? 0,
        PBRatio ?? 0,
        PCFRatio ?? 0,
        PFCFRatio ?? 0,
        Price ?? 0,
        EnterpriseValue ?? 0,
        EVRevenue ?? 0,
        EVEBIT ?? 0,
        EVEBITDA ?? 0,
        Market_cap_crore ?? 0,
        perf ?? null,
        index ?? null,
        market_cap_category ?? null,
        NIFTY_50 ?? null,
        NIFTY_NEXT_50 ?? null,
        NIFTY_100 ?? null,
        NIFTY_200 ?? null,
        NIFTY_SMALLCAP_100 ?? null,
        NIFTY_MIDSMALLCAP_400 ?? null,
        NIFTY_LARGEMIDCAP_250 ?? null,
        NIFTY_500 ?? null,
      ];

      const [result] = await pool.query<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: "Record added successfully!",
          id: result.insertId,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid data format." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding records.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
