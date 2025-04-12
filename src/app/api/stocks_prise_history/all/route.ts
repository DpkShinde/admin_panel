import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await pool.query<ResultSetHeader>(
      "SELECT * FROM stock_prices"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No stocks found!" },
        { status: 404 }
      );
    }

    // Extract column names from the first row
    const columnNames = Object.keys(rows[0]);

    //response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully retrieved all stocks",
        data: rows,
        columns: columnNames,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
