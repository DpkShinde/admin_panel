import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const fundId: number = Number(id);
    if (!fundId)
      return NextResponse.json(
        { message: "Stock ID is required" },
        { status: 400 }
      );

    const query: string = `DELETE FROM mutualfunds_directplan_details WHERE id = ?`;
    await pool.execute(query, [fundId]);

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
