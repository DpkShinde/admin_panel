import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "Stock ID is required" });

  const stockId = Number(id);

  try {
    if (req.method === "GET") {
      // Fetch stock data by ID
      const [rows] = await pool.query(
        "SELECT * FROM stocks_screnner_valuetion WHERE id = ?",
        [stockId]
      );

      // Check if the stock exists
      if (!rows) {
        console.warn(`Stock with ID ${stockId} not found.`);
        return res.status(404).json({ message: "Stock not found" });
      }

      return res.status(200).json(rows);
    }

    if (req.method === "PUT") {
      // Update stock data
      const {
        Symbol,
        MarketCap,
        MarketCapPercentage,
        PERatio,
        PSRatio,
        PBRatio,
        PFCFRatio,
        Price,
        EnterpriseValue,
        EVRevenue,
        EVEBIT,
        EVEBITDA,
      } = req.body;

      await pool.query(
        "UPDATE stocks_screnner_valuetion SET Symbol=?, MarketCap=?, MarketCapPercentage=?, PERatio=?, PSRatio=?, PBRatio=?, PFCFRatio=?, Price=?, EnterpriseValue=?, EVRevenue=?, EVEBIT=?, EVEBITDA=? WHERE id=?",
        [
          Symbol,
          MarketCap,
          MarketCapPercentage,
          PERatio,
          PSRatio,
          PBRatio,
          PFCFRatio,
          Price,
          EnterpriseValue,
          EVRevenue,
          EVEBIT,
          EVEBITDA,
          stockId,
        ]
      );

      return res.status(200).json({ message: "Stock updated successfully!" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}
