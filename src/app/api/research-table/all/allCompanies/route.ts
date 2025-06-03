import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const [result] = await pool.query(`SELECT * FROM research_stocks`);

    return NextResponse.json(
      {
        message: "successfully get stocks",
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Faild to fetch records",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
