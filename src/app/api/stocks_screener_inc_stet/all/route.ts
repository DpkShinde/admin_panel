import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET(req: NextRequest) {
  try {
    //pagination
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM stocks_screener_incomestatement LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM stocks_screener_incomestatement`;

    const [data]: any = await pool.query(query, [limit, offset]);
    const [countResult]: any = await pool.query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    // const [rows] = await pool.query(
    //   `SELECT * FROM stocks_screener_incomestatement`
    // );

    return NextResponse.json(
      { success: true, data: data, total, totalPages, currentPage: page },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
