import { NextRequest, NextResponse } from "next/server";
import pool2 from "@/utils/db2";

// GET: Fetch all data for a company by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const stockId = Number(context.params.id);

  if (isNaN(stockId)) {
    return NextResponse.json(
      { success: false, message: "Invalid stock ID." },
      { status: 400 }
    );
  }

  try {
    const [companyRows]: any = await pool2.query(
      `SELECT * FROM companies WHERE id = ?`,
      [stockId]
    );

    if (!companyRows || companyRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    const company = companyRows[0];

    const [cash_flow]: any = await pool2.query(
      `SELECT * FROM cash_flow WHERE company_id = ?`,
      [stockId]
    );
    const [balance_sheet]: any = await pool2.query(
      `SELECT * FROM balance_sheet WHERE company_id = ?`,
      [stockId]
    );
    const [annual_profit_loss]: any = await pool2.query(
      `SELECT * FROM annual_profit_loss WHERE company_id = ?`,
      [stockId]
    );
    const [financial_metrics]: any = await pool2.query(
      `SELECT * FROM financial_metrics WHERE company_id = ?`,
      [stockId]
    );
    const [financial_ratios]: any = await pool2.query(
      `SELECT * FROM financial_ratios WHERE company_id = ?`,
      [stockId]
    );
    const [valuation_inputs]: any = await pool2.query(
      `SELECT * FROM valuation_inputs WHERE company_id = ?`,
      [stockId]
    );
    const [peer_analysis]: any = await pool2.query(
      `SELECT * FROM peer_analysis WHERE company_id = ?`,
      [stockId]
    );
    const [peer_valuations]: any = await pool2.query(
      `SELECT * FROM peer_valuations WHERE company_id = ?`,
      [stockId]
    );
    const [quarterly_financials]: any = await pool2.query(
      `SELECT * FROM quarterly_financials WHERE company_id = ?`,
      [stockId]
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          ...company,
          cash_flow: cash_flow[0] ?? null,
          balance_sheet: balance_sheet[0] ?? null,
          annual_profit_loss: annual_profit_loss[0] ?? null,
          financial_metrics: financial_metrics[0] ?? null,
          financial_ratios: financial_ratios[0] ?? null,
          valuation_inputs: valuation_inputs[0] ?? null,
          peer_analysis: peer_analysis[0] ?? null,
          peer_valuations: peer_valuations[0] ?? null,
          quarterly_financials: quarterly_financials ?? [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET full company data error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update all company information including financial tables
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const stockId = Number(context.params.id);

  if (isNaN(stockId)) {
    return NextResponse.json(
      { success: false, message: "Invalid stock ID." },
      { status: 400 }
    );
  }

  try {
    const requestData = await req.json();
    const {
      name,
      market_cap_category,
      cash_flow,
      balance_sheet,
      annual_profit_loss,
      financial_metrics,
      financial_ratios,
      valuation_inputs,
      peer_analysis,
      peer_valuations,
      quarterly_financials,
    } = requestData;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    // Start a transaction
    await pool2.query("START TRANSACTION");

    // Update companies table
    const [companyResult]: any = await pool2.query(
      `UPDATE companies SET name = ?, market_cap_category = ? WHERE id = ?`,
      [name, market_cap_category ?? null, stockId]
    );

    if (companyResult.affectedRows === 0) {
      await pool2.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "No record updated. Company not found." },
        { status: 404 }
      );
    }

    // Define date fields that need special handling
    const dateFields = new Set(["valuation_date"]);

    // Function to create update query and parameters for a table
    const createUpdateQuery = (tableName: string, data: any) => {
      if (!data || Object.keys(data).length === 0) return null;

      const fields = Object.keys(data).filter(
        (key) => key !== "id" && key !== "company_id"
      );
      if (fields.length === 0) return null;

      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const query = `UPDATE ${tableName} SET ${setClause} WHERE company_id = ?`;

      const params: Array<string | number | null> = [];

      for (const field of fields) {
        const value = data[field];

        if (dateFields.has(field) && value) {
          try {
            const dateObj = new Date(value);
            const formattedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
            params.push(formattedDate);
          } catch (e) {
            // If date parsing fails, use null
            params.push(null);
          }
        } else {
          params.push(value === "" ? null : value);
        }
      }

      params.push(stockId);

      return { query, params };
    };

    // Function to check if record exists and create or update accordingly
    const upsertRecord = async (tableName: string, data: any) => {
      if (!data || Object.keys(data).length === 0) return;

      // Check if record exists
      const [existingRecord]: any = await pool2.query(
        `SELECT id FROM ${tableName} WHERE company_id = ?`,
        [stockId]
      );

      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        const updateQuery = createUpdateQuery(tableName, data);
        if (updateQuery) {
          await pool2.query(updateQuery.query, updateQuery.params);
        }
      } else {
        // Create new record
        const fields = Object.keys(data).filter((key) => key !== "id");
        const placeholders = fields.map(() => "?").join(", ");
        const query = `INSERT INTO ${tableName} (company_id, ${fields.join(
          ", "
        )}) VALUES (?, ${placeholders})`;

        const params: (string | number | null)[] = [stockId];
        for (const field of fields) {
          const value = data[field];

          if (dateFields.has(field) && value) {
            try {
              const dateObj = new Date(value);
              const formattedDate: any = dateObj.toISOString().split("T")[0];
              params.push(formattedDate);
            } catch (e) {
              // If date parsing fails, use null
              params.push(null);
            }
          } else {
            params.push(value === "" ? null : value);
          }
        }

        await pool2.query(query, params);
      }
    };

    // Update all financial tables
    await upsertRecord("cash_flow", cash_flow);
    await upsertRecord("balance_sheet", balance_sheet);
    await upsertRecord("annual_profit_loss", annual_profit_loss);
    await upsertRecord("financial_metrics", financial_metrics);
    await upsertRecord("financial_ratios", financial_ratios);
    await upsertRecord("valuation_inputs", valuation_inputs);
    await upsertRecord("peer_analysis", peer_analysis);
    await upsertRecord("peer_valuations", peer_valuations);

    // Handle quarterly_financials differently as it's an array
    if (
      quarterly_financials &&
      Array.isArray(quarterly_financials) &&
      quarterly_financials.length > 0
    ) {
      // First delete existing quarterly financials
      await pool2.query(
        "DELETE FROM quarterly_financials WHERE company_id = ?",
        [stockId]
      );

      // Then insert the new ones
      for (const quarter of quarterly_financials) {
        const fields = Object.keys(quarter).filter(
          (key) => key !== "id" && key !== "company_id"
        );
        if (fields.length === 0) continue;

        const placeholders = fields.map(() => "?").join(", ");
        const query = `INSERT INTO quarterly_financials (company_id, ${fields.join(
          ", "
        )}) VALUES (?, ${placeholders})`;

        const params: (string | number | null)[] = [stockId];
        for (const field of fields) {
          const value = quarter[field];

          if (dateFields.has(field) && value) {
            try {
              const dateObj = new Date(value);
              const formattedDate: any = dateObj.toISOString().split("T")[0];
              params.push(formattedDate);
            } catch (e) {
              // If date parsing fails, use null
              params.push(null);
            }
          } else {
            params.push(value === "" ? null : value);
          }
        }

        await pool2.query(query, params);
      }
    }

    // Commit the transaction
    await pool2.query("COMMIT");

    return NextResponse.json(
      { success: true, message: "Company data updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    // Rollback in case of error
    await pool2.query("ROLLBACK");
    console.error("PUT company data error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
