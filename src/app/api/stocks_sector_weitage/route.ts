import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `
        INSERT INTO stocks_sector_weitage (Sector, NumberOfCompanies, Weightage, MarketCap) 
        VALUES ?
      `;

      const values = data.map((entry: any) => [
        entry.Sector ?? null,
        entry.NumberOfCompanies ?? 0,
        entry.Weightage ?? 0,
        entry.MarketCap ?? 0,
      ]);

      const [result] = await pool.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} records added successfully!`,
        },
        { status: 201 }
      );
    }

    if (typeof data === "object" && data !== null) {
      const { Sector, NumberOfCompanies, Weightage, MarketCap } = data;

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

      const [result] = await pool.query<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: "Record added successfully!",
          id: result.insertId,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid data format." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding records.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
