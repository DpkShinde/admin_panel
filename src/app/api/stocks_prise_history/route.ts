import { NextResponse, NextRequest } from "next/server";
import pool from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();

    if (!requestData) {
      return NextResponse.json(
        { success: false, message: "Request data is missing." },
        { status: 400 }
      );
    }

    const dateColumns = [
      "2025-04-01",
      "2025-04-02",
      "2025-04-03",
      "2025-04-04",
      "2025-04-05",
      "2025-04-06",
      "2025-04-07",
      "2025-04-08",
      "2025-04-09",
      "2025-04-10",
      "2025-04-11",
      "2025-04-12",
      "2025-04-13",
      "2025-04-14",
      "2025-04-15",
      "2025-04-16",
      "2025-04-17",
      "2025-04-18",
      "2025-04-19",
      "2025-04-20",
      "2025-04-21",
      "2025-04-22",
      "2025-04-23",
      "2025-04-24",
      "2025-04-25",
      "2025-04-26",
      "2025-04-27",
      "2025-04-28",
      "2025-04-29",
      "2025-04-30",
    ];

    // handle bould records
    if (Array.isArray(requestData) && requestData.length > 0) {
      const query = `
        INSERT INTO stock_prices (stock_name, stock_symbol, ${dateColumns
          .map((date) => `\`${date}\``)
          .join(", ")})
        VALUES ${requestData
          .map(() => `(?, ?, ${dateColumns.map(() => "?").join(", ")})`)
          .join(", ")}
      `;

      const values = requestData.flatMap((stock) => [
        stock.stock_name ?? null,
        stock.stock_symbol ?? null,
        ...dateColumns.map((date) => stock[date] ?? null),
      ]);

      const [result] = await pool.execute<ResultSetHeader>(query, values);

      return NextResponse.json(
        {
          success: true,
          message: `${result.affectedRows} stock prices added successfully!`,
        },
        { status: 201 }
      );
    }

    //handle single record
    if (typeof requestData === "object" && requestData !== null) {
      const { stock_name, stock_symbol, ...prices } = requestData;

      if (!stock_name || !stock_symbol) {
        return NextResponse.json(
          {
            success: false,
            message: "Stock name and stock symbol are required.",
          },
          { status: 400 }
        );
      }

      const query = `
        INSERT INTO stock_prices (stock_name, stock_symbol, ${dateColumns
          .map((date) => `\`${date}\``)
          .join(", ")})
        VALUES (?, ?, ${dateColumns.map(() => "?").join(", ")})
      `;

      const values = [
        stock_name,
        stock_symbol,
        ...dateColumns.map((date) => prices[date] ?? null),
      ];

      const [result] = await pool.execute<ResultSetHeader>(query, values);

      return NextResponse.json(
        { success: true, message: "Stock added successfully!" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid data format." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error adding stock:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
