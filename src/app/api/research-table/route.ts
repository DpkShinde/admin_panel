import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const { data } = requestData;

    if (Array.isArray(data) && data.length > 0) {
      const query = `INSERT INTO research_stocks (symbol, date, price, change_perc, market_cap, target, upside_downside, rating, profit_booked, price_raw) VALUES ?`;

      const values = data.map((stock: any) => {
        stock.symbol;
        stock.date,
          stock.price,
          stock.change_perc,
          stock.market_cap,
          stock.target,
          stock.upside_downside,
          stock.rating,
          stock.profit_booked,
          stock.price_raw;
      });

      const [result] = await pool.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} records added successfully!`,
        },
        { status: 201 }
      );
    }

    if (typeof data === "object" && data !== null) {
      const {
        symbol,
        date,
        price,
        change_percent,
        market_cap,
        target,
        upside_downside,
        rating,
        profit_booked,
        price_raw,
      } = data;

      if (!symbol) {
        return NextResponse.json(
          {
            message: "Symbol is required",
          },
          { status: 400 }
        );
      }

      const query = `INSERT INTO research_stocks (symbol, date, price, change_perc, market_cap, target, upside_downside, rating, profit_booked, price_raw) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        symbol,
        date,
        price,
        change_percent,
        market_cap,
        target,
        upside_downside,
        rating,
        profit_booked,
        price_raw,
      ];

      const [result] = await pool.query<ResultSetHeader>(query, values);

      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            message: "Something went wrong. Record could not be added.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Record Added Successfully",
          id: result.insertId,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error to add research stock", error);
    return NextResponse.json(
      {
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
