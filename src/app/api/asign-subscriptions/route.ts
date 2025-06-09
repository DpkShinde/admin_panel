import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      plan_id,
      billing_cycle,
      payment_method,
      card_num,
      card_expiry_date,
      upi_id,
      price_payed,
      payment_date_time,
      initail_date,
      ending_date,
      //for orders table
      order_name,
      order_date,
      Amount,
      Status,
    } = await req.json();
    console.log(
      email,
      plan_id,
      billing_cycle,
      payment_method,
      card_num,
      card_expiry_date,
      upi_id,
      price_payed,
      payment_date_time,
      initail_date,
      ending_date,
      //for orders table
      order_name,
      order_date,
      Amount,
      Status
    );

    if (!email || !plan_id || !payment_method) {
      return NextResponse.json(
        {
          error: "Missing required fields: email, plan_id, or payment_method.",
        },
        { status: 400 }
      );
    }

    //query
    const [userRows] = await pool.query<any[]>(
      `SELECT user_id FROM userstable WHERE email = ?`,
      [email]
    );

    //validation
    if (userRows.length === 0) {
      return NextResponse.json(
        {
          error: `No user found with email: ${email}`,
        },
        { status: 404 }
      );
    }

    const user_id = userRows[0].user_id;

    //query
    const [paymentResult] = await pool.query(
      `INSERT INTO users_payment_details (
        user_id, email, plan_id, billing_cycle, payment_method,
        card_num, card_expiry_date, upi_id,
        price_payed, payment_date_time,initail_date, ending_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        email,
        plan_id,
        billing_cycle,
        payment_method,
        card_num || "",
        card_expiry_date || null,
        upi_id || null,
        price_payed || null,
        payment_date_time,
        initail_date || null,
        ending_date,
      ]
    );

    // Insert into orders table
    const [orderResult] = await pool.query(
      `INSERT INTO orders(order_name, order_date, Amount, Status, user_id) VALUES(?, ?, ?, ?, ?)`,
      [order_name, order_date, Amount, Status, user_id]
    );

    //response
    return NextResponse.json(
      {
        message: `Successfully Added subscription to ${email}👤`,
        user_id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error inserting records:", error);
    return NextResponse.json(
      { error: "Something went wrong while inserting data." },
      { status: 500 }
    );
  }
}
