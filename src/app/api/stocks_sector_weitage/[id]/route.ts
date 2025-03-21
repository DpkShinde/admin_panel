import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const stockId = Number(params.id);
  if (!stockId) {
    return NextResponse.json(
      { message: "Stock ID is required" },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM stocks_sector_weitage WHERE id = ?`,
      [stockId]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const stockId = Number(params.id);
  if (!stockId) {
    return NextResponse.json(
      { message: "Stock ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { Sector, NumberOfCompanies, Weightage, MarketCap } = body;

    await pool.query(
      `UPDATE stocks_sector_weitage SET Sector = ?, NumberOfCompanies = ?, Weightage = ?, MarketCap = ? WHERE id = ?`,
      [Sector, NumberOfCompanies, Weightage, MarketCap, stockId]
    );

    return NextResponse.json(
      { message: "Stock updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
