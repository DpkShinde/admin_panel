import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [result] = await pool.query(`SELECT * FROM dummy_stocks_list`);

    //response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get stocks",
        data: result,
      },
      {
        status: 200,
      }
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
