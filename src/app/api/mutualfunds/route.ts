import {NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM mutual_funds_db.funds;");
    console.log(rows); // Logs the fetched data
    return NextResponse.json(rows, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching Funds:", error);
    return NextResponse.json(
      { error: "Error fetching Funds", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { funds, performance_summary, cagr_Summary, peer_comparison } = data;
    
    // Validate required fund fields
    if (!funds.name) {
      return NextResponse.json({ message: "Fund name is required" }, { status: 400 });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the main fund data
      const [result] = await connection.query(
        `INSERT INTO mutual_funds_db.funds 
         (name, launch_date, benchmark, riskometer, turnover_percent, type,
          return_since_launch, min_investment, expense_ratio, min_sip,
          min_cheques, min_withdrawal, exit_load, remark, fund_objective)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          funds.name,
          funds.launch_date || null,
          funds.benchmark || null,
          funds.riskometer || null,
          funds.turnover_percent || 0,
          funds.type || null,
          funds.return_since_launch || 0,
          funds.min_investment || 0,
          funds.expense_ratio || 0,
          funds.min_sip || 0,
          funds.min_cheques || 0,
          funds.min_withdrawal || 0,
          funds.exit_load || null,
          funds.remark || null,
          funds.fund_objective || null
        ]
      );
      
      // Get the newly inserted fund_id
      const fund_id = (result as any).insertId;
      
      // Insert performance summary records
      if (performance_summary && performance_summary.length > 0) {
        for (const perf of performance_summary) {
          await connection.query(
            `INSERT INTO mutual_funds_db.performance_summary 
             (fund_id, year, fund_returns, benchmark_returns, investor_returns, 
              nav, expense_ratio, sales_yoy_growth_cr)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fund_id,
              perf.year || null,
              perf.fund_returns || null,
              perf.benchmark_returns || null,
              perf.investor_returns || null,
              perf.nav || 0,
              perf.expense_ratio || 0,
              perf.sales_yoy_growth_cr || null
            ]
          );
        }
      }
      
      // Insert CAGR summary records
      if (cagr_Summary && cagr_Summary.length > 0) {
        for (const cagr of cagr_Summary) {
          await connection.query(
            `INSERT INTO mutual_funds_db.cagr_summary 
             (fund_id, period_years, fund_returns, benchmark_returns, investor_returns)
             VALUES (?, ?, ?, ?, ?)`,
            [
              fund_id,
              cagr.period_years || null,
              cagr.fund_returns || 0,
              cagr.benchmark_returns || 0,
              cagr.investor_returns || 0
            ]
          );
        }
      }
      
      // Insert peer comparison records
      if (peer_comparison && peer_comparison.length > 0) {
        for (const peer of peer_comparison) {
          await connection.query(
            `INSERT INTO mutual_funds_db.peer_comparison 
             (fund_id, peer_name, aum_cr, return_1y, return_3y, return_5y, rating)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              fund_id,
              peer.peer_name || null,
              peer.aum_cr || 0,
              peer.return_1y || 0,
              peer.return_3y || 0,
              peer.return_5y || 0,
              peer.rating || null
            ]
          );
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      return NextResponse.json(
        { 
          message: "Mutual fund created successfully", 
          fund_id: fund_id 
        },
        { status: 201 }
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
    console.error("Error creating mutual fund:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}