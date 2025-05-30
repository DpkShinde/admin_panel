import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import { getServerSession } from "next-auth";
import authOptions from "@/../auth.config";

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = Number(params.userId);
    const { username, first_name, last_name, email, phone_number } =
      await req.json();

    const session = await getServerSession(authOptions);

    //checking user is authorize
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Forbidden - Only superadmin can update users" },
        { status: 403 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user_details SET 
        username = ?, first_name = ?, last_name = ?, email = ?, phone_number = ? WHERE user_id = ?`,
      [username, first_name, last_name, email, phone_number, userId]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: "User not found or no changes made" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "User updated successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error updating user", details: error.message }),
      { status: 500 }
    );
  }
}

// Delete User
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // console.log(session);
    const userId = params.userId;

    //checking user is authorize
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // checking user role
    if (session?.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Forbidden - Only superadmin can delete users" },
        { status: 403 }
      );
    }

    //delete details from user details table
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM user_details WHERE user_id = ?`,
      [userId]
    );

    //delete details from usertable
    const [result2] = await pool.query<ResultSetHeader>(
      `DELETE FROM userstable WHERE user_id = ?`,
      [userId]
    );

    //delete records from user_investment_details table
    const [result3] = await pool.query<ResultSetHeader>(
      `DELETE FROM user_investment_details WHERE user_id = ?`,
      [userId]
    );

    if (
      result.affectedRows === 0 ||
      result2.affectedRows === 0 ||
      result3.affectedRows === 0
    ) {
      console.log("User not found");
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error deleting user", details: error.message }),
      { status: 500 }
    );
  }
}
