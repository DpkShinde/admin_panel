import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `
        INSERT INTO stocks_screener_incomeStatement 
        (Symbol,Market_cap, Revenue, RevenueGrowth, GrossProfit, OperatingIncome, NetIncome, EBITDA, EPS_Diluted, EPSDilutedGrowth) 
        VALUES ?
      `;

      const values = data.map((stock: any) => [
        stock.Symbol ?? null,
        stock.Market_cap ?? null,
        stock.Revenue ?? 0,
        stock.RevenueGrowth ?? 0,
        stock.GrossProfit ?? 0,
        stock.OperatingIncome ?? 0,
        stock.NetIncome ?? 0,
        stock.EBITDA ?? 0,
        stock.EPS_Diluted ?? 0,
        stock.EPSDilutedGrowth ?? 0,
      ]);

      const [result] = await pool.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} stocks added successfully!`,
        },
        { status: 201 }
      );
    }

    // Handle Single Object Insert
    if (typeof data === "object" && data !== null) {
      const {
        Symbol,
        Market_cap,
        Revenue,
        RevenueGrowth,
        GrossProfit,
        OperatingIncome,
        NetIncome,
        EBITDA,
        EPS_Diluted,
        EPSDilutedGrowth,
      } = data;

      if (!Symbol) {
        return NextResponse.json(
          { success: false, message: "Symbol is required." },
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO stocks_screener_incomestatement 
        (Symbol,Market_cap, Revenue, RevenueGrowth, GrossProfit, OperatingIncome, NetIncome, EBITDA, EPS_Diluted, EPSDilutedGrowth) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `;

      const values = [
        Symbol,
        Market_cap,
        Revenue ?? 0,
        RevenueGrowth ?? 0,
        GrossProfit ?? 0,
        OperatingIncome ?? 0,
        NetIncome ?? 0,
        EBITDA ?? 0,
        EPS_Diluted ?? 0,
        EPSDilutedGrowth ?? 0,
      ];

      const [result] = await pool.query<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: "Stock added successfully!",
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
        message: "Error adding records",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
