import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { StockScreenerValuation } from "@/types";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<StockScreenerValuation[] & RowDataPacket[]>(
      `SELECT * FROM stocks_screnner_valuetion`
    );

    return NextResponse.json(
      {
        message: "success",
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database Error: ", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
