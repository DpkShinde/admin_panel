import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `
        INSERT INTO stocks_screnner_data (
          CompanyName, LastTradedPrice, ChangePercentage, MarketCap, High52W, Low52W, 
          Sector, CurrentPE, IndexName, RecordDate, ROE, PBV, EV_EBITDA, 
          FiveYearSalesGrowth, FiveYearProfitGrowth, Volume, EPS, EPSGrowth, 
          DividendYield, DividendAmount, ROCE
        ) VALUES ?
      `;

      const values = data.map((stock: any) => [
        stock.CompanyName ?? null,
        stock.LastTradedPrice ?? 0,
        stock.ChangePercentage ?? 0,
        stock.MarketCap ?? 0,
        stock.High52W ?? 0,
        stock.Low52W ?? 0,
        stock.Sector ?? null,
        stock.CurrentPE ?? 0,
        stock.IndexName ?? null,
        stock.RecordDate ?? null,
        stock.ROE ?? 0,
        stock.PBV ?? 0,
        stock.EV_EBITDA ?? 0,
        stock.FiveYearSalesGrowth ?? 0,
        stock.FiveYearProfitGrowth ?? 0,
        stock.Volume ?? 0,
        stock.EPS ?? 0,
        stock.EPSGrowth ?? 0,
        stock.DividendYield ?? 0,
        stock.DividendAmount ?? 0,
        stock.ROCE ?? 0,
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

    if (typeof data === "object" && data !== null) {
      const {
        CompanyName,
        LastTradedPrice,
        ChangePercentage,
        MarketCap,
        High52W,
        Low52W,
        Sector,
        CurrentPE,
        IndexName,
        RecordDate,
        ROE,
        PBV,
        EV_EBITDA,
        FiveYearSalesGrowth,
        FiveYearProfitGrowth,
        Volume,
        EPS,
        EPSGrowth,
        DividendYield,
        DividendAmount,
        ROCE,
      } = data;

      if (!CompanyName) {
        return NextResponse.json(
          { success: false, message: "CompanyName is required." },
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO stocks_screnner_data (
          CompanyName, LastTradedPrice, ChangePercentage, MarketCap, High52W, Low52W, 
          Sector, CurrentPE, IndexName, RecordDate, ROE, PBV, EV_EBITDA, 
          FiveYearSalesGrowth, FiveYearProfitGrowth, Volume, EPS, EPSGrowth, 
          DividendYield, DividendAmount, ROCE
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        CompanyName,
        LastTradedPrice ?? 0,
        ChangePercentage ?? 0,
        MarketCap ?? 0,
        High52W ?? 0,
        Low52W ?? 0,
        Sector ?? null,
        CurrentPE ?? 0,
        IndexName ?? null,
        RecordDate ?? null,
        ROE ?? 0,
        PBV ?? 0,
        EV_EBITDA ?? 0,
        FiveYearSalesGrowth ?? 0,
        FiveYearProfitGrowth ?? 0,
        Volume ?? 0,
        EPS ?? 0,
        EPSGrowth ?? 0,
        DividendYield ?? 0,
        DividendAmount ?? 0,
        ROCE ?? 0,
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
