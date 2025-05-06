import { NextRequest, NextResponse } from "next/server";
import pool3 from "@/utils/dbAdmin";
import { ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const [rows]: any[] = await pool3
      .promise()
      .query(`SELECT * FROM admin_panel_users WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { username, email, password, role, isActive } = await req.json();
    console.log(role);

    if (!username || !email || !role) {
      console.error("Missing required fields:");
      return NextResponse.json(
        { success: false, message: "Username, email, and role are required." },
        { status: 400 }
      );
    }

    let normalizedIsActive = isActive ?? 0;

    //normalize isActive to 0 or 1
    if (
      normalizedIsActive === true ||
      normalizedIsActive === "true" ||
      normalizedIsActive === 1
    ) {
      normalizedIsActive = 1;
    } else {
      normalizedIsActive = 0;
    }
    
    // Validate role enum
    const allowedRoles = ["admin", "superadmin"];
    if (!allowedRoles.includes(role)) {
      console.error("Invalid role selected:", role);
      return NextResponse.json(
        { success: false, message: "Invalid role selected." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool3
      .promise()
      .query<ResultSetHeader>(
        `UPDATE admin_panel_users SET username = ?, email = ?, password = ?, role = ?, isActive = ? WHERE id = ?`,
        [username, email, hashedPassword, role, normalizedIsActive, id]
      );

    return NextResponse.json(
      { success: true, message: "User updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
