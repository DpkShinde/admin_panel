import { NextRequest, NextResponse } from "next/server";
import pool3 from "@/utils/dbAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const { username, email, password, role } = data;
    let { status } = data;
    console.log("Received data:", data);

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    // Normalize isActive to 1 or 0
    if (status === true || status === "true") {
      status = 1;
    } else if (status === false || status === "false") {
      status = 0;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool3
      .promise()
      .query(
        `INSERT INTO admin_panel_users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, role, status]
      );

    return NextResponse.json(
      {
        success: true,
        message: "User Added Successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding records.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
