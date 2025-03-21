import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      Symbol,
      Revenue,
      RevenueGrowth,
      GrossProfit,
      OperatingIncome,
      NetIncome,
      EBITDA,
      EPS_Diluted,
      EPSDilutedGrowth,
    } = data;

    const query = `INSERT INTO stocks_screener_incomeStatement 
                   (Symbol, Revenue, RevenueGrowth, GrossProfit, OperatingIncome, NetIncome, EBITDA, EPS_Diluted, EPSDilutedGrowth) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      Symbol,
      Revenue,
      RevenueGrowth,
      GrossProfit,
      OperatingIncome,
      NetIncome,
      EBITDA,
      EPS_Diluted,
      EPSDilutedGrowth,
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return NextResponse.json(
      {
        success: true,
        message: "Stock added successfully!",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error adding record", details: error },
      { status: 500 }
    );
  }
}
