import pool3 from "@/utils/dbAdmin";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID is required.",
        },
        { status: 400 }
      );
    }
    //delete from db
    await pool3
      .promise()
      .query(`DELETE FROM admin_panel_users WHERE id = ?`, [id]);

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
