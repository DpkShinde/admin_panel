import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET request: Fetch stock record by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const stockId = Number(context.params.id);

    if (isNaN(stockId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Stock ID" },
        { status: 400 }
      );
    }

    const [rows]: any[] = await pool.query(
      `SELECT * FROM stock_prices WHERE id = ?`,
      [stockId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// PUT request: Update stock record by ID
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const stockId = Number(context.params.id);

    if (isNaN(stockId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Stock ID" },
        { status: 400 }
      );
    }

    const updateData = await req.json();
    const { stock_name, stock_symbol, ...prices } = updateData;

    const allowedColumns = [
      "stock_name",
      "stock_symbol",
      "2025-04-01",
      "2025-04-02",
      "2025-04-03",
      "2025-04-04",
      "2025-04-05",
      "2025-04-06",
      "2025-04-07",
      "2025-04-08",
      "2025-04-09",
      "2025-04-10",
      "2025-04-11",
      "2025-04-12",
      "2025-04-13",
      "2025-04-14",
      "2025-04-15",
      "2025-04-16",
      "2025-04-17",
      "2025-04-18",
      "2025-04-19",
      "2025-04-20",
      "2025-04-21",
      "2025-04-22",
      "2025-04-23",
      "2025-04-24",
      "2025-04-25",
      "2025-04-26",
      "2025-04-27",
      "2025-04-28",
      "2025-04-29",
      "2025-04-30",
    ];

    // collection fields that need to be updated
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (stock_name) {
      fieldsToUpdate.push("stock_name = ?");
      values.push(stock_name);
    }
    if (stock_symbol) {
      fieldsToUpdate.push("stock_symbol = ?");
      values.push(stock_symbol);
    }

    // Include valid date columns from request data
    for (const [date, price] of Object.entries(prices)) {
      if (allowedColumns.includes(date)) {
        fieldsToUpdate.push(`\`${date}\` = ?`);
        values.push(price);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid field is required to update.",
        },
        { status: 400 }
      );
    }

    values.push(stockId); 

    const updateQuery = `UPDATE stock_prices SET ${fieldsToUpdate.join(
      ", "
    )} WHERE id = ?`;

    await pool.query(updateQuery, values);

    return NextResponse.json(
      { success: true, message: "Stock updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
