import { NextRequest, NextResponse } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function GET(req: NextRequest) {
  try {
    const [rows]: any[] = await pool4.query(
      `SELECT company_id,company_name FROM company_financial_results`
    );
    if (rows.length === 0) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
    const companyData = rows.map((row: any) => ({
      company_id: row.company_id,
      company_name: row.company_name,
    }));
    return NextResponse.json(companyData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
