import { NextRequest, NextResponse } from "next/server";
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

    const query = `DELETE FROM dummy_stocks_list WHERE id = ?`;
    await pool.execute(query, [stockId]);

    //response
    return NextResponse.json(
      { success: true, message: "Stock deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error deleting stock", error },
      { status: 500 }
    );
  }
}
