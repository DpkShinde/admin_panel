import { NextResponse } from "next/server";
import pool2 from "@/utils/db2";

export async function GET() {
  try {
    const [rows] = await pool2.query("SELECT * FROM companies");

    return NextResponse.json({
      success: true,
      message: "Successfully fetched all records",
      data: rows,
    }, {
      status: 200,
    });

  } catch (error: any) {
    console.error("Error fetching records:", error);

    return NextResponse.json({
      success: false,
      message: "Failed to fetch records",
      error: error.message,
    }, {
      status: 500,
    });
  }
}
