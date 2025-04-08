import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest, context: { params: { company_id: string } }) {
  try {
    const { company_id } = context.params;

    if (!company_id) {
      return NextResponse.json({ message: "Missing IPO company_id" }, { status: 400 });
    }

    // Type the result as RowDataPacket[]
    const [companyRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM IPO_Details_db.company WHERE company_id = ?`,
      [company_id]
    );

    const [ipoRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM IPO_Details_db.ipo_details WHERE company_id = ?`,
      [company_id]
    );

    const [financialRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM IPO_Details_db.financials WHERE company_id = ?`,
      [company_id]
    );

    const [keyRatios] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM IPO_Details_db.key_ratios WHERE company_id = ?`,
      [company_id]
    );

    const [subscriptionStatus] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM IPO_Details_db.subscription_status WHERE company_id = ?`,
      [company_id]
    );

    if (!companyRows.length) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        company: companyRows[0],
        ipo_details: ipoRows,
        financials: financialRows,
        ratios: keyRatios,
        subscription: subscriptionStatus
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching IPO details:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { company_id: string } }) {
  try {
    const { company_id } = context.params;

    if (!company_id) {
      return NextResponse.json({ message: "Missing IPO company_id" }, { status: 400 });
    }

    // Begin a transaction to ensure all deletions succeed or fail together
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if the company exists before attempting deletion
      const [checkCompany] = await connection.query<RowDataPacket[]>(
        `SELECT company_id FROM IPO_Details_db.company WHERE company_id = ?`,
        [company_id]
      );

      if (!checkCompany.length) {
        await connection.rollback();
        connection.release();
        return NextResponse.json({ message: "Company not found" }, { status: 404 });
      }

      // Delete related data in the correct order (respecting foreign key constraints)
      // Start with child tables
      await connection.query(
        `DELETE FROM IPO_Details_db.subscription_status WHERE company_id = ?`,
        [company_id]
      );

      await connection.query(
        `DELETE FROM IPO_Details_db.key_ratios WHERE company_id = ?`,
        [company_id]
      );

      await connection.query(
        `DELETE FROM IPO_Details_db.financials WHERE company_id = ?`,
        [company_id]
      );

      await connection.query(
        `DELETE FROM IPO_Details_db.ipo_details WHERE company_id = ?`,
        [company_id]
      );

      // Finally delete from the main company table
      await connection.query(
        `DELETE FROM IPO_Details_db.company WHERE company_id = ?`,
        [company_id]
      );

      // Commit the transaction
      await connection.commit();
      connection.release();

      return NextResponse.json(
        { message: "IPO details deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      // If anything fails, roll back the transaction
      await connection.rollback();
      connection.release();
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Error deleting IPO details:", error);
    return NextResponse.json(
      { message: "Failed to delete IPO details", error: String(error) },
      { status: 500 }
    );
  }
}