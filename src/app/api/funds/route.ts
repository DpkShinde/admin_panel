import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  const requestData = await req.json();
  const { data } = requestData;

  if (Array.isArray(data) && data.length > 0) {
    const query = `INSERT INTO mutualfunds_directplan_details (Scheme_Name,Scheme_Code,Scheme_Type,Sub_Category,
        NAV,AuM_Cr,Column_1D_Change,NAV_Date,Column_52W_High,Column_52WH_as_on,Column_52W_Low,Column_52WL_as_on,Column_1W,Column_1M,Column_3M,Column_6M,YTD,Column_1Y,Column_2Y,Column_3Y,Column_5Y,Column_10Y)
        VALUES ?
        `;

    const values = data.map((stock: any) => {
      stock.Scheme_Name,
        stock.Scheme_Code,
        stock.Scheme_Type,
        stock.Sub_Category,
        stock.NAV,
        stock.AuM_Cr,
        stock.Column_1D_Change,
        stock.NAV_Date,
        stock.Column_52W_High,
        stock.Column_52WH_as_on,
        stock.Column_52W_Low,
        stock.Column_52WL_as_on,
        stock.Column_1W,
        stock.Column_1M,
        stock.Column_3M,
        stock.Column_6M,
        stock.YTD,
        stock.Column_1Y,
        stock.Column_2Y,
        stock.Column_3Y,
        stock.Column_5Y,
        stock.Column_10Y
    });

    const [result] = await pool.query<ResultSetHeader>(query, [values]);

    //response
    return NextResponse.json(
      {
        success: true,
        message: `${result.affectedRows}stocks added successfully!`,
      },
      {
        status: 201,
      }
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

    const query = `INSERT INTO mutualfunds_directplan_details (Scheme_Name,Scheme_Code,Scheme_Type,Sub_Category,
        NAV,AuM_Cr,Column_1D_Change,NAV_Date,Column_52W_High,Column_52WH_as_on,Column_52W_Low,Column_52WL_as_on,Column_1W,Column_1M,Column_3M,Column_6M,YTD,Column_1Y,Column_2Y,Column_3Y,Column_5Y,Column_10Y)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

    const values = {
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
    };

    const [result] = await pool.query<ResultSetHeader>(query, values);

    //response
    return NextResponse.json(
      {
        success: true,
        message: "funds added successfully",
        id: result.insertId,
      },
      {
        status: 201,
      }
    );
  }
}
