import { NextResponse } from "next/server";
import pool from "@/utils/db";

// GET: Fetch a single news article by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = Number(params.id);
    if (!newsId) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query("SELECT * FROM news WHERE id = ?", [
      newsId,
    ]);

    if (!rows.length) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error fetching news", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a news article
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = Number(params.id);
    if (!newsId) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const { title, content, image_url, created_at } = await req.json();
    // console.log(created_at);
    await pool.query(
      "UPDATE news SET title = ?, content = ?, image_url = ?, created_at = ? WHERE id = ?",
      [title, content, image_url, created_at, newsId]
    );

    return NextResponse.json(
      { message: "News updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error updating news", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a news article
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = Number(params.id);
    if (!newsId) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    await pool.query("DELETE FROM news WHERE id = ?", [newsId]);
    return NextResponse.json(
      { message: "News deleted successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error deleting news", details: error.message },
      { status: 500 }
    );
  }
}
