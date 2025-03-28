"use client";

import { Table, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import path from "path";
import React, { useState } from "react";

const menuItems = [
  {
    name: "Stock Tables",
    path: "/database/stock-tables",
    subItems: [
      {
        name: "Stock Data",
        path: "/database/stock-tables/stocks-screnner-data",
      },
      {
        name: "Stock Valuation",
        path: "/database/stock-tables/stocks-valuation",
      },
      {
        name: "Stock Income Statement",
        path: "/database/stock-tables/stocks-screener-inc-stet",
      },
      {
        name: "Sector Weightage",
        path: "/database/stock-tables/stocks-sector-weitage",
      },
    ],
  },
  {
    name: "Funds Tables",
    path: "/database/Funds",
    subItems:[
      {
        name:"Fund Details",
        path:"/database/Funds/fund_details"
      }
    ]
  },
  {
    name: "User Tables",
    path: "/database/users",
  },
  {
    name: "News Tables",
    path: "/database/news",
    subItems: [
      { name: "Add News", path: "/database/news/createnews" },
    ],
  },
  {
    name: "Blogs Tables",
    path: "/database/blogs/getblogs",
    subItems: [
      { name: "Add Blogs", path: "/database/blogs/" },
    ],
  },
];

const NavigationSubSideBar = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="w-60 h-full ml-18 bg-gradient-to-b from-[#0e6d31] to-[#105f2d] border-r border-[#14532d]">
      <div className="flex flex-col gap-2 p-4">
        {menuItems.map((item, index) => {
          const isActive = pathname.startsWith(item.path);
          const isDropdownOpen = openDropdown === item.name || isActive;

          return (
            <div key={index}>
              {/* Main Category */}
              <div
                className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer transition ${
                  isActive
                    ? "bg-white text-[#166534]"
                    : "hover:bg-[#ffffff20] text-white"
                }`}
                onClick={() => item.subItems && toggleDropdown(item.name)}
              >
                <Link href={item.path} className="flex items-center w-full">
                  <Table
                    className={`w-5 h-5 mr-2 ${
                      isActive ? "text-[#166534]" : "text-white"
                    }`}
                  />
                  <p>{item.name}</p>
                </Link>
                {item.subItems &&
                  (isDropdownOpen ? (
                    <ChevronDown className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white" />
                  ))}
              </div>

              {/* Sub-Tabs */}
              {item.subItems && isDropdownOpen && (
                <div className="ml-6 flex flex-col gap-1">
                  {item.subItems.map((subItem, subIndex) => {
                    const isSubActive = pathname.startsWith(subItem.path);
                    return (
                      <Link
                        key={subIndex}
                        href={subItem.path}
                        className={`flex items-center py-2 px-2 rounded cursor-pointer transition ${
                          isSubActive
                            ? "bg-white text-[#166534] font-bold"
                            : "hover:bg-[#ffffff20] text-white"
                        }`}
                      >
                        <Table
                          className={`w-4 h-4 mr-2 ${
                            isSubActive ? "text-[#166534]" : "text-white"
                          }`}
                        />
                        <p>{subItem.name}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationSubSideBar;
