import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stockTables = [
  {
    name: "Stocks Screener Inc.",
    path: "/database/stock-tables/stocks-screener-inc-st",
  },
  {
    name: "Stocks Screener Data",
    path: "/database/stock-tables/stocks-screener-data",
  },
  {
    name: "Stocks Sector Weightage",
    path: "/database/stock-tables/stocks-sector-weightage",
  },
  { name: "Stocks Valuation", path: "/database/stock-tables/stocks-valuation" },
];

const StockTablesPage = () => {
  return (
    <div className="p-6 ml-20">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
        Stock Tables
      </h1>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
        {stockTables.map((table, index) => (
          <a
            key={index}
            href={table.path}
            className="hover:scale-105 transition-transform"
          >
            <Card className="border border-gray-300 dark:border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {table.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage {table.name.toLowerCase()} data here.
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export default StockTablesPage;
