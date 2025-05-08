// src/app/api/quarterly-earnings/route.ts (or your file path)
import { NextResponse, NextRequest } from "next/server";
import pool4 from "@/utils/db3QuaterlyE"; // Your DB connection pool
import { PoolConnection } from "mysql2/promise"; // Assuming mysql2

export async function POST(req: NextRequest) {
  let connection: PoolConnection | null = null;

  try {
    connection = await pool4.getConnection();
    await connection.beginTransaction();

    const payload = await req.json();
    console.log(payload);

    if (
      !payload ||
      !payload.companyInfo ||
      (payload.companyInfo.company_id === undefined &&
        payload.companyInfo.company_id === null) ||
      (typeof payload.companyInfo.company_id !== "number" &&
        payload.companyInfo.company_id !== 0)
    ) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      return NextResponse.json(
        {
          message: "Company info with a valid company_id (number) is required.",
        },
        { status: 400 }
      );
    }

    const {
      companyInfo,
      companyFinancialResult,
      qBalanceSheets,
      businessAreas,
      qCashFlows,
      qFinancialRatiosItems,
      incomeStatements,
      managementPersonnel,
      newsItems,
      npaItems,
      qPeerAnalysisItems,
      quarterlyEarningsItems,
      shareholdingPatterns,
    } = payload;

    const companyId = companyInfo.company_id;

    // --- MODIFIED ORDER ---
    // Insert into company_financial_results FIRST, as company_info depends on it
    // according to your current foreign key constraint.

    // 2. company_financial_results (NOW EXECUTED FIRST)
    if (companyFinancialResult) {
      await connection.query(
        `INSERT INTO company_financial_results (company_id, company_name, result_type, ltp_rs, market_cap, revenue_cr, change_percent, 
         tentative_date, gross_profit_percent, net_profit_percent, tag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          company_name=VALUES(company_name), result_type=VALUES(result_type), ltp_rs=VALUES(ltp_rs), market_cap=VALUES(market_cap), 
          revenue_cr=VALUES(revenue_cr), change_percent=VALUES(change_percent), tentative_date=VALUES(tentative_date), 
          gross_profit_percent=VALUES(gross_profit_percent), net_profit_percent=VALUES(net_profit_percent), tag=VALUES(tag)`,
        [
          companyId, // This companyId must be valid for this table, or insertable
          companyFinancialResult.company_name || companyInfo.name,
          companyFinancialResult.result_type,
          companyFinancialResult.ltp_rs,
          companyFinancialResult.market_cap,
          companyFinancialResult.revenue_cr,
          companyFinancialResult.change_percent,
          companyFinancialResult.tentative_date,
          companyFinancialResult.gross_profit_percent,
          companyFinancialResult.net_profit_percent,
          companyFinancialResult.tag,
        ]
      );
    } else {
      // If companyFinancialResult is mandatory for company_info to exist (due to FK),
      // and it's not provided, you might want to throw an error or handle it.
      // For now, we assume if it's not provided, the FK might allow null or this is an update.
      // However, the FK error suggests a company_id is needed FROM company_financial_results.
      // This implies companyFinancialResult data for this companyId MUST be inserted.
      // If companyFinancialResult can be optional, the FK setup is problematic.
      // For this fix to work, companyFinancialResult MUST be present if company_info is being inserted with this FK.
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      return NextResponse.json(
        {
          message:
            "Company Financial Result data is required to satisfy foreign key constraints for Company Info.",
        },
        { status: 400 }
      );
    }

    // 1. company_info (NOW EXECUTED SECOND)
    // This query will now succeed if the companyId was successfully inserted/updated in company_financial_results above.
    await connection.query(
      `INSERT INTO company_info (company_id, name, description, registered_address, city, state, pin_code, telephone, fax, email, website,
        bse_code, nse_code, series, isin, registrar_name, registrar_address, registrar_city, registrar_state, registrar_pin_code, 
        registrar_telephone, registrar_fax, registrar_website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name=VALUES(name), description=VALUES(description), registered_address=VALUES(registered_address), city=VALUES(city), state=VALUES(state), 
        pin_code=VALUES(pin_code), telephone=VALUES(telephone), fax=VALUES(fax), email=VALUES(email), website=VALUES(website), 
        bse_code=VALUES(bse_code), nse_code=VALUES(nse_code), series=VALUES(series), isin=VALUES(isin), registrar_name=VALUES(registrar_name), 
        registrar_address=VALUES(registrar_address), registrar_city=VALUES(registrar_city), registrar_state=VALUES(registrar_state), 
        registrar_pin_code=VALUES(registrar_pin_code), registrar_telephone=VALUES(registrar_telephone), registrar_fax=VALUES(registrar_fax), 
        registrar_website=VALUES(registrar_website)`,
      [
        companyId,
        companyInfo.name,
        companyInfo.description,
        companyInfo.registered_address,
        companyInfo.city,
        companyInfo.state,
        companyInfo.pin_code,
        companyInfo.telephone,
        companyInfo.fax,
        companyInfo.email,
        companyInfo.website,
        companyInfo.bse_code,
        companyInfo.nse_code,
        companyInfo.series,
        companyInfo.isin,
        companyInfo.registrar_name,
        companyInfo.registrar_address,
        companyInfo.registrar_city,
        companyInfo.registrar_state,
        companyInfo.registrar_pin_code,
        companyInfo.registrar_telephone,
        companyInfo.registrar_fax,
        companyInfo.registrar_website,
      ]
    );

    // 3. business_areas
    if (
      businessAreas &&
      Array.isArray(businessAreas) &&
      businessAreas.length > 0
    ) {
      for (const area of businessAreas) {
        await connection.query(
          `INSERT INTO business_areas (company_id, area_name, description) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE description=VALUES(description)`,
          [companyId, area.area_name, area.description]
        );
      }
    }

    // 4. balance_sheet (from qBalanceSheets)
    if (
      qBalanceSheets &&
      Array.isArray(qBalanceSheets) &&
      qBalanceSheets.length > 0
    ) {
      for (const sheet of qBalanceSheets) {
        await connection.query(
          `INSERT INTO balance_sheet (company_id, fiscal_year, share_capital, reserves_surplus, minority_interest, deposits, 
           borrowings, other_liabilities, total_liabilities, fixed_assets, loans_advances, investments, other_assets, total_assets)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            share_capital=VALUES(share_capital), reserves_surplus=VALUES(reserves_surplus), minority_interest=VALUES(minority_interest), 
            deposits=VALUES(deposits), borrowings=VALUES(borrowings), other_liabilities=VALUES(other_liabilities), 
            total_liabilities=VALUES(total_liabilities), fixed_assets=VALUES(fixed_assets), loans_advances=VALUES(loans_advances), 
            investments=VALUES(investments), other_assets=VALUES(other_assets), total_assets=VALUES(total_assets)`,
          [
            companyId,
            sheet.fiscal_year,
            sheet.share_capital,
            sheet.reserves_surplus,
            sheet.minority_interest,
            sheet.deposits,
            sheet.borrowings,
            sheet.other_liabilities,
            sheet.total_liabilities,
            sheet.fixed_assets,
            sheet.loans_advances,
            sheet.investments,
            sheet.other_assets,
            sheet.total_assets,
          ]
        );
      }
    }

    // 5. cash_flow (from qCashFlows)
    if (qCashFlows && Array.isArray(qCashFlows) && qCashFlows.length > 0) {
      for (const flow of qCashFlows) {
        await connection.query(
          `INSERT INTO cash_flow (company_id, fiscal_year, cash_operating, cash_investing, cash_financing, cash_others, net_cash_flow)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            cash_operating=VALUES(cash_operating), cash_investing=VALUES(cash_investing), cash_financing=VALUES(cash_financing), 
            cash_others=VALUES(cash_others), net_cash_flow=VALUES(net_cash_flow)`,
          [
            companyId,
            flow.fiscal_year,
            flow.cash_operating,
            flow.cash_investing,
            flow.cash_financing,
            flow.cash_others,
            flow.net_cash_flow,
          ]
        );
      }
    }

    // 6. financial_ratios (from qFinancialRatiosItems)
    if (
      qFinancialRatiosItems &&
      Array.isArray(qFinancialRatiosItems) &&
      qFinancialRatiosItems.length > 0
    ) {
      for (const ratio of qFinancialRatiosItems) {
        await connection.query(
          `INSERT INTO financial_ratios (company_id, fiscal_year, basic_eps, diluted_eps, book_value_per_share, dividend_per_share, face_value, 
           net_interest_margin, operating_profit_margin, net_profit_margin, return_on_equity, roce, return_on_assets, casa_percentage, capital_adequacy_ratio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            basic_eps=VALUES(basic_eps), diluted_eps=VALUES(diluted_eps), book_value_per_share=VALUES(book_value_per_share), 
            dividend_per_share=VALUES(dividend_per_share), face_value=VALUES(face_value), net_interest_margin=VALUES(net_interest_margin), 
            operating_profit_margin=VALUES(operating_profit_margin), net_profit_margin=VALUES(net_profit_margin), return_on_equity=VALUES(return_on_equity), 
            roce=VALUES(roce), return_on_assets=VALUES(return_on_assets), casa_percentage=VALUES(casa_percentage), capital_adequacy_ratio=VALUES(capital_adequacy_ratio)`,
          [
            companyId,
            ratio.fiscal_year,
            ratio.basic_eps,
            ratio.diluted_eps,
            ratio.book_value_per_share,
            ratio.dividend_per_share,
            ratio.face_value,
            ratio.net_interest_margin,
            ratio.operating_profit_margin,
            ratio.net_profit_margin,
            ratio.return_on_equity,
            ratio.roce,
            ratio.return_on_assets,
            ratio.casa_percentage,
            ratio.capital_adequacy_ratio,
          ]
        );
      }
    }

    // 7. income_statement (from incomeStatements)
    if (
      incomeStatements &&
      Array.isArray(incomeStatements) &&
      incomeStatements.length > 0
    ) {
      for (const stmt of incomeStatements) {
        await connection.query(
          `INSERT INTO income_statement (company_id, fiscal_year, interest_earned, other_income, total_income, total_expenditure, operating_profit, 
           provisions_contingencies, profit_before_tax, tax, net_profit)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            interest_earned=VALUES(interest_earned), other_income=VALUES(other_income), total_income=VALUES(total_income), 
            total_expenditure=VALUES(total_expenditure), operating_profit=VALUES(operating_profit), provisions_contingencies=VALUES(provisions_contingencies), 
            profit_before_tax=VALUES(profit_before_tax), tax=VALUES(tax), net_profit=VALUES(net_profit)`,
          [
            companyId,
            stmt.fiscal_year,
            stmt.interest_earned,
            stmt.other_income,
            stmt.total_income,
            stmt.total_expenditure,
            stmt.operating_profit,
            stmt.provisions_contingencies,
            stmt.profit_before_tax,
            stmt.tax,
            stmt.net_profit,
          ]
        );
      }
    }

    // 8. management (from managementPersonnel)
    if (
      managementPersonnel &&
      Array.isArray(managementPersonnel) &&
      managementPersonnel.length > 0
    ) {
      for (const person of managementPersonnel) {
        await connection.query(
          `INSERT INTO management (company_id, name, position, join_date, leave_date) VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE join_date=VALUES(join_date), leave_date=VALUES(leave_date)`,
          [
            companyId,
            person.name,
            person.position,
            person.join_date || null,
            person.leave_date || null,
          ]
        );
      }
    }

    // 9. news (from newsItems)
    if (newsItems && Array.isArray(newsItems) && newsItems.length > 0) {
      for (const news of newsItems) {
        await connection.query(
          `INSERT INTO news (company_id, title, content, publish_date, source, url) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE content=VALUES(content), publish_date=VALUES(publish_date), source=VALUES(source)`,
          [
            companyId,
            news.title,
            news.content,
            news.publish_date || null,
            news.source,
            news.url,
          ]
        );
      }
    }

    // 10. npa (from npaItems)
    if (npaItems && Array.isArray(npaItems) && npaItems.length > 0) {
      for (const npa of npaItems) {
        await connection.query(
          `INSERT INTO npa (company_id, fiscal_year, gross_npa_amount, gross_npa_percentage, net_npa_amount, net_npa_percentage)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            gross_npa_amount=VALUES(gross_npa_amount), gross_npa_percentage=VALUES(gross_npa_percentage), 
            net_npa_amount=VALUES(net_npa_amount), net_npa_percentage=VALUES(net_npa_percentage)`,
          [
            companyId,
            npa.fiscal_year,
            npa.gross_npa_amount,
            npa.gross_npa_percentage,
            npa.net_npa_amount,
            npa.net_npa_percentage,
          ]
        );
      }
    }

    // 11. peer_analysis (from qPeerAnalysisItems)
    if (
      qPeerAnalysisItems &&
      Array.isArray(qPeerAnalysisItems) &&
      qPeerAnalysisItems.length > 0
    ) {
      for (const peer of qPeerAnalysisItems) {
        await connection.query(
          `INSERT INTO peer_analysis (company_id, company_name, price, change_percentage, market_cap, ttm_pe, pb_ratio, roe, 
                 one_year_performance, car, interest_earned, nim, analysis_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                  price=VALUES(price), change_percentage=VALUES(change_percentage), market_cap=VALUES(market_cap), ttm_pe=VALUES(ttm_pe), 
                  pb_ratio=VALUES(pb_ratio), roe=VALUES(roe), one_year_performance=VALUES(one_year_performance), car=VALUES(car), 
                  interest_earned=VALUES(interest_earned), nim=VALUES(nim)`,
          [
            companyId,
            peer.company_name,
            peer.price,
            peer.change_percentage,
            peer.market_cap,
            peer.ttm_pe,
            peer.pb_ratio,
            peer.roe,
            peer.one_year_performance,
            peer.car,
            peer.interest_earned,
            peer.nim,
            peer.analysis_date || null,
          ]
        );
      }
    }

    // 12. quarterly_earnings (from quarterlyEarningsItems)
    if (
      quarterlyEarningsItems &&
      Array.isArray(quarterlyEarningsItems) &&
      quarterlyEarningsItems.length > 0
    ) {
      for (const earning of quarterlyEarningsItems) {
        await connection.query(
          `INSERT INTO quarterly_earnings (company_id, year, quarter, revenue, net_profit, eps, bvps_percentage, roe, nim) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            revenue=VALUES(revenue), net_profit=VALUES(net_profit), eps=VALUES(eps), bvps_percentage=VALUES(bvps_percentage), 
            roe=VALUES(roe), nim=VALUES(nim)`,
          [
            companyId,
            earning.year,
            earning.quarter,
            earning.revenue,
            earning.net_profit,
            earning.eps,
            earning.bvps_percentage,
            earning.roe,
            earning.nim,
          ]
        );
      }
    }

    // 13. shareholding (from shareholdingPatterns)
    if (
      shareholdingPatterns &&
      Array.isArray(shareholdingPatterns) &&
      shareholdingPatterns.length > 0
    ) {
      for (const pattern of shareholdingPatterns) {
        await connection.query(
          `INSERT INTO shareholding (company_id, quarter_year, promoters, foreign_institutions, dii, public, others)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            promoters=VALUES(promoters), foreign_institutions=VALUES(foreign_institutions), dii=VALUES(dii), 
            public=VALUES(public), others=VALUES(others)`,
          [
            companyId,
            pattern.quarter_year,
            pattern.promoters,
            pattern.foreign_institutions,
            pattern.dii,
            pattern.public,
            pattern.others,
          ]
        );
      }
    }

    await connection.commit();
    return NextResponse.json(
      { message: "All data successfully processed and saved." },
      { status: 200 }
    );
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error processing request:", error);
    const errorMessage =
      error && typeof error.message === "string"
        ? error.message
        : "An unknown error occurred";
    return NextResponse.json(
      { message: "Internal Server Error", error: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
