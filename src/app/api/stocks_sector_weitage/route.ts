import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Sector, NumberOfCompanies, Weightage, MarketCap } = body;
    console.log(Sector, NumberOfCompanies, Weightage, MarketCap)

    if (!Sector || !NumberOfCompanies || !Weightage || !MarketCap) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO stocks_sector_weitage (Sector, NumberOfCompanies, Weightage, MarketCap) 
      VALUES (?, ?, ?, ?)
    `;
    const values = [Sector, NumberOfCompanies, Weightage, MarketCap];

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Stock added successfully!",
          id: result.insertId,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to insert record." },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error adding record", details: error },
      { status: 500 }
    );
  }
}
