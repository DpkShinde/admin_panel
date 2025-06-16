import pool from "@/utils/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getServerSession } from "next-auth";
import authOptions from "@/../auth.config";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    //checking user is authorize or not
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.role !== "superadmin") {
      return NextResponse.json(
        {
          error: "Forbidden - Only superadmin can update Plans",
        },
        { status: 403 }
      );
    }

    const {
      plan_id,
      plan,
      halfyearly_price,
      annually_price,
      features,
      additional_benefits,
    } = await req.json();

    if (
      !plan_id ||
      !plan ||
      !halfyearly_price ||
      !annually_price ||
      !features ||
      !additional_benefits
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE defaultdb.subscription_plan SET plan = ?, halfyearly_price = ?, annually_price = ?, features = ?, additional_benefits = ? WHERE plan_id = ?`,
      [
        plan,
        halfyearly_price,
        annually_price,
        features,
        additional_benefits,
        plan_id,
      ]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Plan updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error updating plan", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { plan_id } = await req.json();

    //checking user is authorize or not
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.role !== "superadmin") {
      return NextResponse.json(
        {
          error: "Forbidden - Only superadmin can Delete Plans",
        },
        { status: 403 }
      );
    }

    if (!plan_id) {
      return new Response(JSON.stringify({ error: "Missing plan_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM subscription_plan WHERE plan_id = ?`,
      [plan_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Plan deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error deleting plan", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
