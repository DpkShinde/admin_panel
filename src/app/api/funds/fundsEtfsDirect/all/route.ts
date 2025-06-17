import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
    const offset = (page - 1) * limit;

    const fetchQuery: string = `SELECT * FROM etfsDirect LIMIT ? OFFSET ?`;
    const countQuery: string = `SELECT (*) COUNT AS TOTAL FROM etfsDirect`;

    const [data]: any[] = await pool.query(fetchQuery, [limit, offset]);
    const [countResult]: any[] = await pool.query(countQuery);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data,
        total,
        totalPages,
        currentPage: page,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error fetching ETF data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve ETF records.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
