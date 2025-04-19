import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    //paginetion
    const { searchParams } = new URL(req.url);
    console.log(req.url)
    // console.log(searchParams);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM mutualfunds_directplan_details LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM mutualfunds_directplan_details`;

    const [data]: any = await pool.query(query, [limit, offset]);
    const [countResult]: any = await pool.query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    // const [result] = await pool.query(
    //   `SELECT * FROM mutualfunds_directplan_details`
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
