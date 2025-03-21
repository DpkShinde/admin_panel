import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    const numId = Number(id);

    if (!numId) {
      return NextResponse.json(
        { success: false, error: "ID is required for deletion" },
        { status: 400 }
      );
    }

    const query = `DELETE FROM stocks_sector_weitage WHERE id = ?`;
    await pool.execute(query, [numId]);

    return NextResponse.json(
      { success: true, message: "Record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error deleting record", details: error },
      { status: 500 }
    );
  }
}
