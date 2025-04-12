import { NextResponse, NextRequest } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

// Normalize stock object keys (converting date strings to proper ISO format)
function normalizeStock(stock: any): Record<string, any> {
  const normalized: Record<string, any> = {
    stock_name: stock.stock_name,
    stock_symbol: stock.stock_symbol,
  };

  Object.keys(stock).forEach((key) => {
    if (key !== "stock_name" && key !== "stock_symbol") {
      const parsedDate = new Date(key);
      if (!isNaN(parsedDate.getTime())) {
        const isoKey = parsedDate.toISOString().split("T")[0];
        normalized[isoKey] = stock[key];
      }
    }
  });

  return normalized;
}

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    let records: any[] = [];

    // Normalize input into array
    if (Array.isArray(requestData)) {
      records = requestData;
    } else if (typeof requestData === "object" && requestData !== null) {
      records = [requestData];
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid request format" },
        { status: 400 }
      );
    }

    // Normalize and collect all columns
    const normalizedRecords = records.map(normalizeStock);
    const sample = normalizedRecords[0];

    // Dynamically find all unique date columns from sample
    const dateColumns = Object.keys(sample).filter(
      (key) => key !== "stock_name" && key !== "stock_symbol"
    );

    if (dateColumns.length === 0) {
      return NextResponse.json(
        { success: false, message: "No date columns found" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO stock_prices (stock_name, stock_symbol, ${dateColumns
        .map((col) => `\`${col}\``)
        .join(", ")})
      VALUES ${normalizedRecords
        .map(() => `(?, ?, ${dateColumns.map(() => "?").join(", ")})`)
        .join(", ")}
    `;

    const values = normalizedRecords.flatMap((stock) => [
      stock.stock_name ?? null,
      stock.stock_symbol ?? null,
      ...dateColumns.map((col) => stock[col] ?? null),
    ]);

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return NextResponse.json(
      {
        success: true,
        message: `${result.affectedRows} record(s) added successfully`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Insert stock error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
