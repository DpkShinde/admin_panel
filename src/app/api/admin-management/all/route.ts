import { NextRequest, NextResponse } from "next/server";
import pool3 from "@/utils/dbAdmin";

export async function GET(req: NextRequest) {
  try {
    //paginetion
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);
    // Fetch all users from the database
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM admin_panel_users LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM admin_panel_users`;

    const [data]: any = await pool3.promise().query(query, [limit, offset]);
    const [countResult]: any = await pool3.promise().query(countQuery);

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);
    // const [rows] = await pool2.query("SELECT * FROM companies");
    if (data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No users found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching users.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
