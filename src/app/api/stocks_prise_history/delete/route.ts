import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const stockId = Number(id);

    if (isNaN(stockId) || stockId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid Stock ID is required" },
        { status: 400 }
      );
    }

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

    // Delete the stock record
    await pool.query(`DELETE FROM stock_prices WHERE id = ?`, [stockId]);

    return NextResponse.json(
      { success: true, message: "Stock deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting stock:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
