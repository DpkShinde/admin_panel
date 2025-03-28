import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  const requestData = await req.json();
  const { data } = requestData;
  console.log(data);

  try {
    if (Array.isArray(data) && data.length > 0) {
      const query = `INSERT INTO mutualfunds_directplan_details (
          Scheme_Name, Scheme_Code, Scheme_Type, Sub_Category, NAV, AuM_Cr, 
          Column_1D_Change, NAV_Date, Column_52W_High, Column_52WH_as_on, Column_52W_Low, 
          Column_52WL_as_on, Column_1W, Column_1M, Column_3M, Column_6M, YTD, 
          Column_1Y, Column_2Y, Column_3Y, Column_5Y, Column_10Y) 
          VALUES ?`;

      const values = data.map((stock: any) => [
        stock.Scheme_Name || null,
        stock.Scheme_Code || null,
        stock.Scheme_Type || null,
        stock.Sub_Category || null,
        stock.NAV || null,
        stock.AuM_Cr || null,
        stock.Column_1D_Change || null,
        stock.NAV_Date || null,
        stock.Column_52W_High || null,
        stock.Column_52WH_as_on || null,
        stock.Column_52W_Low || null,
        stock.Column_52WL_as_on || null,
        stock.Column_1W || null,
        stock.Column_1M || null,
        stock.Column_3M || null,
        stock.Column_6M || null,
        stock.YTD || null,
        stock.Column_1Y || null,
        stock.Column_2Y || null,
        stock.Column_3Y || null,
        stock.Column_5Y || null,
        stock.Column_10Y || null,
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

    if (typeof data === "object" && data !== null) {
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
      } = data;

      if (!Scheme_Code) {
        return NextResponse.json(
          { success: false, message: "Scheme_Code is required." },
          { status: 400 }
        );
      }

      const query = `INSERT INTO mutualfunds_directplan_details (
          Scheme_Name, Scheme_Code, Scheme_Type, Sub_Category, NAV, AuM_Cr, 
          Column_1D_Change, NAV_Date, Column_52W_High, Column_52WH_as_on, Column_52W_Low, 
          Column_52WL_as_on, Column_1W, Column_1M, Column_3M, Column_6M, YTD, 
          Column_1Y, Column_2Y, Column_3Y, Column_5Y, Column_10Y) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const values = [
        Scheme_Name || null,
        Scheme_Code,
        Scheme_Type || null,
        Sub_Category || null,
        NAV || null,
        AuM_Cr || null,
        Column_1D_Change || null,
        NAV_Date || null,
        Column_52W_High || null,
        Column_52WH_as_on || null,
        Column_52W_Low || null,
        Column_52WL_as_on || null,
        Column_1W || null,
        Column_1M || null,
        Column_3M || null,
        Column_6M || null,
        YTD || null,
        Column_1Y || null,
        Column_2Y || null,
        Column_3Y || null,
        Column_5Y || null,
        Column_10Y || null,
      ];

      const [result] = await pool.query<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: "Fund added successfully!",
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
    console.error("Database Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database error: " + error.message,
      },
      { status: 500 }
    );
  }
}
