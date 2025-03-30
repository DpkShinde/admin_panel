import pool from "@/utils/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const [plans] = await pool.query<RowDataPacket[]>(
      `SELECT plan_id, plan, halfyearly_price, annually_price, features, additional_benefits, created_date FROM defaultdb.subscription_plan;`
    );

    return new Response(JSON.stringify(plans), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error fetching plans", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { plan, halfyearly_price, annually_price, features, additional_benefits } = await req.json();

    if (!plan || !halfyearly_price || !annually_price || !features || !additional_benefits) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO defaultdb.subscription_plan (plan, halfyearly_price, annually_price, features, additional_benefits, created_date) VALUES (?, ?, ?, ?, ?, NOW())`,
      [plan, halfyearly_price, annually_price, features, additional_benefits]
    );

    return new Response(
      JSON.stringify({ message: "Plan added successfully", plan_id: result.insertId }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Error adding plan", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}