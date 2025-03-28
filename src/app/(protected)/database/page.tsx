import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const DatabaseHome = () => {
  const tables = [
    { name: "Stock Data", entries: 120, lastUpdated: "Mar 25, 2025" },
    { name: "User Tables", entries: 58, lastUpdated: "Mar 20, 2025" },
    { name: "News Tables", entries: 34, lastUpdated: "Mar 22, 2025" },
    { name: "Funds Tables", entries: 78, lastUpdated: "Mar 21, 2025" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Database Management</h1>
      </div>

      {/* Database Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table, index) => (
          <Card key={index} className="bg-white shadow-xl text-black cursor-pointer border border-gray-200 rounded-2xl transition-transform transform hover:scale-105">
            <CardHeader>
              <CardTitle>{table.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Entries: {table.entries}</p>
              <p className="text-sm text-gray-500">Last Updated: {table.lastUpdated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DatabaseHome;
