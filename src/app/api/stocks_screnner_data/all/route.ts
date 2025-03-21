import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { StockScreenerData } from "@/types";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<StockScreenerData[] & RowDataPacket[]>(
      `SELECT * FROM stocks_screnner_data`
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
