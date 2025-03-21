import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
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
    } = await req.json();

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
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Stock added successfully!",
          id: result.insertId,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to insert record." },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Error adding record" }, { status: 500 });
  }
}
