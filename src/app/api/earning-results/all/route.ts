import { NextRequest, NextResponse } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function GET() {
  try {
    const query = `
      SELECT * FROM company_articles
    `;
    const [rows]: any[] = await pool4.execute(query, []);

    if (rows.length === 0) {
      return NextResponse.json({ message: "No record found" }, { status: 404 });
    }

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
