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
    const { stock_name, stock_symbol, trade_date, closing_price } = updateData;

    // Ensure at least one field is provided for update
    if (
      !stock_name &&
      !stock_symbol &&
      !trade_date &&
      closing_price === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "At least one field is required to update" },
        { status: 400 }
      );
    }

    // Check if stock exists before updating
    const [existingStock]: any[] = await pool.query(
      `SELECT id FROM stock_prices WHERE id = ?`,
      [stockId]
    );

    if (existingStock.length === 0) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 404 }
      );
    }

    // Update query dynamically based on provided fields
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
    if (trade_date) {
      fieldsToUpdate.push("trade_date = ?");
      values.push(trade_date);
    }
    if (closing_price !== undefined) {
      fieldsToUpdate.push("closing_price = ?");
      values.push(closing_price);
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
