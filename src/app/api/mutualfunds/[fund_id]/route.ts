import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest, context: { params: { fund_id: number } }) {
  try {
    const { fund_id } = context.params;

    if (!fund_id) {
      return NextResponse.json({ message: "Missing Mutual funds fund_id" }, { status: 400 });
    }

    // Type the result as RowDataPacket[]
    const [fundRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM mutual_funds_db.funds WHERE fund_id = ?`,
      [fund_id]
    );

    
    const [performance_summary] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM mutual_funds_db.performance_summary WHERE fund_id = ?`,
      [fund_id]
    );

    const [cagr_Summary] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM mutual_funds_db.cagr_summary WHERE fund_id = ?`,
      [fund_id]
    );

    const [peersCompare] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM mutual_funds_db.peer_comparison WHERE fund_id = ?`,
      [fund_id]
    );

    if (!fundRows.length) {
      return NextResponse.json({ message: "Mtual Fund not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        funds: fundRows[0],
        performance_summary: performance_summary,
        cagr_Summary: cagr_Summary,
        peer_comparison: peersCompare
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching IPO details:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { fund_id: number } }) {
  try {
    const { fund_id } = context.params;
    
    if (!fund_id) {
      return NextResponse.json({ message: "Missing fund_id" }, { status: 400 });
    }
    
    const data = await request.json();
    const { funds, performance_summary, cagr_Summary, peer_comparison } = data;
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update the main fund data
      await connection.query(
        `UPDATE mutual_funds_db.funds SET 
         name = ?, launch_date = ?, benchmark = ?, riskometer = ?, 
         turnover_percent = ?, type = ?, return_since_launch = ?, 
         min_investment = ?, expense_ratio = ?, min_sip = ?, 
         min_cheques = ?, min_withdrawal = ?, exit_load = ?, 
         remark = ?, fund_objective = ?
         WHERE fund_id = ?`,
        [
          funds.name,
          funds.launch_date,
          funds.benchmark,
          funds.riskometer,
          funds.turnover_percent,
          funds.type,
          funds.return_since_launch,
          funds.min_investment,
          funds.expense_ratio,
          funds.min_sip,
          funds.min_cheques,
          funds.min_withdrawal,
          funds.exit_load,
          funds.remark,
          funds.fund_objective,
          fund_id
        ]
      );
      
      // Delete existing performance summary records for this fund_id
      await connection.query(
        `DELETE FROM mutual_funds_db.performance_summary WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Insert new performance summary records
      if (performance_summary && performance_summary.length > 0) {
        for (const perf of performance_summary) {
          await connection.query(
            `INSERT INTO mutual_funds_db.performance_summary 
             (fund_id, year, fund_returns, benchmark_returns, investor_returns, 
              nav, expense_ratio, sales_yoy_growth_cr)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fund_id,
              perf.year,
              perf.fund_returns,
              perf.benchmark_returns,
              perf.investor_returns,
              perf.nav,
              perf.expense_ratio,
              perf.sales_yoy_growth_cr
            ]
          );
        }
      }
      
      // Delete existing CAGR summary records for this fund_id
      await connection.query(
        `DELETE FROM mutual_funds_db.cagr_summary WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Insert new CAGR summary records
      if (cagr_Summary && cagr_Summary.length > 0) {
        for (const cagr of cagr_Summary) {
          await connection.query(
            `INSERT INTO mutual_funds_db.cagr_summary 
             (fund_id, period_years, fund_returns, benchmark_returns, investor_returns)
             VALUES (?, ?, ?, ?, ?)`,
            [
              fund_id,
              cagr.period_years,
              cagr.fund_returns,
              cagr.benchmark_returns,
              cagr.investor_returns
            ]
          );
        }
      }
      
      // Delete existing peer comparison records for this fund_id
      await connection.query(
        `DELETE FROM mutual_funds_db.peer_comparison WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Insert new peer comparison records
      if (peer_comparison && peer_comparison.length > 0) {
        for (const peer of peer_comparison) {
          await connection.query(
            `INSERT INTO mutual_funds_db.peer_comparison 
             (fund_id, peer_name, aum_cr, return_1y, return_3y, return_5y, rating)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              fund_id,
              peer.peer_name,
              peer.aum_cr,
              peer.return_1y,
              peer.return_3y,
              peer.return_5y,
              peer.rating
            ]
          );
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      return NextResponse.json(
        { message: "Mutual fund updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      console.error("Error in transaction:", error);
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    console.error("Error updating mutual fund:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { fund_id: number } }) {
  try {
    const { fund_id } = context.params;
    
    if (!fund_id) {
      return NextResponse.json({ message: "Missing fund_id" }, { status: 400 });
    }
    
    // Start a transaction to ensure data integrity
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if the fund exists before attempting deletion
      const [fundRows] = await connection.query<RowDataPacket[]>(
        `SELECT fund_id FROM mutual_funds_db.funds WHERE fund_id = ?`,
        [fund_id]
      );
      
      if (!fundRows.length) {
        await connection.rollback();
        connection.release();
        return NextResponse.json({ message: "Mutual Fund not found" }, { status: 404 });
      }
      
      // Delete related records from performance_summary table
      await connection.query(
        `DELETE FROM mutual_funds_db.performance_summary WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Delete related records from cagr_summary table
      await connection.query(
        `DELETE FROM mutual_funds_db.cagr_summary WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Delete related records from peer_comparison table
      await connection.query(
        `DELETE FROM mutual_funds_db.peer_comparison WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Finally, delete the main fund record
      await connection.query(
        `DELETE FROM mutual_funds_db.funds WHERE fund_id = ?`,
        [fund_id]
      );
      
      // Commit the transaction
      await connection.commit();
      
      return NextResponse.json(
        { message: "Mutual fund and related data successfully deleted" },
        { status: 200 }
      );
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      console.error("Error in delete transaction:", error);
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting mutual fund:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}