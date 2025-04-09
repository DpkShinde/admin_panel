import { NextRequest, NextResponse } from "next/server";
import pool2 from "@/utils/db2";

export async function GET(req: NextRequest) {
  try {
    //paginetion
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM companies LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM companies`;

    const [data]: any = await pool2.query(query, [limit, offset]);
    const [countResult]: any = await pool2.query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);
    // const [rows] = await pool2.query("SELECT * FROM companies");

    return NextResponse.json(
      {
        success: true,
        data: data,
        total,
        totalPages,
        currentPage: page,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error fetching records:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch records",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
