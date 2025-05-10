import { NextResponse, NextRequest } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function GET(req: NextRequest,{ params }: { params: { id: string } }) {
  const connection = await pool4.getConnection();

  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json(
        { message: "Missing company_id" },
        { status: 400 }
      );
    }

    const queries = {
      company_info: "SELECT * FROM company_info WHERE company_id = ?",
      company_financial_results:
        "SELECT * FROM company_financial_results WHERE company_id = ?",
      balance_sheet: "SELECT * FROM balance_sheet WHERE company_id = ?",
      business_areas: "SELECT * FROM business_areas WHERE company_id = ?",
      cash_flow: "SELECT * FROM cash_flow WHERE company_id = ?",
      financial_ratios: "SELECT * FROM financial_ratios WHERE company_id = ?",
      income_statement: "SELECT * FROM income_statement WHERE company_id = ?",
      management: "SELECT * FROM management WHERE company_id = ?",
      news: "SELECT * FROM news WHERE company_id = ?",
      peer_analysis: "SELECT * FROM peer_analysis WHERE company_id = ?",
      npa: "SELECT * FROM npa WHERE company_id = ?",
      quarterly_earnings:
        "SELECT * FROM quarterly_earnings WHERE company_id = ?",
      shareholding: "SELECT * FROM shareholding WHERE company_id = ?",
    };

    const result: any = {};

    for (const [table, query] of Object.entries(queries)) {
      const [rows] = await connection.query(query, [companyId]);
      result[table] = rows;
    }

    connection.release();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    connection.release();
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const connection = await pool4.getConnection();
  await connection.beginTransaction();

  try {
    const { data } = await req.json();
    console.log("Received data:", data);

    if (!data || !data.company_id) {
      return NextResponse.json(
        { message: "Missing company_id or data" },
        { status: 400 }
      );
    }

    const companyId = data.company_id;

    // // company_info
    // await connection.query(
    //   `UPDATE company_info SET name=?, description=?, registered_address=?, city=?, state=?, pin_code=?, telephone=?, fax=?, email=?, website=?,
    //    bse_code=?, nse_code=?, series=?, isin=?, registrar_name=?, registrar_address=?, registrar_city=?, registrar_state=?, registrar_pin_code=?,
    //    registrar_telephone=?, registrar_fax=?, registrar_website=? WHERE company_id=?`,
    //   [
    //     data.name,
    //     data.description,
    //     data.registered_address,
    //     data.city,
    //     data.state,
    //     data.pin_code,
    //     data.telephone,
    //     data.fax,
    //     data.email,
    //     data.website,
    //     data.bse_code,
    //     data.nse_code,
    //     data.series,
    //     data.isin,
    //     data.registrar_name,
    //     data.registrar_address,
    //     data.registrar_city,
    //     data.registrar_state,
    //     data.registrar_pin_code,
    //     data.registrar_telephone,
    //     data.registrar_fax,
    //     data.registrar_website,
    //     companyId,
    //   ]
    // );

    // company_financial_results
    await connection.query(
      `UPDATE company_financial_results SET company_name=?, result_type=?, ltp_rs=?, market_cap=?, revenue_cr=?, change_percent=?,
       tentative_date=?, gross_profit_Cr=?, net_profit_Cr=?, tag=? WHERE company_id=?`,
      [
        data.company_name,
        data.result_type,
        data.ltp_rs,
        data.market_cap,
        data.revenue_cr,
        data.change_percent,
        data.tentative_date,
        data.gross_profit_percent,
        data.net_profit_percent,
        data.tag,
        companyId,
      ]
    );

    // //business_areas
    // await connection.query(
    //   `UPDATE business_areas SET area_name = ? , description = ? WHERE company_id = ?`,
    //   [data.area_name, data.description, companyId]
    // );

    // // balance_sheet
    // await connection.query(
    //   `UPDATE balance_sheet SET fiscal_year=?, share_capital=?, reserves_surplus=?, minority_interest=?, deposits=?, borrowings=?, other_liabilities=?,
    //    total_liabilities=?, fixed_assets=?, loans_advances=?, investments=?, other_assets=?, total_assets=? WHERE company_id=?`,
    //   [
    //     data.fiscal_year,
    //     data.share_capital,
    //     data.reserves_surplus,
    //     data.minority_interest,
    //     data.deposits,
    //     data.borrowings,
    //     data.other_liabilities,
    //     data.total_liabilities,
    //     data.fixed_assets,
    //     data.loans_advances,
    //     data.investments,
    //     data.other_assets,
    //     data.total_assets,
    //     companyId,
    //   ]
    // );

    // // cash_flow
    // await connection.query(
    //   `UPDATE cash_flow SET fiscal_year=?, cash_operating=?, cash_investing=?, cash_financing=?, cash_others=?, net_cash_flow=? WHERE company_id=?`,
    //   [
    //     data.fiscal_year,
    //     data.cash_operating,
    //     data.cash_investing,
    //     data.cash_financing,
    //     data.cash_others,
    //     data.net_cash_flow,
    //     companyId,
    //   ]
    // );

    // // financial_ratios
    // await connection.query(
    //   `UPDATE financial_ratios SET fiscal_year=?, basic_eps=?, diluted_eps=?, book_value_per_share=?, dividend_per_share=?, face_value=?,
    //    net_interest_margin=?, operating_profit_margin=?, net_profit_margin=?, return_on_equity=?, roce=?, return_on_assets=?, casa_percentage=?,
    //    capital_adequacy_ratio=? WHERE company_id=?`,
    //   [
    //     data.fiscal_year,
    //     data.basic_eps,
    //     data.diluted_eps,
    //     data.book_value_per_share,
    //     data.dividend_per_share,
    //     data.face_value,
    //     data.net_interest_margin,
    //     data.operating_profit_margin,
    //     data.net_profit_margin,
    //     data.return_on_equity,
    //     data.roce,
    //     data.return_on_assets,
    //     data.casa_percentage,
    //     data.capital_adequacy_ratio,
    //     companyId,
    //   ]
    // );

    // // income_statement
    // await connection.query(
    //   `UPDATE income_statement SET fiscal_year=?, interest_earned=?, other_income=?, total_income=?, total_expenditure=?, operating_profit=?,
    //    provisions_contingencies=?, profit_before_tax=?, tax=?, net_profit=? WHERE company_id=?`,
    //   [
    //     data.fiscal_year,
    //     data.interest_earned,
    //     data.other_income,
    //     data.total_income,
    //     data.total_expenditure,
    //     data.operating_profit,
    //     data.provisions_contingencies,
    //     data.profit_before_tax,
    //     data.tax,
    //     data.net_profit,
    //     companyId,
    //   ]
    // );

    // // management
    // await connection.query(
    //   `UPDATE management SET name=?, position=?, join_date=?, leave_date=? WHERE company_id=?`,
    //   [
    //     data.management_name,
    //     data.management_position,
    //     data.join_date,
    //     data.leave_date,
    //     companyId,
    //   ]
    // );

    // // news
    // await connection.query(
    //   `UPDATE news SET quarter_year=?, promoters=?, foreign_institutions=?, dii=?, public=?, others=? WHERE company_id=?`,
    //   [
    //     data.quarter_year,
    //     data.promoters,
    //     data.foreign_institutions,
    //     data.dii,
    //     data.public,
    //     data.others,
    //     companyId,
    //   ]
    // );

    // // peer_analysis
    // await connection.query(
    //   `UPDATE peer_analysis SET company_name=?, price=?, change_percentage=?, market_cap=?, ttm_pe=?, pb_ratio=?, roe=?,
    //    one_year_performance=?, car=?, interest_earned=?, nim=?, analysis_date=? WHERE company_id=?`,
    //   [
    //     data.company_name,
    //     data.price,
    //     data.change_percentage,
    //     data.market_cap,
    //     data.ttm_pe,
    //     data.pb_ratio,
    //     data.roe,
    //     data.one_year_performance,
    //     data.car,
    //     data.interest_earned,
    //     data.nim,
    //     data.analysis_date,
    //     companyId,
    //   ]
    // );

    // // npa
    // await connection.query(
    //   `UPDATE npa SET title=?, content=?, publish_date=?, source=?, url=? WHERE company_id=?`,
    //   [
    //     data.title,
    //     data.content,
    //     data.publish_date,
    //     data.source,
    //     data.url,
    //     companyId,
    //   ]
    // );

    // // quarterly_earnings
    // await connection.query(
    //   `UPDATE quarterly_earnings SET year=?, quarter=?, revenue=?, net_profit=?, eps=?, vps_percentage=?, roe=?, nim=? WHERE company_id=?`,
    //   [
    //     data.year,
    //     data.quarter,
    //     data.revenue,
    //     data.net_profit,
    //     data.eps,
    //     data.vps_percentage,
    //     data.roe,
    //     data.nim,
    //     companyId,
    //   ]
    // );

    // // shareholding
    // await connection.query(
    //   `UPDATE shareholding SET quarter_year=?, promoters=?, foreign_institutions=?, dii=?, public=?, others=? WHERE company_id=?`,
    //   [
    //     data.quarter_year,
    //     data.promoters,
    //     data.foreign_institutions,
    //     data.dii,
    //     data.public,
    //     data.others,
    //     companyId,
    //   ]
    // );

    await connection.commit();
    connection.release();

    return NextResponse.json(
      { message: "All data updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    await connection.rollback();
    connection.release();
    console.error("Error updating data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
