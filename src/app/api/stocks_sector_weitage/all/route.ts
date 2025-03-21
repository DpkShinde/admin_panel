import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`SELECT * FROM stocks_sector_weitage`);

    return NextResponse.json(
      {
        success: true,
        message: "success",
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching data" },
      { status: 500 }
    );
  }
}
