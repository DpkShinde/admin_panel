import { NextResponse, NextRequest } from "next/server";
import pool from "@/utils/db";

// Get stock by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const stockId = Number(params.id);

  try {
    if (isNaN(stockId)) {
      return NextResponse.json(
        { message: "Invalid Stock ID" },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM dummy_stocks_list WHERE id = ?`,
      stockId
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Stock not found" }, { status: 404 });
    }

    // Response
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

// Update stock by ID
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const stockId = Number(params.id);

    if (isNaN(stockId)) {
      return NextResponse.json(
        { message: "Invalid Stock ID" },
        { status: 400 }
      );
    }

    const {
      company,
      ltp_inr,
      change_percent,
      market_cap_cr,
      roe,
      pe,
      pbv,
      ev_ebitda,
      sales_growth_5y,
      profit_growth_5y,
      clarification,
      sector,
      High_52W_INR,
      Low_52W_INR,
      stock_index,
      event_date,
    } = await req.json();

    if (
      !company ||
      typeof company !== "string" ||
      isNaN(ltp_inr) ||
      isNaN(change_percent) ||
      isNaN(market_cap_cr)
    ) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE dummy_stocks_list 
       SET company = ?, ltp_inr = ?, change_percent = ?, market_cap_cr = ?, roe = ?, pe = ?, pbv = ?, 
           ev_ebitda = ?, sales_growth_5y = ?, profit_growth_5y = ?, clarification = ?, sector = ?, 
           High_52W_INR = ?, Low_52W_INR = ?, stock_index = ?, event_date = ? 
       WHERE id = ?`,
      [
        company,
        ltp_inr,
        change_percent,
        market_cap_cr,
        roe,
        pe,
        pbv,
        ev_ebitda,
        sales_growth_5y,
        profit_growth_5y,
        clarification,
        sector,
        High_52W_INR,
        Low_52W_INR,
        stock_index,
        event_date,
        stockId,
      ]
    );

    // Response
    return NextResponse.json(
      { message: "Stock updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
