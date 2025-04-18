import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET(req:NextRequest) {
  try {
     //paginetion
     const { searchParams } = new URL(req.url);
     // console.log(searchParams);
     const page = parseInt(searchParams.get("page") || "1", 10);
     const limit = parseInt(searchParams.get("limit") || "10", 10);
     const offset = (page - 1) * limit;
 
     const query = `SELECT * FROM dummy_stocks_list LIMIT ? OFFSET ?`;
     const countQuery = `SELECT COUNT(*) as total FROM dummy_stocks_list`;
 
     const [data]: any = await pool.query(query, [limit, offset]);
     const [countResult]: any = await pool.query(countQuery);
 
     const total = countResult[0]?.total ?? 0;
     const totalPages = Math.ceil(total / limit);

    // const [result] = await pool.query(`SELECT * FROM dummy_stocks_list`);

    //response
    return NextResponse.json(
      { success: true, data: data, total, totalPages, currentPage: page },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding records",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
