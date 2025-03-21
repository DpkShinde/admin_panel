import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [blogs] = await pool.query("SELECT * FROM blogs");

    return NextResponse.json(
      { success: true, message: "Blogs fetched successfully", data: blogs },
      { status: 200 }
    );
    console.log(blogs)
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Error fetching blogs", details: error.message },
      { status: 500 }
    );
  }
}
