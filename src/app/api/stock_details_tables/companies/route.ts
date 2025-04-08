import { NextRequest, NextResponse } from "next/server";
import pool2 from "@/utils/db2";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    if (!data) {
      return NextResponse.json(
        { success: false, message: "No data provided." },
        { status: 400 }
      );
    }

    // Handle multiple records
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return NextResponse.json(
          { success: false, message: "Data array is empty." },
          { status: 400 }
        );
      }

      const values = data.map((stock: any) => [
        stock.name ?? null,
        stock.market_cap_category ?? null,
      ]);

      const query = `INSERT INTO companies (name, market_cap_category) VALUES ?`;
      const [result] = await pool2.query<ResultSetHeader>(query, [values]);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} compan${result.affectedRows > 1 ? "ies" : "y"} added successfully!`,
        },
        { status: 201 }
      );
    }

    // Handle single record
    if (typeof data === "object" && data !== null) {
      const { name, market_cap_category } = data;

      if (!name) {
        return NextResponse.json(
          { success: false, message: "Name is required." },
          { status: 400 }
        );
      }

      const query = `INSERT INTO companies (name, market_cap_category) VALUES (?, ?)`;
      const [result] = await pool2.query<ResultSetHeader>(query, [name, market_cap_category ?? null]);

      return NextResponse.json(
        { success: true, message: "Company added successfully!" },
        { status: 201 }
      );
    }

    //for invalid format
    return NextResponse.json(
      { success: false, message: "Invalid data format." },
      { status: 400 }
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
