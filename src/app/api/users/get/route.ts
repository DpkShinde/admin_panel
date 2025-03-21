import pool from "@/utils/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM user_details WHERE user_id IS NOT NULL"
    );

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error fetching users", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
