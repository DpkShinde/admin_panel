import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM stocks_screener_incomestatement`
    );

    return NextResponse.json(
      { success: true, message: "Success", data: rows },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
