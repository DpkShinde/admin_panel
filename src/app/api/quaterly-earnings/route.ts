import { NextResponse, NextRequest } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function POST(req: NextRequest) {
  const connection = await pool4.getConnection();
  await connection.beginTransaction();

  try {
    const { data } = await req.json();
    if (!data) {
      return NextResponse.json({ message: "No data found" }, { status: 400 });
    }

    //Insert into `company_info` (Main Table)
    await connection.query(
      `
            INSERT INTO company_info (company_id, name, description, registered_address, city, state, pin_code, telephone, fax, email, website,
            bse_code, nse_code, series, isin, registrar_name, registrar_address, registrar_city, registrar_state, registrar_pin_code, 
            registrar_telephone, registrar_fax, registrar_website)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.name,
        data.description,
        data.registered_address,
        data.city,
        data.state,
        data.pin_code,
        data.telephone,
        data.fax,
        data.email,
        data.website,
        data.bse_code,
        data.nse_code,
        data.series,
        data.isin,
        data.registrar_name,
        data.registrar_address,
        data.registrar_city,
        data.registrar_state,
        data.registrar_pin_code,
        data.registrar_telephone,
        data.registrar_fax,
        data.registrar_website,
      ]
    );

    //Insert into `company_financial_results`
    await connection.query(
      `INSERT INTO company_financial_results (company_id,company_name,result_type,ltp_rs,
      market_cap,revenue_cr,change_percent,tentative_date,gross_profit_percent,net_profit_percent,tag)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.company_id,
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
      ]
    );

    //Insert into business_areas
    await connection.query(`INSERT INTO business_areas (company_id,area_name,description) 
      VALUES (?,?,?)`,[
        data.company_id,
        data.area_name,
        data.description
      ])

    //Insert into `balance_sheet`
    await connection.query(
      `
            INSERT INTO balance_sheet (company_id, fiscal_year, share_capital, reserves_surplus, minority_interest, deposits, 
            borrowings, other_liabilities, total_liabilities, fixed_assets, loans_advances, investments, other_assets, total_assets)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.fiscal_year,
        data.share_capital,
        data.reserves_surplus,
        data.minority_interest,
        data.deposits,
        data.borrowings,
        data.other_liabilities,
        data.total_liabilities,
        data.fixed_assets,
        data.loans_advances,
        data.investments,
        data.other_assets,
        data.total_assets,
      ]
    );

    //Insert into `cash_flow`
    await connection.query(
      `
            INSERT INTO cash_flow (company_id, fiscal_year, cash_operating, cash_investing, cash_financing, cash_others, net_cash_flow)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.fiscal_year,
        data.cash_operating,
        data.cash_investing,
        data.cash_financing,
        data.cash_others,
        data.net_cash_flow,
      ]
    );

    //Insert into `financial_ratios`
    await connection.query(
      `
            INSERT INTO financial_ratios (company_id, fiscal_year, basic_eps, diluted_eps, book_value_per_share, dividend_per_share, face_value, 
            net_interest_margin, operating_profit_margin, net_profit_margin, return_on_equity, roce, return_on_assets, casa_percentage, capital_adequacy_ratio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.fiscal_year,
        data.basic_eps,
        data.diluted_eps,
        data.book_value_per_share,
        data.dividend_per_share,
        data.face_value,
        data.net_interest_margin,
        data.operating_profit_margin,
        data.net_profit_margin,
        data.return_on_equity,
        data.roce,
        data.return_on_assets,
        data.casa_percentage,
        data.capital_adequacy_ratio,
      ]
    );

    //Insert into `income_statement`
    await connection.query(
      `
            INSERT INTO income_statement (company_id, fiscal_year, interest_earned, other_income, total_income, total_expenditure, operating_profit, 
            provisions_contingencies, profit_before_tax, tax, net_profit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.fiscal_year,
        data.interest_earned,
        data.other_income,
        data.total_income,
        data.total_expenditure,
        data.operating_profit,
        data.provisions_contingencies,
        data.profit_before_tax,
        data.tax,
        data.net_profit,
      ]
    );

    //Insert into `management`
    await connection.query(
      `
            INSERT INTO management (company_id, name, position, join_date, leave_date)
            VALUES (?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.management_name,
        data.management_position,
        data.join_date,
        data.leave_date,
      ]
    );

    //Insert into news
    await connection.query(
      `INSERT INTO news (company_id,quarter_year,promoters,foreign_institutions,dii,public,others) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.quarter_year,
        data.promoters,
        data.foreign_institutions,
        data.dii,
        data.public,
        data.others,
      ]
    );

    //Insert into `peer_analysis`
    await connection.query(
      `
            INSERT INTO peer_analysis (company_id, company_name, price, change_percentage, market_cap, ttm_pe, pb_ratio, roe, 
            one_year_performance, car, interest_earned, nim, analysis_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.company_name,
        data.price,
        data.change_percentage,
        data.market_cap,
        data.ttm_pe,
        data.pb_ratio,
        data.roe,
        data.one_year_performance,
        data.car,
        data.interest_earned,
        data.nim,
        data.analysis_date,
      ]
    );

    //Insert into npa
    await connection.query(
      `INSERT INTO npa (company_id,title,content,publish_date,source,url)
    VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.title,
        data.content,
        data.publish_date,
        data.source,
        data.url,
      ]
    );

    //Insert into Quaterly Earnings
    await connection.query(
      `INSERT INTO quarterly_earnings (company_id,year,quarter,revenue,net_profit,eps,vps_percentage,roe,nim) 
    VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        data.company_id,
        data.year,
        data.quarter,
        data.revenue,
        data.net_profit,
        data.eps,
        data.vps_percentage,
        data.roe,
        data.nim,
      ]
    );

    //Insert into `shareholding`
    await connection.query(
      `INSERT INTO shareholding (company_id, quarter_year, promoters, foreign_institutions, dii, public, others)
       VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.company_id,
        data.quarter_year,
        data.promoters,
        data.foreign_institutions,
        data.dii,
        data.public,
        data.others,
      ]
    );
    await connection.query(``);

    await connection.commit();
    connection.release();

    return NextResponse.json(
      { message: "All data inserted successfully into multiple tables" },
      { status: 200 }
    );
  } catch (error : any) {
    await connection.rollback();
    connection.release();

    console.error("Error inserting data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
