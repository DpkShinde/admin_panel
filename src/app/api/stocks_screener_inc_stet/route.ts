import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `
        INSERT INTO stocks_screener_incomeStatement 
        (Symbol,Market_cap, sector, Revenue, RevenueGrowth, GrossProfit, OperatingIncome, NetIncome, EBITDA, EPS_Diluted, EPSDilutedGrowth, Market_cap_crore, pToE, pToB, peg, pToS, pToCF, price, ev, evEbitda, evSales, evEbit, \`index\`, marketCapCategory) 
        VALUES ?
      `;

      const values = data.map((stock: any) => [
        stock.Symbol ?? null,
        stock.Market_cap ?? null,
        stock.sector ?? null,
        stock.Revenue ?? 0,
        stock.RevenueGrowth ?? 0,
        stock.GrossProfit ?? 0,
        stock.OperatingIncome ?? 0,
        stock.NetIncome ?? 0,
        stock.EBITDA ?? 0,
        stock.EPS_Diluted ?? 0,
        stock.EPSDilutedGrowth ?? 0,
        stock.Market_cap_crore ?? 0,
        stock.pToE ?? 0,
        stock.pToB ?? 0,
        stock.peg ?? 0,
        stock.pToS ?? 0,
        stock.pToCF ?? 0,
        stock.price ?? 0,
        stock.ev ?? 0,
        stock.evEbitda ?? 0,
        stock.evSales ?? 0,
        stock.evEbit ?? 0,
        stock.index ?? null,
        stock.marketCapCategory ?? null,
      ]);

      const [result] = await pool.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} stocks added successfully!`,
        },
        { status: 201 }
      );
    }

    // Handle Single Object Insert
    if (typeof data === "object" && data !== null) {
      const {
        Symbol,
        Market_cap,
        sector,
        Revenue,
        RevenueGrowth,
        GrossProfit,
        OperatingIncome,
        NetIncome,
        EBITDA,
        EPS_Diluted,
        EPSDilutedGrowth,
        Market_cap_crore,
        pToE,
        pToB,
        peg,
        pToS,
        pToCF,
        price,
        ev,
        evEbitda,
        evSales,
        evEbit,
        index,
        marketCapCategory,
      } = data;

      if (!Symbol) {
        return NextResponse.json(
          { success: false, message: "Symbol is required." },
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO stocks_screener_incomestatement 
        (Symbol,Market_cap,sector, Revenue, RevenueGrowth, GrossProfit, OperatingIncome, NetIncome, EBITDA, EPS_Diluted, EPSDilutedGrowth, Market_cap_crore, pToE, pToB, peg, pToS, pToCF, price, ev, evEbitda, evSales, evEbit, \`index\`, marketCapCategory) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        Symbol,
        Market_cap,
        sector,
        Revenue ?? 0,
        RevenueGrowth ?? 0,
        GrossProfit ?? 0,
        OperatingIncome ?? 0,
        NetIncome ?? 0,
        EBITDA ?? 0,
        EPS_Diluted ?? 0,
        EPSDilutedGrowth ?? 0,
        Market_cap_crore ?? 0,
        pToE ?? 0,
        pToB ?? 0,
        peg ?? 0,
        pToS ?? 0,
        pToCF ?? 0,
        price ?? 0,
        ev ?? 0,
        evEbitda ?? 0,
        evSales ?? 0,
        evEbit ?? 0,
        index ?? null,
        marketCapCategory ?? null,
      ];

      const [result] = await pool.query<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: "Stock added successfully!",
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
        message: "Error adding records",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
