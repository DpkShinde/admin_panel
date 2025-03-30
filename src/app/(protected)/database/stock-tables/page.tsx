"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Table, BarChart } from "lucide-react";
import Link from "next/link";

const stockTables = [
  {
    name: "Stock Data",
    icon: <Table className="w-6 h-6 text-gray-700" />,
    path: "/database/stock-tables/stocks-screnner-data",
  },
  {
    name: "Stock Valuation",
    icon: <BarChart className="w-6 h-6 text-gray-700" />,
    path: "/database/stock-tables/stocks-valuation",
  },
  {
    name: "Stock Income Statement",
    icon: <Table className="w-6 h-6 text-gray-700" />,
    path: "/database/stock-tables/stocks-screener-inc-stet",
  },
  {
    name: "Sector Weightage",
    icon: <Grid className="w-6 h-6 text-gray-700" />,
    path: "/database/stock-tables/stocks-sector-weitage",
  },
  {
    name: "Stocks List",
    icon: <Grid className="w-6 h-6 text-gray-700" />,
    path: "/database/stock-tables/stocks_list",
  }
];

export default function StockTablesOverview() {
  return (
    <div className="p-6 ml-5">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Stock Tables Overview
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 cursor-pointer">
        {stockTables.map((table, index) => (
          <Link href={table.path} key={index} className="cursor-pointer">
            <Card className="bg-white shadow-xl border border-gray-200 rounded-2xl transition-transform transform hover:scale-105">
              <CardHeader className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">{table.icon}</div>
                <CardTitle className="text-gray-900">{table.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">
                  Manage and view {table.name} records here.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
