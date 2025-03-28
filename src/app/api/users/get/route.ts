import pool from "@/utils/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT
          ud.user_id,
          ud.username,
          ud.first_name,
          ud.last_name,
          ud.email,
          ud.phone_number,
          ud.gender,
          ud.dob,
          ud.age_group,
          ud.country,
          ud.city,
          ud.state,
          ud.pincode,
          ud.occupation,
          ud.industry,
          ud.income,
          ud.address,
          ud.created_date,
          ud.updated_date,
          u.creation_date as registration_date
      FROM 
        user_details ud
      join
        userstable u
      on 
        ud.user_id = u.user_id
      where 
        u.user_id IS NOT NULL`
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
