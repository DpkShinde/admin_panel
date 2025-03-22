"use client";

import { Table, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const menuItems = [
  {
    name: "Stock Tables",
    path: "/database/stock-tables",
    subItems: [
      { name: "Stock Data", path: "/database/stock-tables/screener" },
      { name: "Stock Valuation", path: "/database/stock-tables/analytics" },
      { name: "Stock inc-Stetment", path: "/database/stock-tables/analytics" },
      { name: "Sector Weightage", path: "/database/stock-tables/analytics" },
    ],
  },
  {
    name: "Funds Tables",
    path: "/funds",
  },
  {
    name: "User Tables",
    path: "/users",
  },
  {
    name: "News Tables",
    path: "/news",
  },
  {
    name: "Blogs Tables",
    path: "/blogs",
  },
];

const NavigationSubSideBar = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="w-60 h-full ml-18 dark:bg-[#2B2D31] bg-[#F2F3F5] border-r dark:border-[#202225] border-gray-200">
      <div className="flex flex-col gap-2 p-4">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          const isDropdownOpen = openDropdown === item.name;

          return (
            <div key={index}>
              {/* Main Category */}
              <div
                className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer ${
                  isActive
                    ? "bg-[#36393F] text-white"
                    : "hover:bg-[#36393F] text-gray-300"
                }`}
                onClick={() => item.subItems && toggleDropdown(item.name)}
              >
                <Link href={item.path} className="flex items-center w-full">
                  <Table
                    className={`w-5 h-5 mr-2 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <p>{item.name}</p>
                </Link>
                {item.subItems &&
                  (isDropdownOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  ))}
              </div>

              {/* Sub-Tabs */}
              {item.subItems && isDropdownOpen && (
                <div className="ml-6 flex flex-col gap-1">
                  {item.subItems.map((subItem, subIndex) => {
                    const isSubActive = pathname === subItem.path;
                    return (
                      <Link
                        key={subIndex}
                        href={subItem.path}
                        className={`flex items-center py-2 px-2 rounded cursor-pointer ${
                          isSubActive
                            ? "bg-[#3A3D41] text-white"
                            : "hover:bg-[#3A3D41] text-gray-300"
                        }`}
                      >
                        <Table
                          className={`w-4 h-4 mr-2 ${
                            isSubActive ? "text-white" : "text-gray-400"
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
