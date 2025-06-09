import { NextRequest, NextResponse } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.company_id || !data.title) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Received data:", data);

    const newResult = await pool4.query(
      `Insert into company_articles (company_id, image_url, title, MainContent, created_date) values (?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.image_url,
        data.title,
        data.MainContent,
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    return NextResponse.json(
      { success: true, message: "Successfully add record", newResult },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
