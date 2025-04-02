import { NextResponse, NextRequest } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Request data is missing." },
        { status: 400 }
      );
    }

    if (Array.isArray(data) && data.length > 0) {
      const query = `INSERT INTO stock_prices (stock_name, stock_symbol, trade_date, closing_price) VALUES ?`;

      const values = data.map((stock) => [
        stock.stock_name ?? null,
        stock.stock_symbol ?? null,
        stock.trade_date ?? null,
        stock.closing_price ?? 0,
      ]);

      if (!values.every((row) => row.every((field) => field !== null))) {
        return NextResponse.json(
          {
            success: false,
            message: "All fields are required for each stock.",
          },
          { status: 400 }
        );
      }

      const [result] = await pool.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} stock prices added successfully!`,
        },
        { status: 201 }
      );
    }

    // Handle Single Insert
    if (typeof data === "object" && data !== null) {
      const { stock_name, stock_symbol, trade_date, closing_price } = data;

      if (
        !stock_name ||
        !stock_symbol ||
        !trade_date ||
        closing_price === undefined
      ) {
        return NextResponse.json(
          { success: false, message: "All fields are required." },
          { status: 400 }
        );
      }

      const query = `INSERT INTO stock_prices (stock_name, stock_symbol, trade_date, closing_price) VALUES (?, ?, ?, ?)`;

      const values = [stock_name, stock_symbol, trade_date, closing_price];

      const [result] = await pool.execute<ResultSetHeader>(query, values);

      return NextResponse.json(
        { success: true, message: "Stock added successfully!" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid data format." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error adding stocks:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
