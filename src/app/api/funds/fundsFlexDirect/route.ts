import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import {
  etfsDirectArraySchema,
  etfsDirectSchema,
} from "@/lib/etfsDirect.schema";
import { ResultSetHeader } from "mysql2";

//Utility to convert stringified numbers to numbers safely
function parseNumber(value: any) {
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    //handle buld insert(for excel sheet)
    if (Array.isArray(data)) {
      const parsed = etfsDirectArraySchema.safeParse(data);

      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      const values = parsed.data.map((entry: any) => [
        entry.fund_name,
        parseNumber(entry.nav),
        parseNumber(entry.aum_crore),
        parseNumber(entry.sip_amount),
        parseNumber(entry.expense_ratio),
        parseNumber(entry.return_1yr),
        parseNumber(entry.return_3yr),
        parseNumber(entry.return_5yr),
      ]);

      const insertQuery = `INSERT INTO flexfundsDirect(fund_name, nav, aum_crore, sip_amount,
          expense_ratio, return_1yr, return_3yr, return_5yr) VALUES ?`;

      const [result] = await pool.query<ResultSetHeader>(insertQuery, [values]);

      //response
      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} records inserted`,
        },
        { status: 201 }
      );
    }

    //for single object
    if (typeof data === "object" && data !== null) {
      const parsed = etfsDirectSchema.safeParse(data);

      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      const {
        fund_name,
        nav,
        aum_crore,
        sip_amount,
        expense_ratio,
        return_1yr,
        return_3yr,
        return_5yr,
      } = parsed.data;

      const insertQuery = `INSERT INTO flexfundsDirect(fund_name, nav, aum_crore, sip_amount,
          expense_ratio, return_1yr, return_3yr, return_5yr) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        fund_name,
        nav,
        aum_crore,
        sip_amount,
        expense_ratio,
        return_1yr,
        return_3yr,
        return_5yr,
      ];

      const [result] = await pool.query<ResultSetHeader>(insertQuery, values);

      return NextResponse.json(
        {
          success: true,
          message: "Single record inserted",
          id: result.insertId,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid input field",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
