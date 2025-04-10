import { NextRequest, NextResponse } from "next/server";
import pool2 from "@/utils/db2";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    if (!data) {
      return NextResponse.json(
        { success: false, message: "No data provided." },
        { status: 400 }
      );
    }

    // Helper to insert into all related tables
    const insertRelatedTables = async (companyId: number, record: any) => {
      const {
        cash_flow,
        balance_sheet,
        annual_profit_loss,
        financial_metrics,
        financial_ratios,
        peer_analysis,
        peer_valuations,
        quarterly_financials,
        valuation_inputs,
      } = record;

      // Handling cash_flow with corrected field names
      if (cash_flow) {
        await pool2.query(
          `INSERT INTO cash_flow (company_id, fiscal_year, cash_from_operations, cash_from_investing, cash_from_financing, net_cash_flow) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            cash_flow.fiscal_year,
            cash_flow.cash_from_operations,
            cash_flow.cash_from_investing,
            cash_flow.cash_from_financing,
            cash_flow.net_cash_flow,
          ]
        );
      }

      // Balance sheet
      if (balance_sheet) {
        await pool2.query(
          `INSERT INTO balance_sheet (company_id, fiscal_year, equity_capital, reserves, borrowings, other_liabilities, total_liabilities, fixed_assets, cwip, investments, other_assets, total_assets) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            balance_sheet.fiscal_year,
            balance_sheet.equity_capital,
            balance_sheet.reserves,
            balance_sheet.borrowings,
            balance_sheet.other_liabilities,
            balance_sheet.total_liabilities,
            balance_sheet.fixed_assets,
            balance_sheet.cwip,
            balance_sheet.investments,
            balance_sheet.other_assets,
            balance_sheet.total_assets,
          ]
        );
      }

      // Annual profit loss with revenue included
      if (annual_profit_loss) {
        await pool2.query(
          `INSERT INTO annual_profit_loss (company_id, fiscal_year, sales_cr, expenses, operating_profit, opm_percent, other_income, interest, depreciation, profit_before_tax, tax_percent, net_profit, eps, dividend_payout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            annual_profit_loss.fiscal_year,
            annual_profit_loss.sales_cr,
            annual_profit_loss.expenses,
            annual_profit_loss.operating_profit,
            annual_profit_loss.opm_percent,
            annual_profit_loss.other_income,
            annual_profit_loss.interest,
            annual_profit_loss.depreciation,
            annual_profit_loss.profit_before_tax,
            annual_profit_loss.tax_percent,
            annual_profit_loss.net_profit,
            annual_profit_loss.eps,
            annual_profit_loss.dividend_payout,
          ]
        );
      }

      // Financial metrics
      if (financial_metrics) {
        await pool2.query(
          `INSERT INTO financial_metrics (company_id, metric_type, three_year, five_year, ten_year, ttm) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            financial_metrics.metric_type,
            financial_metrics.three_year,
            financial_metrics.five_year,
            financial_metrics.ten_year,
            financial_metrics.ttm,
          ]
        );
      }

      // Financial ratios
      if (financial_ratios) {
        await pool2.query(
          `INSERT INTO financial_ratios (company_id,fiscal_year, debtor_days, inventory_days, days_payable, cash_conversion_cycle, working_capital_days, roce_percent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            financial_ratios.fiscal_year,
            financial_ratios.debtor_days,
            financial_ratios.inventory_days,
            financial_ratios.days_payable,
            financial_ratios.cash_conversion_cycle,
            financial_ratios.working_capital_days,
            financial_ratios.roce_percent,
          ]
        );
      }

      // Peer analysis
      if (peer_analysis) {
        await pool2.query(
          `INSERT INTO peer_analysis (company_id, cmp, change_percent, net_sales_cr, latest_eps, net_profit_margin) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            peer_analysis.cmp,
            peer_analysis.change_percent,
            peer_analysis.net_sales_cr,
            peer_analysis.latest_eps,
            peer_analysis.net_profit_margin,
          ]
        );
      }

      // Peer valuations
      if (peer_valuations) {
        await pool2.query(
          `INSERT INTO peer_valuations (company_id, valuation, pe_ratio, ev_ebitda, peg_ratio) VALUES (?, ?, ?, ?, ?)`,
          [
            companyId,
            peer_valuations.valuation,
            peer_valuations.pe_ratio,
            peer_valuations.ev_ebitda,
            peer_valuations.peg_ratio,
          ]
        );
      }

      // Valuation inputs
      if (valuation_inputs) {
        await pool2.query(
          `INSERT INTO valuation_inputs (company_id, eps_growth_rate, expected_return_rate, future_pe, dps, mos_percent, base_eps, mrp, dp, valuation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            valuation_inputs.eps_growth_rate,
            valuation_inputs.expected_return_rate,
            valuation_inputs.future_pe,
            valuation_inputs.dps,
            valuation_inputs.mos_percent,
            valuation_inputs.base_eps,
            valuation_inputs.mrp,
            valuation_inputs.dp,
            valuation_inputs.valuation_date,
          ]
        );
      }

      // Handle quarterly financials - convert to array if it's a single object
      const quarterlyData = Array.isArray(quarterly_financials)
        ? quarterly_financials
        : [quarterly_financials];

      if (quarterly_financials && quarterlyData.length > 0) {
        for (const q of quarterlyData) {
          if (
            !q ||
            Object.values(q).every((val) => val === null || val === "")
          ) {
            continue; // Skip empty quarterly records
          }

          await pool2.query(
            `INSERT INTO quarterly_financials (
              company_id, quarter_id, year, sales_cr, expenses, operating_profit, 
              opm_percent, other_income, interest, depreciation, 
              profit_before_tax, tax_percent, net_profit, eps, quarterly_financialscol
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              companyId,
              q.quarter_id,
              q.year,
              q.sales_cr,
              q.expenses,
              q.operating_profit,
              q.opm_percent,
              q.other_income,
              q.interest,
              q.depreciation,
              q.profit_before_tax,
              q.tax_percent,
              q.net_profit,
              q.eps,
              q.quarterly_financialscol,
            ]
          );
        }
      }
    };

    // MULTIPLE RECORDS (from Excel)
    if (Array.isArray(data)) {
      const results = [];

      for (const record of data) {
        const { name, market_cap_category } = record;

        if (!name) {
          results.push({
            success: false,
            message: "Skipped record: Company name is required.",
          });
          continue;
        }

        try {
          const [result] = await pool2.query<ResultSetHeader>(
            `INSERT INTO companies (name, market_cap_category) VALUES (?, ?)`,
            [name, market_cap_category ?? null]
          );
          await insertRelatedTables(result.insertId, record);

          results.push({
            success: true,
            message: `Company "${name}" added successfully.`,
            id: result.insertId,
          });
        } catch (err: any) {
          results.push({
            success: false,
            message: `Failed to add company "${name}": ${err.message}`,
          });
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: `Processed ${data.length} companies.`,
          results,
        },
        { status: 201 }
      );
    }

    // SINGLE RECORD
    if (typeof data === "object") {
      const { name, market_cap_category } = data;

      if (!name) {
        return NextResponse.json(
          { success: false, message: "Company name is required." },
          { status: 400 }
        );
      }

      try {
        const [result] = await pool2.query<ResultSetHeader>(
          `INSERT INTO companies (name, market_cap_category) VALUES (?, ?)`,
          [name, market_cap_category ?? null]
        );

        await insertRelatedTables(result.insertId, data);

        return NextResponse.json(
          {
            success: true,
            message: "Company and related data inserted successfully!",
            id: result.insertId,
          },
          { status: 201 }
        );
      } catch (err: any) {
        // Database-specific error handling
        if (err.code === "ER_DUP_ENTRY") {
          return NextResponse.json(
            {
              success: false,
              message: "A company with this name already exists.",
            },
            { status: 409 }
          );
        }

        throw err; // Re-throw for general error handler
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid data format." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Insert Error:", error);

    // Provide more specific error messages for common issues
    let errorMessage = "Server error.";
    let statusCode = 500;

    if (error.code === "ER_NO_SUCH_TABLE") {
      errorMessage = "Database table does not exist.";
    } else if (error.code === "ER_BAD_FIELD_ERROR") {
      errorMessage = "Invalid field in database query.";
    } else if (error.code === "ECONNREFUSED") {
      errorMessage = "Database connection failed.";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        details: error.message,
        code: error.code,
      },
      { status: statusCode }
    );
  }
}
