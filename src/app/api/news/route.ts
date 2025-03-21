import { NextResponse } from "next/server";
import pool from "@/utils/db";

export async function POST(req: Request) {
  try {
    const { title, content, image_url } = await req.json();
    await pool.query(
      "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)",
      [title, content, image_url]
    );

    return NextResponse.json(
      { message: "News created successfully!" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error creating news", details: error.message },
      { status: 500 }
    );
  }
}
