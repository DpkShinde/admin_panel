import { NextResponse } from "next/server";
import pool2 from "@/utils/db2";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const stockId = Number(id);

    if (!stockId || isNaN(stockId)) {
      return NextResponse.json(
        { success: false, message: "Valid stock ID is required." },
        { status: 400 }
      );
    }

    const query = `DELETE FROM companies WHERE id = ?`;
    const [result]: any = await pool2.execute(query, [stockId]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "No stock found with the given ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Stock deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE stock error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while deleting stock.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
