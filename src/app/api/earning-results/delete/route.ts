import { NextRequest, NextResponse } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const result: any[] = await pool4.query(
      `DELETE FROM company_articles WHERE id = ?`,
      [id]
    );
    if (result[0].affectedRows === 0) {
      return NextResponse.json({ message: "No record found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, message: "Successfully deleted record" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
