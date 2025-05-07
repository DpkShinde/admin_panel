import { NextRequest, NextResponse } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const companiesQuery = `SELECT * FROM company_financial_results LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM company_financial_results`;

    const [companies]: any = await pool4.query(companiesQuery, [limit, offset]);
    const [countResult]: any = await pool4.query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: companies,
        total,
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching companies:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch companies",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
