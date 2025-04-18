import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM mutual_funds_db.funds;");
    // console.log(rows); // Logs the fetched data
    return NextResponse.json(rows, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching Funds:", error);
    return NextResponse.json(
      {
        error: "Error fetching Funds",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const insertFund = async (fundObj: any) => {
      const {
        fund_overview,
        performance_summary,
        cagr_summary,
        peer_comparison,
      } = fundObj;
      console.log("this is finding funds", fundObj);
      // console.log(cagr_summary, Peer_Comparison);
      // Validate required fund fields
      if (!fund_overview?.name) throw new Error("Fund name is required");

      const formattedDate = (isoDateString: string) => {
        return isoDateString?.split("T")[0];
      };

      const newLaunch_date = formattedDate(fund_overview.launch_date);

      // Insert the main fund data
      const [result] = await connection.query(
        `INSERT INTO mutual_funds_db.funds 
         (name, launch_date, benchmark, riskometer, turnover_percent, type,
          return_since_launch, min_investment, expense_ratio, min_sip,
          min_cheques, min_withdrawal, exit_load, remark, fund_objective)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fund_overview.name,
          newLaunch_date || null,
          fund_overview.benchmark || null,
          fund_overview.riskometer || null,
          fund_overview.turnover_percent || 0,
          fund_overview.type || null,
          fund_overview.return_since_launch || 0,
          fund_overview.min_investment || 0,
          fund_overview.expense_ratio || 0,
          fund_overview.min_sip || 0,
          fund_overview.min_cheques || 0,
          fund_overview.min_withdrawal || 0,
          fund_overview.exit_load || null,
          fund_overview.remark || null,
          fund_overview.fund_objective || null,
        ]
      );

      const fund_id = (result as any).insertId;

      // Performance Summary
      if (performance_summary) {
        for (const perf of performance_summary) {
          await connection.query(
            `INSERT INTO mutual_funds_db.performance_summary
             (fund_id, year, nav, sales_yoy_growth_cr, fund_returns, benchmark_returns, investor_returns, expense_ratio)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fund_id,
              perf.year,
              perf.nav,
              perf.sales_yoy_growth_cr,
              perf.fund_returns,
              perf.benchmark_returns,
              perf.investor_returns,
              perf.expense_ratio,
            ]
          );
        }
      }

      // CAGR Summary
      if (cagr_summary) {
        for (const cagr of cagr_summary) {
          await connection.query(
            `INSERT INTO mutual_funds_db.cagr_summary 
             (fund_id, period_years, fund_returns, benchmark_returns, investor_returns)
             VALUES (?, ?, ?, ?, ?)`,
            [
              fund_id,
              cagr.period_years || null,
              cagr.fund_returns || 0,
              cagr.benchmark_returns || 0,
              cagr.investor_returns || 0,
            ]
          );
        }
      }

      // Peer Comparison
      if (peer_comparison) {
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
              peer.rating || null,
            ]
          );
        }
      }

      return fund_id;
    };

    // Check if single object or array
    const insertedFundIds: number[] = [];

    if (Array.isArray(data)) {
      for (const fundObj of data) {
        const fundId = await insertFund(fundObj);
        insertedFundIds.push(fundId);
      }
    } else {
      const fundId = await insertFund(data);
      insertedFundIds.push(fundId);
    }

    await connection.commit();
    connection.release();

    return NextResponse.json(
      {
        message: "Mutual fund(s) created successfully",
        fund_ids: insertedFundIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating mutual fund:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
