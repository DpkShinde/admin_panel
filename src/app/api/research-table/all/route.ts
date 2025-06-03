import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    //paginetion logic
    const { searchParams } = new URL(req.url);
    // console.log(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM research_stocks LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total from research_stocks`;

    const [data]: any = await pool.query<ResultSetHeader>(query,[limit,offset]);
    const [countResult]: any = await pool.query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        message:"successfully get stocks",
        success: true,
        data: data,
        total,
        totalPages,
        currentPage: page,
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
