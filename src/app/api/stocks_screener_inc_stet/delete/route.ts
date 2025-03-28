import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const stockId = Number(id);
    if (!stockId)
      return NextResponse.json(
        { message: "Stock ID is required" },
        { status: 400 }
      );

    const query = `DELETE FROM stocks_screener_incomestatement WHERE id = ?`;
    await pool.execute(query, [stockId]);

    return NextResponse.json(
      { success: true, message: "Stock deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting stock", error },
      { status: 500 }
    );
  }
}
