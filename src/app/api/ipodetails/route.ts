import { NextResponse } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM IPO_Details_db.company;");
    console.log(rows); // Logs the fetched data
    return NextResponse.json(rows, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching IPOs:", error);
    return NextResponse.json(
      { error: "Error fetching IPOs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json(); 
  const { company, ipo_details, financials, ratios, subscription } = body;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction(); 
    const [companyResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO IPO_Details_db.company 
       (name, industry, description, total_yarn_varieties, active_yarn_varieties, 
        customer_count, established_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        company.name,
        company.industry,
        company.description,
        company.total_yarn_varieties,
        company.active_yarn_varieties,
        company.customer_count,
        company.established_year
      ]
    );

    const company_id = companyResult.insertId;

    // 2. Insert IPO details
    await connection.query<ResultSetHeader>(
      `INSERT INTO IPO_Details_db.ipo_details 
       (company_id, opening_date, closing_date, allotment_date, refund_date, 
        listing_date, lot_size, min_investment, price_band_min, price_band_max, 
        face_value, shares_offered, offer_for_sale, fresh_issue, offer_to_public, purpose) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        company_id,
        ipo_details.opening_date,
        ipo_details.closing_date,
        ipo_details.allotment_date,
        ipo_details.refund_date,
        ipo_details.listing_date,
        ipo_details.lot_size,
        ipo_details.min_investment,
        ipo_details.price_band_min,
        ipo_details.price_band_max,
        ipo_details.face_value,
        ipo_details.shares_offered,
        ipo_details.offer_for_sale,
        ipo_details.fresh_issue,
        ipo_details.offer_to_public,
        ipo_details.purpose
      ]
    );

    // 3. Insert financial data
    for (const financial of financials) {
      await connection.query<ResultSetHeader>(
        `INSERT INTO IPO_Details_db.financials 
         (company_id, fiscal_year, revenue, ebit, pat, net_worth, total_debt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,

        [
          company_id,
          financial.fiscal_year,
          financial.revenue,
          financial.ebit,
          financial.pat,
          financial.net_worth,
          financial.total_debt
        ]
      );
    }

    // 4. Insert ratios
    for (const ratio of ratios) {
      await connection.query<ResultSetHeader>(
        `INSERT INTO IPO_Details_db.key_ratios 
         (company_id, fiscal_year, debt_to_equity, ebit_margin, roce, roe) 
         VALUES (?, ?, ?, ?, ?, ?)`,

        [
          company_id,
          ratio.fiscal_year,
          ratio.debt_to_equity,
          ratio.ebit_margin,
          ratio.roce,
          ratio.roe
        ]
      );
    }

    // 5. Insert subscription data
    for (const sub of subscription) {
      await connection.query<ResultSetHeader>(
        `INSERT INTO IPO_Details_db.subscription_status 
         (company_id, category, subscription_times) 
         VALUES (?, ?, ?)`,

        [
          company_id,
          sub.category,
          sub.subscription_times
        ]
      );
    }

    await connection.commit();
    connection.release(); 

    return NextResponse.json({
      success: true,
      message: "Company and IPO details added successfully",
      company_id
    }, { status: 201 });

  } catch (error: unknown) {
    if (connection) await connection.rollback();
    console.error("Error adding company data:", error);

    return NextResponse.json({
      success: false,
      message: "Failed to add company and IPO details",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });

  } finally {
    if (connection) connection.release();
  }
}
