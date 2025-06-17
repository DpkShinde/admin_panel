import { NextResponse, NextRequest } from "next/server";
import pool from "@/utils/db";
import { fundSchema } from "@/lib/fund.schema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fundId = Number(params.id);

    if (!fundId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Id",
        },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(`SELECT * FROM etfs WHERER id = ?`, [
      fundId,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Fund not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fundId = params.id;

    if (!fundId) {
      return NextResponse.json(
        {
          success: false,
          message: "Fund not found",
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    //parsed from zod validation
    const parsed = fundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      fund_name,
      nav,
      aum_crore,
      sip_amount,
      expense_ratio,
      return_1yr,
      return_3yr,
      return_5yr,
    } = parsed.data;

    const updateQuery = `UPDATE etfs SET fund_name = ?, nav = ?, aum_crore = ?, sip_amount = ?, expense_ratio = ?, 
          return_1yr = ?, return_3yr = ?, return_5yr = ? WHERE id = ?`;

    const [result] = await pool.query(updateQuery, [
      fund_name,
      nav,
      aum_crore,
      sip_amount,
      expense_ratio,
      return_1yr,
      return_3yr,
      return_5yr,
      fundId,
    ]);

    //response
    return NextResponse.json(
      {
        success: true,
        message: `fund updated successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        message: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fundId = params.id;

    if (!fundId) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid id`,
        },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(`DELETE FROM etfs WHERE id = ?`, [
      fundId,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Fund not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Fund deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
