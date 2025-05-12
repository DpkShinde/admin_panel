import pool from "@/utils/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const query = `
      SELECT
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
      JOIN
        userstable u
      ON 
        ud.user_id = u.user_id
      WHERE 
        u.user_id IS NOT NULL
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total
      FROM user_details ud
      JOIN userstable u ON ud.user_id = u.user_id
      WHERE u.user_id IS NOT NULL`;

    const [data]: [RowDataPacket[], any[]] = await pool.query(query, [
      limit,
      offset,
    ]);
    const [countResult]: [RowDataPacket[], any[]] = await pool.query(
      countQuery
    );

    const total = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      total,
      totalPages,
      currentPage: page,
    });

    // const [users] = await pool.query<RowDataPacket[]>(
    //   `SELECT
    //       ud.user_id,
    //       ud.username,
    //       ud.first_name,
    //       ud.last_name,
    //       ud.email,
    //       ud.phone_number,
    //       ud.gender,
    //       ud.dob,
    //       ud.age_group,
    //       ud.country,
    //       ud.city,
    //       ud.state,
    //       ud.pincode,
    //       ud.occupation,
    //       ud.industry,
    //       ud.income,
    //       ud.address,
    //       ud.created_date,
    //       ud.updated_date,
    //       u.creation_date as registration_date
    //   FROM
    //     user_details ud
    //   join
    //     userstable u
    //   on
    //     ud.user_id = u.user_id
    //   where
    //     u.user_id IS NOT NULL`
    // );

    // return new Response(JSON.stringify(users), {
    //   status: 200,
    //   headers: { "Content-Type": "application/json" },
    // });
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
