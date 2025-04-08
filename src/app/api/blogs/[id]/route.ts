import { NextResponse } from "next/server";
import pool from "@/utils/db";

// GET request to fetch blog details by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = Number(params.id);
    if (!blogId) {
      return NextResponse.json(
        { message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query("SELECT * FROM blogs WHERE id = ?", [
      blogId,
    ]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = Number(params.id);
    if (!blogId) {
      return NextResponse.json(
        { message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const { title, content, author, category } = await req.json();
    
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    await pool.query(
      `UPDATE blogs SET title = ?, content = ?, author = ?, category = ?, created_at = ? WHERE id = ?`,
      [title, content, author, category, currentTimestamp, blogId]
    );

    const [updatedBlog] = await pool.query(`SELECT * FROM blogs WHERE id = ?`, [blogId]);

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

