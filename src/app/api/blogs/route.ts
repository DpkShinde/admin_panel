import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { title, content, author, category } = await req.json();

    const rawContent = JSON.parse(content).blocks[0].text

    console.log(rawContent)

    if (!title || !content || !author || !category) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const query = `INSERT INTO blogs (title, content, author, category) VALUES (?, ?, ?, ?)`;
    const values = [title, rawContent, author, category];

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Blog created successfully!",
          id: result.insertId,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to create blog." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, message: "Error creating blog", error },
      { status: 500 }
    );
  }
}
