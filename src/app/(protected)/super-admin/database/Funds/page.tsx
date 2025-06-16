"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Link, Table, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FundTablesOverview() {
  const router = useRouter();

  const fundTables = [
    {
      name: "Fund Details",
      description: "Comprehensive fund information and metadata",
      icon: <Database className="w-5 h-5 text-emerald-600" />,
      path: "/super-admin/database/Funds/fund_details",
      category: "core",
    },
    {
      name: "ETFs Regular",
      description: "Exchange-traded funds with regular pricing",
      icon: <Database className="w-5 h-5 text-blue-600" />,
      path: "/super-admin/database/Funds/etfs_regular",
      category: "etf",
    },
    {
      name: "ETFs Direct",
      description: "Direct exchange-traded funds management",
      icon: <Database className="w-5 h-5 text-emerald-600" />,
      path: "/super-admin/database/Funds/etfs_direct",
      category: "etf",
    },
    {
      name: "Funds Regular Flex",
      description: "Flexible regular fund management system",
      icon: <Database className="w-5 h-5 text-blue-600" />,
      path: "/super-admin/database/Funds/funds_regular_flex",
      category: "flex",
    },
    {
      name: "Flex Funds Direct",
      description: "Direct flexible funds administration",
      icon: <Database className="w-5 h-5 text-emerald-600" />,
      path: "/super-admin/database/Funds/flex_funds_direct",
      category: "flex",
    },
  ];

  const handleNavigation = (path : string) => {
    router.push(path);
  };

  const handleKeyDown = (event : any, path : string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(path);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Fund Tables Overview
          </h1>
          <p className="text-slate-600 text-lg">
            Manage and access your fund database tables
          </p>
        </header>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fundTables.map((table, index) => (
            <Card
              key={`${table.category}-${index}`}
              className={`
                group relative overflow-hidden border-0 shadow-sm bg-white
                hover:shadow-xl hover:-translate-y-1 
                focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                transition-all duration-300 ease-out cursor-pointer
              `}
              onClick={() => handleNavigation(table.path)}
              onKeyDown={(e) => handleKeyDown(e, table.path)}
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${table.name}`}
            >
              {/* Gradient accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors duration-200">
                      {table.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                        {table.name}
                      </CardTitle>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-slate-600 leading-relaxed mb-4">
                  {table.description}
                </p>
                
                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <span className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    ${table.category === 'core' ? 'bg-purple-100 text-purple-700' : 
                      table.category === 'etf' ? 'bg-blue-100 text-blue-700' : 
                      'bg-emerald-100 text-emerald-700'}
                  `}>
                    {table.category.toUpperCase()}
                  </span>
                  
                  <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors duration-200">
                    Click to manage
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            Super Admin Database Management • Fund Tables Overview
          </p>
        </footer>
      </div>
    </div>
  );
}