import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

// Helper to convert Excel serial date to SQL date (YYYY-MM-DD)
function convertExcelDateToSQLDate(serial: number): string | null {
  if (!serial || isNaN(serial)) return null;
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(excelEpoch.getTime() + (serial - 2) * 86400000);
  return jsDate.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const requestData = await req.json();
  const { data } = requestData;

  console.log(data);
  try {
    if (Array.isArray(data) && data.length > 0) {
      const query = `INSERT INTO dummy_stocks_list (
        company, ltp_inr, change_percent, market_cap_cr, roe, pe, pbv, ev_ebitda,
        sales_growth_5y, profit_growth_5y, clarification, sector, High_52W_INR,
        Low_52W_INR, stock_index, event_date
      ) VALUES ?`;

      const values = data.map((stock: any) => [
        stock.company ?? null,
        stock.ltp_inr ?? 0,
        stock.change_percent ?? 0,
        stock.market_cap_cr ?? 0,
        stock.roe ?? 0,
        stock.pe ?? 0,
        stock.pbv ?? 0,
        stock.ev_ebitda ?? 0,
        stock.sales_growth_5y ?? 0,
        stock.profit_growth_5y ?? 0,
        stock.clarification ?? null,
        stock.sector ?? null,
        stock.High_52W_INR ?? 0,
        stock.Low_52W_INR ?? 0,
        stock.stock_index ?? null,
        convertExcelDateToSQLDate(stock.event_date),
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
      } = data;

      console.log(data);

      if (!company) {
        return NextResponse.json(
          { success: false, message: "Company is required." },
          { status: 400 }
        );
      }

      const query = `INSERT INTO dummy_stocks_list (
        company, ltp_inr, change_percent, market_cap_cr, roe, pe, pbv, ev_ebitda,
        sales_growth_5y, profit_growth_5y, clarification, sector, High_52W_INR,
        Low_52W_INR, stock_index, event_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        company ?? null,
        ltp_inr ?? 0,
        change_percent ?? 0,
        market_cap_cr ?? 0,
        roe ?? 0,
        pe ?? 0,
        pbv ?? 0,
        ev_ebitda ?? 0,
        sales_growth_5y ?? 0,
        profit_growth_5y ?? 0,
        clarification ?? null,
        sector ?? null,
        High_52W_INR ?? 0,
        Low_52W_INR ?? 0,
        stock_index ?? null,
        convertExcelDateToSQLDate(event_date),
      ];

      const [result] = await pool.query<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: "Stock added successfully!",
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
