import { NextRequest, NextResponse } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result: any[] = await pool4.query(
      `SELECT * FROM company_articles WHERE id = ?`,
      [id]
    );

    if (result[0].length === 0) {
      return NextResponse.json({ message: "No record found" }, { status: 404 });
    }

    return NextResponse.json(result[0][0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();

    if (!data.company_id || !data.title) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedResult: any[] = await pool4.query(
      `UPDATE company_articles SET company_id = ?, image_url = ?, title = ?, MainContent = ?,created_date = ?, updated_date = ? WHERE id = ?`,
      [
        data.company_id,
        data.image_url,
        data.title,
        data.MainContent,
        data.created_date,
        new Date().toISOString().slice(0, 19).replace("T", " "),
        id,
      ]
    );

    if (updatedResult[0].affectedRows === 0) {
      return NextResponse.json(
        { message: "No record found to update" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Successfully updated record" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
