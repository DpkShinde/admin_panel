import { etfsDirectSchema } from "@/lib/etfsDirect.schema";
import pool from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const etfId = Number(params.id);
  if (!etfId) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid etf id",
      },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM etfsDirect WHERE id = ?`,
      [etfId]
    );

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
        success: true,
        message: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

//For put request
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const etfId = Number(params.id);

    if (!etfId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid etf id",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();
    //parsed from zod validation
    const parsed = etfsDirectSchema.safeParse(body);

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

    const updateQuery = `UPDATE etfsDirect SET fund_name = ?, nav = ?, aum_crore = ?, sip_amount = ?, 
          expense_ratio = ?, return_1yr = ?, return_3yr = ?, return_5yr = ?
      WHERE id = ?`;

    const [result] = await pool.query(updateQuery, [
      fund_name,
      nav,
      aum_crore,
      sip_amount,
      expense_ratio,
      return_1yr,
      return_3yr,
      return_5yr,
      etfId,
    ]);

    //response
    return NextResponse.json(
      {
        success: true,
        message: `etfsDirect fund updated successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        message: `Internal Server error`,
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE({ params }: { params: { id: string } }) {
  try {
    const etfId = Number(params.id);

    if (!etfId) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid etfsDirect id`,
        },
        { status: 400 }
      );
    }

    const [result]: any[] = await pool.query(
      `DELETE FROM etfsDirect WHERE id = ?`,
      [etfId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Fund not found or already deleted",
        },
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
        message: `Internal server error`,
        details: error.message,
      },
      { status: 500 }
    );
  }
}
