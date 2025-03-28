import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [result] = await pool.query(
      `SELECT * FROM mutualfunds_directplan_details`
    );

    return NextResponse.json({
      success: true,
      message: "Successfuly get all funds",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
