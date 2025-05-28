import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";
import { NextResponse, NextRequest } from "next/server";

//for fetching single according to id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stockId = Number(params.id);

    if (!stockId) {
      return NextResponse.json(
        {
          error: "Stock id is required",
        },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM research_stocks WHERE researchstock_id = ?`,
      [stockId]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Stock not found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error fetching stock" },
      { status: 500 }
    );
  }
}

//For Update the stock
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sotckId = Number(params.id);
    if (!sotckId) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const {
      symbol,
      date,
      price,
      change_perc,
      market_cap,
      target,
      upside_downside,
      rating,
      profit_booked,
      price_raw,
    } = await req.json();

    await pool.query<ResultSetHeader>(
      `UPDATE research_stocks SET symbol = ?,date = ?,price = ?,change_perc = ?,market_cap = ?,target = ?,upside_downside = ?,rating = ?,profit_booked = ?,price_raw = ? WHERE researchstock_id = ?`,
      [
        symbol,
        date,
        price,
        change_perc,
        market_cap,
        target,
        upside_downside,
        rating,
        profit_booked,
        price_raw,
        sotckId
      ]
    );

    return NextResponse.json(
      {
        message: "Stock record update successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error updating news", details: error.message },
      { status: 500 }
    );
  }
}

//delete sotck record from table
export async function DELETE({ params }: { params: { id: string } }) {
  try {
    const stockId = Number(params.id);
    if (!stockId) {
      return NextResponse.json(
        {
          error: "Stock id is required",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM research_stocks WHERE researchstock_id = ?`,
      [stockId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Unable to delete record",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully deleted stock`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error deleting news", details: error.message },
      { status: 500 }
    );
  }
}
