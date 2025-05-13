import { NextRequest, NextResponse } from "next/server";
import pool3 from "@/utils/dbAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const { username, email, password, role } = data;
    let { status } = data;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    // Strong password regex
    const checkStrongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{16,}$/;

    if (!checkStrongPassword.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 16 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        },
        { status: 400 }
      );
    }

    // Normalize status to 1 or 0
    status = status === true || status === "true" ? 1 : 0;

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
