import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET request to fetch stock details by ID

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const fundId = Number(params.id);

    if (isNaN(fundId)) {
      return NextResponse.json(
        { message: "Invalid Stock ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT * FROM mutualfunds_directplan_details WHERE id = ?`,
      fundId
    );

    if (!rows) {
      return NextResponse.json({ message: "Stock not found" }, { status: 404 });
    }

    //response
    return NextResponse.json({ success: true, rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const fundId = Number(params.id);

  if (isNaN(fundId)) {
    return NextResponse.json({ message: "Invalid Stock ID" }, { status: 400 });
  }

  const {
    Scheme_Name,
    Scheme_Code,
    Scheme_Type,
    Sub_Category,
    NAV,
    AuM_Cr,
    Column_1D_Change,
    NAV_Date,
    Column_52W_High,
    Column_52WH_as_on,
    Column_52W_Low,
    Column_52WL_as_on,
    Column_1W,
    Column_1M,
    Column_3M,
    Column_6M,
    YTD,
    Column_1Y,
    Column_2Y,
    Column_3Y,
    Column_5Y,
    Column_10Y,
  } = await req.json();

  try {
    await pool.query(
      `UPDATE mutualfunds_directplan_details SET  Scheme_Name,
    Scheme_Code = ?,
    Scheme_Type = ?,
    Sub_Category = ?,
    NAV = ?,
    AuM_Cr = ?,
    Column_1D_Change = ?,
    NAV_Date = ?,
    Column_52W_High = ?,
    Column_52WH_as_on = ?,
    Column_52W_Low = ?,
    Column_52WL_as_on = ?,
    Column_1W = ?,
    Column_1M = ?,
    Column_3M = ?,
    Column_6M = ?,
    YTD = ?,
    Column_1Y = ?,
    Column_2Y = ?,
    Column_3Y = ?,
    Column_5Y = ?,
    Column_10Y = ? WHERE id = ?`,
      [
        Scheme_Name,
        Scheme_Code,
        Scheme_Type,
        Sub_Category,
        NAV,
        AuM_Cr,
        Column_1D_Change,
        NAV_Date,
        Column_52W_High,
        Column_52WH_as_on,
        Column_52W_Low,
        Column_52WL_as_on,
        Column_1W,
        Column_1M,
        Column_3M,
        Column_6M,
        YTD,
        Column_1Y,
        Column_2Y,
        Column_3Y,
        Column_5Y,
        Column_10Y,
      ]
    );

    //response
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
