import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/utils/db";
import { fullStockResearchSchema } from "@/lib/schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function PUT(req: NextRequest) {
  let connection; // Declare connection outside try-catch for finally block access
  try {
    const body = await req.json();
    // console.log("Received body for PUT:", body);

    // 1. Validate the entire request body against the master schema
    const validatedData = fullStockResearchSchema.parse(body);

    // Get a connection from the pool and start a transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const results: Record<string, any> = {};
    let stockId: number; // To store the ID of the existing stock

    // Helper function to prepare date strings for MySQL
    const toMySQLDate = (
      isoDateString: string | null | undefined
    ): Date | null => {
      if (!isoDateString) return null;
      return new Date(isoDateString);
    };

    // --- Retrieve stock_id from existing research_stocks entry using the symbol ---
    const stockSymbol = validatedData.stock.symbol;

    // Check if the stock symbol already exists in research_stocks
    const [existingStocks] = await connection.execute<RowDataPacket[]>(
      `SELECT research_stock_id FROM research_stocks WHERE symbol = ?`,
      [stockSymbol]
    );

    if (existingStocks.length > 0) {
      // Stock exists, use its ID for updates
      stockId = existingStocks[0].research_stock_id;
      console.log(
        `Using existing stock_id: ${stockId} for symbol: ${stockSymbol} for update.`
      );
      results.stock = { symbol: stockSymbol, research_stock_id: stockId };
    } else {
      // Stock not found, return an error as we cannot update a non-existent stock
      await connection.rollback();
      return NextResponse.json(
        {
          message: `Stock with symbol '${stockSymbol}' not found in research_stocks. Cannot update.`,
        },
        { status: 404 } // Not Found
      );
    }

    // --- Update related tables, linking to the retrieved stockId ---

    // Example of a table that might be updated with ON DUPLICATE KEY UPDATE (e.g., balance_sheet by fiscal_year)
    // For `research_stock_balance_sheet`: We'll assume `stock_id` and `fiscal_year` together form a unique key
    // You'd need to ensure a UNIQUE constraint exists on `(stock_id, fiscal_year)` in your `research_stock_balance_sheet` table for this to work correctly.
    if (validatedData.balance_sheet) {
      const bsData = validatedData.balance_sheet;
      const [bsResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_balance_sheet (stock_id, fiscal_year, is_estimate, equity_capital, reserves, borrowings, long_term_borrowings, short_term_borrowings, lease_liabilities, other_borrowings, other_liabilities, trade_payables, advance_from_customers, other_liability_items, gross_block, accumulated_depreciation, fixed_assets, land, building, plant_machinery, equipments, furniture_n_fittings, vehicles, other_fixed_assets, cwip, investments, other_assets, inventories, trade_receivables, cash_equivalents, loans_n_advances, other_asset_items, total_assets)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_estimate = VALUES(is_estimate),
          equity_capital = VALUES(equity_capital),
          reserves = VALUES(reserves),
          borrowings = VALUES(borrowings),
          long_term_borrowings = VALUES(long_term_borrowings),
          short_term_borrowings = VALUES(short_term_borrowings),
          lease_liabilities = VALUES(lease_liabilities),
          other_borrowings = VALUES(other_borrowings),
          other_liabilities = VALUES(other_liabilities),
          trade_payables = VALUES(trade_payables),
          advance_from_customers = VALUES(advance_from_customers),
          other_liability_items = VALUES(other_liability_items),
          gross_block = VALUES(gross_block),
          accumulated_depreciation = VALUES(accumulated_depreciation),
          fixed_assets = VALUES(fixed_assets),
          land = VALUES(land),
          building = VALUES(building),
          plant_machinery = VALUES(plant_machinery),
          equipments = VALUES(equipments),
          furniture_n_fittings = VALUES(furniture_n_fittings),
          vehicles = VALUES(vehicles),
          other_fixed_assets = VALUES(other_fixed_assets),
          cwip = VALUES(cwip),
          investments = VALUES(investments),
          other_assets = VALUES(other_assets),
          inventories = VALUES(inventories),
          trade_receivables = VALUES(trade_receivables),
          cash_equivalents = VALUES(cash_equivalents),
          loans_n_advances = VALUES(loans_n_advances),
          other_asset_items = VALUES(other_asset_items),
          total_assets = VALUES(total_assets)`,
        [
          stockId,
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
        affectedRows: bsResult.affectedRows,
      };
    }

   
    if (validatedData.details) {
      const detailsData = validatedData.details;
      const [detailsResult] = await connection.execute<ResultSetHeader>(
        `UPDATE research_stock_details SET
          report_date = ?, target_period = ?, price_at_reco = ?, target_price = ?,
          potential_returns = ?, recommendation = ?, company_overview = ?,
          investment_rationale = ?, industry_overview = ?, risks_concerns = ?,
          analyst_name = ?
        WHERE stock_id = ?`,
        [
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
          stockId, // WHERE clause
        ]
      );
      results.details = {
        ...detailsData,
        affectedRows: detailsResult.affectedRows,
      };
    }

    // Example for research_stock_financial_ratios (assuming unique on stock_id, fiscal_year, period_type)
    if (validatedData.financial_ratios) {
      const frData = validatedData.financial_ratios;
      const [frResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_financial_ratios (stock_id, fiscal_year, period_type, roe, roce, current_ratio, peg_ratio, net_profit_margin, ev_ebitda, debt_to_equity, roa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          roe = VALUES(roe),
          roce = VALUES(roce),
          current_ratio = VALUES(current_ratio),
          peg_ratio = VALUES(peg_ratio),
          net_profit_margin = VALUES(net_profit_margin),
          ev_ebitda = VALUES(ev_ebitda),
          debt_to_equity = VALUES(debt_to_equity),
          roa = VALUES(roa)`,
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
        affectedRows: frResult.affectedRows,
      };
    }

    // Example for research_stock_income_statement (assuming unique on stock_id, fiscal_year, is_estimate)
    if (validatedData.income_statement) {
      const isData = validatedData.income_statement;
      const [isResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_income_statement (stock_id, fiscal_year, is_estimate, interest_earned, other_income, total_income, total_expenditure, operating_profit, provisions_contigencies, profit_before_tax, tax, net_profit, gross_npa_percentage, gross_npa, net_npa, interest_cost, net_npa_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          interest_earned = VALUES(interest_earned),
          other_income = VALUES(other_income),
          total_income = VALUES(total_income),
          total_expenditure = VALUES(total_expenditure),
          operating_profit = VALUES(operating_profit),
          provisions_contigencies = VALUES(provisions_contigencies),
          profit_before_tax = VALUES(profit_before_tax),
          tax = VALUES(tax),
          net_profit = VALUES(net_profit),
          gross_npa_percentage = VALUES(gross_npa_percentage),
          gross_npa = VALUES(gross_npa),
          net_npa = VALUES(net_npa),
          interest_cost = VALUES(interest_cost),
          net_npa_percentage = VALUES(net_npa_percentage)`,
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
        affectedRows: isResult.affectedRows,
      };
    }

    // research_stock_key_metrics (assuming unique on stock_id and snapshot_date)
    if (validatedData.key_metrics) {
      const kmData = validatedData.key_metrics;
      const [kmResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_key_metrics (stock_id, snapshot_date, cmp, pe_ratio, enterprise_value, market_cap, fifty_two_week_high, fifty_two_week_low)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          cmp = VALUES(cmp),
          pe_ratio = VALUES(pe_ratio),
          enterprise_value = VALUES(enterprise_value),
          market_cap = VALUES(market_cap),
          fifty_two_week_high = VALUES(fifty_two_week_high),
          fifty_two_week_low = VALUES(fifty_two_week_low)`,
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
        affectedRows: kmResult.affectedRows,
      };
    }

    // research_stock_performance_metrics (assuming unique on stock_id and period_type)
    if (validatedData.performance_metrics) {
      const pmData = validatedData.performance_metrics;
      const [pmResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_performance_metrics (stock_id, period_type, stock_return, benchmark_return)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          stock_return = VALUES(stock_return),
          benchmark_return = VALUES(benchmark_return)`,
        [
          stockId,
          pmData.period_type,
          pmData.stock_return,
          pmData.benchmark_return,
        ]
      );
      results.performance_metrics = {
        ...pmData,
        affectedRows: pmResult.affectedRows,
      };
    }

    // research_stock_R_D_investments (assuming unique on stock_id and fiscal_year)
    if (validatedData.rd_investments) {
      const rdiData = validatedData.rd_investments;
      const [rdiResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_R_D_investments (stock_id, fiscal_year, rd_investments_crores, rd_as_percent_of_sales)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          rd_investments_crores = VALUES(rd_investments_crores),
          rd_as_percent_of_sales = VALUES(rd_as_percent_of_sales)`,
        [
          stockId,
          rdiData.fiscal_year,
          rdiData.rd_investments_crores,
          rdiData.rd_as_percent_of_sales,
        ]
      );
      results.rd_investments = {
        ...rdiData,
        affectedRows: rdiResult.affectedRows,
      };
    }

    // research_stock_revenue_mix (assuming unique on stock_id, fiscal_year, mix_type, category)
    if (validatedData.revenue_mix) {
      const rmData = validatedData.revenue_mix;
      const [rmResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_revenue_mix (stock_id, fiscal_year, mix_type, category, percentage)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          percentage = VALUES(percentage)`,
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
        affectedRows: rmResult.affectedRows,
      };
    }

    // research_stock_shareholding_pattern (assuming unique on stock_id, period_month, period_year)
    if (validatedData.shareholding_pattern) {
      const shpData = validatedData.shareholding_pattern;
      const [shpResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO research_stock_shareholding_pattern (stock_id, period_month, period_year, promoters, share_holding_pledge, fii, public, total_dil)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          promoters = VALUES(promoters),
          share_holding_pledge = VALUES(share_holding_pledge),
          fii = VALUES(fii),
          public = VALUES(public),
          total_dil = VALUES(total_dil)`,
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
        affectedRows: shpResult.affectedRows,
      };
    }

    // Commit the transaction if all updates/inserts were successful
    await connection.commit();

    return NextResponse.json(
      {
        message: "Full stock research data updated successfully",
        data: results, // Returns affectedRows for updates
      },
      { status: 200 } // Use 200 OK for successful updates
    );
  } catch (error) {
    // Rollback the transaction if any error occurred
    if (connection) {
      console.warn("Transaction rolled back due to error during PUT:", error);
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

    console.error("Error updating full stock research data:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error while updating stock research data",
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


// Helper to convert Date objects from MySQL to ISO strings for JSON
const toISODateString = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
};

export async function GET(
  req: NextRequest,
  { params }: { params: { stockId: string } } // Assuming dynamic route `[stockId]`
) {
  let connection;
  try {
    const stockId = parseInt(params.stockId, 10);

    if (isNaN(stockId)) {
      return NextResponse.json({ message: "Invalid stock ID" }, { status: 400 });
    }

    connection = await pool.getConnection();

    // Use a plain JavaScript object for results
    const results: Record<string, any> = {};

    // 1. Get basic stock information (symbol, company_name, etc.)
    const [stockRows] = await connection.execute<RowDataPacket[]>(
      `SELECT research_stock_id, symbol, company_name FROM research_stocks WHERE research_stock_id = ?`,
      [stockId]
    );

    if (stockRows.length === 0) {
      return NextResponse.json(
        { message: `Stock with ID ${stockId} not found.` },
        { status: 404 }
      );
    }
    // Assign directly, relying on the RowDataPacket type from mysql2
    results.stock = stockRows[0]; 

    // Balance Sheet (can have multiple per stock_id, fiscal_year)
    const [balanceSheetRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_balance_sheet WHERE stock_id = ? ORDER BY fiscal_year DESC`,
      [stockId]
    );

    // If there can be multiple, store as an array, otherwise take the first
    // For an edit page, you might often only need the *latest* or a specific one
    results.balance_sheet = balanceSheetRows.length > 0 ? balanceSheetRows[0] : null;


    // Stock Details (assuming 1-to-1 or latest)
    const [detailsRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_details WHERE stock_id = ? ORDER BY report_date DESC LIMIT 1`,
      [stockId]
    );
    if (detailsRows.length > 0) {
      const details = detailsRows[0];
      // Convert Date objects to ISO strings if applicable
      results.details = {
        ...details,
        report_date: toISODateString(details.report_date),
      };
    } else {
      results.details = null;
    }


    // Financial Ratios (can have multiple)
    const [financialRatiosRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_financial_ratios WHERE stock_id = ? ORDER BY fiscal_year DESC, period_type DESC`,
      [stockId]
    );
    results.financial_ratios = financialRatiosRows.length > 0 ? financialRatiosRows[0] : null;


    // Income Statement (can have multiple)
    const [incomeStatementRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_income_statement WHERE stock_id = ? ORDER BY fiscal_year DESC, is_estimate DESC`,
      [stockId]
    );
    results.income_statement = incomeStatementRows.length > 0 ? incomeStatementRows[0] : null;


    // Key Metrics (can have multiple, fetch latest)
    const [keyMetricsRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_key_metrics WHERE stock_id = ? ORDER BY snapshot_date DESC LIMIT 1`,
      [stockId]
    );
    if (keyMetricsRows.length > 0) {
      const metrics = keyMetricsRows[0];
      results.key_metrics = {
        ...metrics,
        snapshot_date: toISODateString(metrics.snapshot_date),
      };
    } else {
      results.key_metrics = null;
    }


    // Performance Metrics (can have multiple)
    const [performanceMetricsRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_performance_metrics WHERE stock_id = ? ORDER BY period_type DESC`,
      [stockId]
    );
    results.performance_metrics = performanceMetricsRows.length > 0 ? performanceMetricsRows[0] : null;


    // R&D Investments (can have multiple)
    const [rdInvestmentsRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_R_D_investments WHERE stock_id = ? ORDER BY fiscal_year DESC`,
      [stockId]
    );
    results.rd_investments = rdInvestmentsRows.length > 0 ? rdInvestmentsRows[0] : null;


    // Revenue Mix (can have multiple)
    const [revenueMixRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_revenue_mix WHERE stock_id = ? ORDER BY fiscal_year DESC, mix_type ASC, category ASC`,
      [stockId]
    );
    results.revenue_mix = revenueMixRows.length > 0 ? revenueMixRows[0] : null;


    // Shareholding Pattern (can have multiple, fetch latest)
    const [shareholdingPatternRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM research_stock_shareholding_pattern WHERE stock_id = ? ORDER BY period_year DESC, period_month DESC LIMIT 1`,
      [stockId]
    );
    results.shareholding_pattern = shareholdingPatternRows.length > 0 ? shareholdingPatternRows[0] : null;

    return NextResponse.json(
      {
        message: `Stock research data for ID ${stockId} retrieved successfully`,
        data: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving full stock research data:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error while retrieving stock research data",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}