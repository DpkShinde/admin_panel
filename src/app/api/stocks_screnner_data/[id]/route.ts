import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const stockId = Number(params.id);
  if (isNaN(stockId)) {
    return NextResponse.json({ message: "Invalid Stock ID" }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM stocks_screnner_data WHERE id = ?",
      [stockId]
    );

    if (rows.length === 0) {
      console.warn(`Stock with ID ${stockId} not found.`);
      return NextResponse.json({ message: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
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
  if (isNaN(stockId)) {
    return NextResponse.json({ message: "Invalid Stock ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      CompanyName,
      LastTradedPrice,
      ChangePercentage,
      MarketCap,
      High52W,
      Low52W,
      Sector,
      CurrentPE,
      IndexName,
      RecordDate,
      ROE,
      PBV,
      EV_EBITDA,
      FiveYearSalesGrowth,
      FiveYearProfitGrowth,
      Volume,
      EPS,
      EPSGrowth,
      DividendYield,
      DividendAmount,
      ROCE,
    } = body;

    const query = `
      UPDATE stocks_screnner_data 
      SET CompanyName = ?, LastTradedPrice = ?, ChangePercentage = ?, 
          MarketCap = ?, High52W = ?, Low52W = ?, Sector = ?, 
          CurrentPE = ?, IndexName = ?, RecordDate = ?, ROE = ?, PBV = ?, 
          EV_EBITDA = ?, FiveYearSalesGrowth = ?, FiveYearProfitGrowth = ?, 
          Volume = ?, EPS = ?, EPSGrowth = ?, DividendYield = ?, 
          DividendAmount = ?, ROCE = ?
      WHERE id = ?
    `;

    const values = [
      CompanyName,
      LastTradedPrice,
      ChangePercentage,
      MarketCap,
      High52W,
      Low52W,
      Sector,
      CurrentPE,
      IndexName,
      RecordDate,
      ROE,
      PBV,
      EV_EBITDA,
      FiveYearSalesGrowth,
      FiveYearProfitGrowth,
      Volume,
      EPS,
      EPSGrowth,
      DividendYield,
      DividendAmount,
      ROCE,
      stockId,
    ];

    const [result]: any = await pool.execute(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        { success: true, message: "Stock updated successfully!" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Stock not found or no changes made." },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
