import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    const numId = Number(id);

    if (!numId) {
      return NextResponse.json(
        { error: "ID is required for deletion" },
        { status: 400 }
      );
    }

    const query = "DELETE FROM stocks_screnner_data WHERE id=?";
    await pool.execute(query, [numId]);

    return NextResponse.json(
      { message: "Record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting record", details: error },
      { status: 500 }
    );
  }
}
