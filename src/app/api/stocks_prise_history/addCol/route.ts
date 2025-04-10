import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
    const { colName } = await req.json();

    if (!colName || typeof colName !== "string") {
      return NextResponse.json(
        {
          error: true,
          message: "Invalid or missing column name",
        },
        { status: 400 }
      );
    }

    // Replace with your actual table name
    const tableName = "stock_prices";

    const query = `ALTER TABLE \`${tableName}\` ADD \`${colName}\` DECIMAL(10,2)`;

    await pool.query(query);

    return NextResponse.json({
      success: true,
      message: `Successfully added column "${colName}"`,
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json(
      {
        error: true,
        message: "An error occurred while adding the column",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
