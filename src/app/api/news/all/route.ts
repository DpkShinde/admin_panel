import { NextResponse } from "next/server";
import pool from "@/utils/db";

// GET: Fetch all news articles
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM news");
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error fetching news", details: error.message },
      { status: 500 }
    );
  }
}
