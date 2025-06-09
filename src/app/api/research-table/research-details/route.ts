import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/utils/db";
import { fullStockResearchSchema } from "@/lib/schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  let connection; // Declare connection outside try-catch for finally block access
  try {
    const body = await req.json();
    // console.log("Received body:", body);

    // 1. Validate the entire request body against the master schema
    const validatedData = fullStockResearchSchema.parse(body);

    // Get a connection from the pool and start a transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const results: Record<string, any> = {};
    let stockId: number; // To store the ID of the existing stock

    // Helper function to prepare date strings for MySQL
    const toMySQLDate = (isoDateString: string | null | undefined): Date | null => {
      if (!isoDateString) return null;
      return new Date(isoDateString);
    };
    
    // --- Retrieve stock_id from existing research_stocks entry ---
    const stockSymbol = validatedData.stock.symbol;

    // Check if the stock symbol already exists in research_stocks
    const [existingStocks] = await connection.execute<RowDataPacket[]>(
      `SELECT research_stock_id FROM research_stocks WHERE symbol = ?`,
      [stockSymbol]
    );

    console.log(existingStocks);
    if (existingStocks.length > 0) {
      // Stock exists, use its ID
      stockId = existingStocks[0].research_stock_id;
      console.log(`Using existing stock_id: ${stockId} for symbol: ${stockSymbol}`);
      results.stock = { symbol: stockSymbol, research_stock_id: stockId };
    } else {
      // Stock does not exist, return an error
      await connection.rollback(); // Rollback immediately as we can't proceed
      return NextResponse.json(
        {
          message: `Stock with symbol '${stockSymbol}' not found in research_stocks. Please ensure the stock exists before adding research data.`,
        },
        { status: 404 } // Not Found
      );
    }
    

    // --- Insert into related tables, linking to the retrieved stockId ---
    // (No changes to the following sections, as they correctly use `stockId`)

    // research_stock_balance_sheet
    if (validatedData.balance_sheet) {
      const bsData = validatedData.balance_sheet;
      const [bsResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_balance_sheet (stock_id, fiscal_year, is_estimate, equity_capital, reserves, borrowings, long_term_borrowings, short_term_borrowings, lease_liabilities, other_borrowings, other_liabilities, trade_payables, advance_from_customers, other_liability_items, gross_block, accumulated_depreciation, fixed_assets, land, building, plant_machinery, equipments, furniture_n_fittings, vehicles, other_fixed_assets, cwip, investments, other_assets, inventories, trade_receivables, cash_equivalents, loans_n_advances, other_asset_items, total_assets)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId, // Use the determined stockId
          bsData.fiscal_year,
          bsData.is_estimate,
          bsData.equity_capital,
          bsData.reserves,
          bsData.borrowings,
          bsData.long_term_borrowings,
          bsData.short_term_borrowings,
          bsData.lease_liabilities,
          bsData.other_borrowings,
          bsData.other_liabilities,
          bsData.trade_payables,
          bsData.advance_from_customers,
          bsData.other_liability_items,
          bsData.gross_block,
          bsData.accumulated_depreciation,
          bsData.fixed_assets,
          bsData.land,
          bsData.building,
          bsData.plant_machinery,
          bsData.equipments,
          bsData.furniture_n_fittings,
          bsData.vehicles,
          bsData.other_fixed_assets,
          bsData.cwip,
          bsData.investments,
          bsData.other_assets,
          bsData.inventories,
          bsData.trade_receivables,
          bsData.cash_equivalents,
          bsData.loans_n_advances,
          bsData.other_asset_items,
          bsData.total_assets,
        ]
      );
      results.balance_sheet = {
        ...bsData,
        id: bsResult.insertId,
      };
    }

    // research_stock_details
    if (validatedData.details) {
      const detailsData = validatedData.details;
      const [detailsResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_details (stock_id, report_date, target_period, price_at_reco, target_price, potential_returns, recommendation, company_overview, investment_rationale, industry_overview, risks_concerns, analyst_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId,
          toMySQLDate(detailsData.report_date),
          detailsData.target_period,
          detailsData.price_at_reco,
          detailsData.target_price,
          detailsData.potential_returns,
          detailsData.recommendation,
          detailsData.company_overview,
          detailsData.investment_rationale,
          detailsData.industry_overview,
          detailsData.risks_concerns,
          detailsData.analyst_name,
        ]
      );
      results.details = {
        ...detailsData,
        stock_detail_id: detailsResult.insertId,
      };
    }

    // research_stock_exports_imports
    // if (validatedData.exports_imports) {
    //   const eiData = validatedData.exports_imports;
    //   const [eiResult] = await connection.execute<ResultSetHeader>(
    //     `INSERT INTO research_stock_exports_imports (stock_id, fiscal_year, exports_crores, imports_crores)
    //      VALUES (?, ?, ?, ?)`,
    //     [
    //       stockId,
    //       eiData.fiscal_year,
    //       eiData.exports_crores,
    //       eiData.imports_crores,
    //     ]
    //   );
    //   results.exports_imports = {
    //     ...eiData,
    //     export_import_id: eiResult.insertId,
    //   };
    // }

    // research_stock_financial_ratios
    if (validatedData.financial_ratios) {
      const frData = validatedData.financial_ratios;
      const [frResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_financial_ratios (stock_id, fiscal_year, period_type, roe, roce, current_ratio, peg_ratio, net_profit_margin, ev_ebitda, debt_to_equity, roa)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId,
          frData.fiscal_year,
          frData.period_type,
          frData.roe,
          frData.roce,
          frData.current_ratio,
          frData.peg_ratio,
          frData.net_profit_margin,
          frData.ev_ebitda,
          frData.debt_to_equity,
          frData.roa,
        ]
      );
      results.financial_ratios = {
        ...frData,
        ratio_id: frResult.insertId,
      };
    }

    // research_stock_income_statement
    if (validatedData.income_statement) {
      const isData = validatedData.income_statement;
      const [isResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_income_statement (stock_id, fiscal_year, is_estimate, interest_earned, other_income, total_income, total_expenditure, operating_profit, provisions_contigencies, profit_before_tax, tax, net_profit, gross_npa_percentage, gross_npa, net_npa, interest_cost, net_npa_percentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId,
          isData.fiscal_year,
          isData.is_estimate,
          isData.interest_earned,
          isData.other_income,
          isData.total_income,
          isData.total_expenditure,
          isData.operating_profit,
          isData.provisions_contigencies,
          isData.profit_before_tax,
          isData.tax,
          isData.net_profit,
          isData.gross_npa_percentage,
          isData.gross_npa,
          isData.net_npa,
          isData.interest_cost,
          isData.net_npa_percentage,
        ]
      );
      results.income_statement = {
        ...isData,
        income_id: isResult.insertId,
      };
    }

    // research_stock_key_metrics
    if (validatedData.key_metrics) {
      const kmData = validatedData.key_metrics;
      const [kmResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_key_metrics (stock_id, snapshot_date, cmp, pe_ratio, enterprise_value, market_cap, fifty_two_week_high, fifty_two_week_low)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId,
          toMySQLDate(kmData.snapshot_date),
          kmData.cmp,
          kmData.pe_ratio,
          kmData.enterprise_value,
          kmData.market_cap,
          kmData.fifty_two_week_high,
          kmData.fifty_two_week_low,
        ]
      );
      results.key_metrics = {
        ...kmData,
        metric_id: kmResult.insertId,
      };
    }

    // research_stock_performance_metrics
    if (validatedData.performance_metrics) {
      const pmData = validatedData.performance_metrics;
      const [pmResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_performance_metrics (stock_id, period_type, stock_return, benchmark_return)
         VALUES (?, ?, ?, ?)`,
        [
          stockId,
          pmData.period_type,
          pmData.stock_return,
          pmData.benchmark_return,
        ]
      );
      results.performance_metrics = {
        ...pmData,
        performance_id: pmResult.insertId,
      };
    }

    // research_stock_R_D_investments
    if (validatedData.rd_investments) {
      const rdiData = validatedData.rd_investments;
      const [rdiResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_R_D_investments (stock_id, fiscal_year, rd_investments_crores, rd_as_percent_of_sales)
         VALUES (?, ?, ?, ?)`,
        [
          stockId,
          rdiData.fiscal_year,
          rdiData.rd_investments_crores,
          rdiData.rd_as_percent_of_sales,
        ]
      );
      results.rd_investments = {
        ...rdiData,
        rd_id: rdiResult.insertId,
      };
    }

    // research_stock_revenue_mix
    if (validatedData.revenue_mix) {
      const rmData = validatedData.revenue_mix;
      const [rmResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_revenue_mix (stock_id, fiscal_year, mix_type, category, percentage)
         VALUES (?, ?, ?, ?, ?)`,
        [
          stockId,
          rmData.fiscal_year,
          rmData.mix_type,
          rmData.category,
          rmData.percentage,
        ]
      );
      results.revenue_mix = {
        ...rmData,
        revenue_mix_id: rmResult.insertId,
      };
    }

    // research_stock_shareholding_pattern
    if (validatedData.shareholding_pattern) {
      const shpData = validatedData.shareholding_pattern;
      const [shpResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_shareholding_pattern (stock_id, period_month, period_year, promoters, share_holding_pledge, fii, public, total_dil)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockId,
          shpData.period_month,
          shpData.period_year,
          shpData.promoters,
          shpData.share_holding_pledge,
          shpData.fii,
          shpData.public,
          shpData.total_dil,
        ]
      );
      results.shareholding_pattern = {
        ...shpData,
        shareholding_id: shpResult.insertId,
      };
    }

    // Commit the transaction if all inserts were successful
    await connection.commit();

    return NextResponse.json(
      {
        message: "Full stock research data created/updated successfully",
        data: results, // Returns the IDs and inserted data for all parts
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback the transaction if any error occurred
    if (connection) {
      console.warn("Transaction rolled back due to error:", error);
      await connection.rollback();
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed for stock research data",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error creating full stock research data:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error while creating stock research data",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}