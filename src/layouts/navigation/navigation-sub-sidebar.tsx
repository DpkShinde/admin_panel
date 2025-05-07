"use client";

import { Table, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

// Extend the Session type to include the role property
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
  }
}

const menuItems = [
  {
    name: "Stock Tables",
    path: "/super-admin/database/stock-tables",
    subItems: [
      {
        name: "Stock Data",
        path: "/super-admin/database/stock-tables/stocks-screnner-data",
      },
      {
        name: "Stock Valuation",
        path: "/super-admin/database/stock-tables/stocks-valuation",
      },
      {
        name: "Stock Income Statement",
        path: "/super-admin/database/stock-tables/stocks-screener-inc-stet",
      },
      {
        name: "Sector Weightage",
        path: "/super-admin/database/stock-tables/stocks-sector-weitage",
      },
      {
        name: "Stock List",
        path: "/super-admin/database/stock-tables/stocks_list",
      },
      {
        name: "Stock Prise",
        path: "/super-admin/database/stock-tables/stocks-prise",
      },
    ],
  },
  {
    name: "Funds Tables",
    path: "/super-admin/database/Funds",
    subItems: [
      {
        name: "Fund Details",
        path: "/super-admin/database/Funds/fund_details",
      },
    ],
  },
  {
    name: "User Tables",
    path: "/super-admin/database/users",
  },
  {
    name: "News Tables",
    path: "/super-admin/database/news",
  },
  {
    name: "Blogs Tables",
    path: "/super-admin/database/blogs",
  },
  {
    name: "Subscription plans",
    path: "/super-admin/database/subscription",
  },
  {
    name: "IPO Details",
    path: "/super-admin/database/IPO_Details",
  },
  {
    name: "Mutual Funds",
    path: "/super-admin/database/mutualfunds/",
  },
  {
    name: "Stock Details",
    path: "/super-admin/database/stock-details/companies-table",
  },
  {
    name: "Quarterly Earnings",
    path: "/super-admin/database/quarterly-earnings",
  },
  {
    name: "Admin Manangement",
    path: "/super-admin/database/admin-management",
  },
];

const NavigationSubSideBar = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="w-60 h-full ml-18 bg-gradient-to-b from-[#0e6d31] to-[#105f2d] border-r border-[#14532d]">
      <div className="flex flex-col gap-2 p-4">
        {menuItems.map((item, index) => {
          //check role if role is admin then only show specific content
          if (item.name === "Admin Manangement" && userRole !== "superadmin") {
            return null; //for hide admin table management tab
          }

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
