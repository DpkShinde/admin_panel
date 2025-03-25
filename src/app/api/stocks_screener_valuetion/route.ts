import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `
        INSERT INTO stocks_screnner_valuetion
        (Symbol, MarketCap, MarketCapPercentage, PERatio, PSRatio, PBRatio, PFCFRatio,
        Price, EnterpriseValue, EVRevenue, EVEBIT, EVEBITDA)
        VALUES ?
      `;

      const values = data.map((entry: any) => [
        entry.Symbol ?? null,
        entry.MarketCap ?? 0,
        entry.MarketCapPercentage ?? 0,
        entry.PERatio ?? 0,
        entry.PSRatio ?? 0,
        entry.PBRatio ?? 0,
        entry.PFCFRatio ?? 0,
        entry.Price ?? 0,
        entry.EnterpriseValue ?? 0,
        entry.EVRevenue ?? 0,
        entry.EVEBIT ?? 0,
        entry.EVEBITDA ?? 0,
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
      const {
        Symbol,
        MarketCap,
        MarketCapPercentage,
        PERatio,
        PSRatio,
        PBRatio,
        PFCFRatio,
        Price,
        EnterpriseValue,
        EVRevenue,
        EVEBIT,
        EVEBITDA,
      } = data;

      if (!Symbol) {
        return NextResponse.json(
          { success: false, message: "Symbol is required." },
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO stocks_screnner_valuetion
        (Symbol, MarketCap, MarketCapPercentage, PERatio, PSRatio, PBRatio, PFCFRatio,
        Price, EnterpriseValue, EVRevenue, EVEBIT, EVEBITDA)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        Symbol,
        MarketCap ?? 0,
        MarketCapPercentage ?? 0,
        PERatio ?? 0,
        PSRatio ?? 0,
        PBRatio ?? 0,
        PFCFRatio ?? 0,
        Price ?? 0,
        EnterpriseValue ?? 0,
        EVRevenue ?? 0,
        EVEBIT ?? 0,
        EVEBITDA ?? 0,
      ];

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
