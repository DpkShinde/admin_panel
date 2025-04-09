import { NextRequest, NextResponse } from "next/server";
import pool2 from "@/utils/db2";

//Fetch company by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const { id } = await params;
  const stockId = await Number(id);

  if (isNaN(stockId)) {
    return NextResponse.json(
      { success: false, message: "Invalid stock ID." },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await pool2.query(
      `SELECT * FROM companies WHERE id = ?`,
      [stockId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Stock not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("GET company error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

//Update company by ID
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const stockId = Number(context.params.id);

  if (isNaN(stockId)) {
    return NextResponse.json(
      { success: false, message: "Invalid stock ID." },
      { status: 400 }
    );
  }

  try {
    const { name, market_cap_category } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    const [result]: any = await pool2.query(
      `UPDATE companies SET name = ?, market_cap_category = ? WHERE id = ?`,
      [name, market_cap_category ?? null, stockId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "No record updated. Company not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Company updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT company error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
