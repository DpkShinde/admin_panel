import pool from "@/utils/db";
import { NextRequest } from "next/server";
import { ResultSetHeader } from "mysql2";

// Edit User
export async function PUT(req: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number(params.userId);
    const {username, first_name, last_name, email, phone_number} = await req.json();

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user_details SET 
        username = ?, first_name = ?, last_name = ?, email = ?, phone_number = ? WHERE user_id = ?`,
      [username, first_name, last_name, email, phone_number, userId]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "User not found or no changes made" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Error updating user", details: error.message }), { status: 500 });
  }
}

// Delete User
export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM user_details WHERE user_id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      console.log("User not found");
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Error deleting user", details: error.message }), { status: 500 });
  }
}
