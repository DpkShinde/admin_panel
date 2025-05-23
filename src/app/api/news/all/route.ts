import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

// GET: Fetch all news articles
export async function GET(req: NextRequest) {
  try {
    //peginetion
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 5);
    const limit = parseInt(searchParams.get("limit") || "5", 5);
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM news LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM news`;

    const [data]: any = await pool.query(query, [limit, offset]);
    const [countResult]: any = await pool.query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      { success: true, data: data, total, totalPages, currentPage: page },
      {
        status: 200,
      }
    );

    // const [rows] = await pool.query("SELECT * FROM news");
    // return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error fetching news", details: error.message },
      { status: 500 }
    );
  }
}
