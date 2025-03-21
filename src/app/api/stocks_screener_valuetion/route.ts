import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
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
    } = await req.json();

    const query = `
      INSERT INTO stocks_screnner_valuetion
      (Symbol, MarketCap, MarketCapPercentage, PERatio, PSRatio, PBRatio, PFCFRatio,
      Price, EnterpriseValue, EVRevenue, EVEBIT, EVEBITDA)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
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
    ]);

    return NextResponse.json(
      { message: "Record added successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error adding record" }, { status: 500 });
  }
}
