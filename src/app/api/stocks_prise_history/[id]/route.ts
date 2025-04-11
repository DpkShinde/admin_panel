import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// GET request: Fetch stock record by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const stockId = Number(id);
    console.log(stockId);

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

    // ✅ Fetch all column names dynamically except "id"
    const [columnsResult]: any[] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${process.env.DB_DATABASE_NAME}'
        AND TABLE_NAME = 'stock_prices'
        AND COLUMN_NAME NOT IN ('id')
    `);

    const allowedColumns = columnsResult.map((col: any) => col.COLUMN_NAME);

    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (stock_name && allowedColumns.includes("stock_name")) {
      fieldsToUpdate.push("stock_name = ?");
      values.push(stock_name);
    }

    if (stock_symbol && allowedColumns.includes("stock_symbol")) {
      fieldsToUpdate.push("stock_symbol = ?");
      values.push(stock_symbol);
    }

    for (const [column, price] of Object.entries(prices)) {
      if (allowedColumns.includes(column)) {
        fieldsToUpdate.push(`\`${column}\` = ?`);
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
