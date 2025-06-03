"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stock } from "@/types";
import { useRouter } from "next/navigation";

export default function ResearchTable() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  //router navigation
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      getStocks(page);
    }
  }, [mounted, page]);

  const getStocks = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/research-table/all?page=${pageNumber}&limit=${limit}`
      );
      const responseData = await response.json();
      console.log(responseData);

      if (response.ok) {
        toast.success(responseData.message);
        setTotalPages(responseData?.totalPages);
        setData(responseData?.data);
      } else {
        setError(responseData.error || "Unable to fetch records");
        toast.error(responseData.error || "Unable to fetch records");
      }
    } catch (error) {
      console.log(error);
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  const getRatingBadgeClass = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case "buy":
        return "bg-green-100 text-green-800 border-green-200";
      case "sell":
        return "bg-red-100 text-red-800 border-red-200";
      case "hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getChangeClass = (changePerc: string) => {
    if (!changePerc) return "text-gray-600";
    const isPositive =
      changePerc.includes("+") ||
      (!changePerc.includes("-") && parseFloat(changePerc) > 0);
    return isPositive ? "text-green-600" : "text-red-600";
  };

  const getUpsideDownsideClass = (value: string) => {
    if (!value) return "text-gray-600";
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes("book") || lowerValue.includes("profit")) {
      return "text-orange-600 font-medium";
    }
    return "text-blue-600";
  };

  if (!mounted) return null;

  console.log(data);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Research Table</h1>
          <div className="flex gap-3">
            <Button className="cursor-pointer">Add Stock</Button>
            <Button
              className="cursor-pointer"
              onClick={() =>
                router.push(
                  `/super-admin/database/research-table/addDetailInfo`
                )
              }
            >
              Add Detil Info
            </Button>
            <Input type="text" placeholder="Search Stocks" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e8a4c] text-white">
                  {[
                    "Symbol",
                    "Icon",
                    "Price",
                    "Change %",
                    "Market Cap",
                    "Target",
                    "Rating",
                    "Profit Booked",
                    "Upside/Downside",
                    "Date",
                    "Actions",
                  ].map((header, index) => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-sm font-semibold text-left border-r border-[#1e8a4c]/30 ${
                        index === 0 ? "sticky left-0 z-10 bg-[#1e8a4c]" : ""
                      }`}
                      style={{ minWidth: index === 0 ? "200px" : "120px" }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e8a4c] mr-2"></div>
                        Loading research data...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-red-500">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 mb-2 text-red-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((stock, index) => (
                    <tr
                      key={`${stock.research_stock_id}-${index}`}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Sticky Symbol column */}
                      <td
                        className={`px-4 py-3 text-sm border-r border-gray-200 sticky left-0 z-10 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{ minWidth: "200px" }}
                      >
                        <div className="font-medium text-gray-900">
                          {stock.symbol}
                        </div>
                      </td>

                      {/* Icon */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800">
                              {stock.icon
                                ? stock.icon.charAt(0).toUpperCase()
                                : "S"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <div className="font-medium text-gray-900">
                          {stock.price_raw || `₹${stock.price}`}
                        </div>
                      </td>

                      {/* Change % */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span
                          className={`font-medium ${getChangeClass(
                            stock.change_perc ?? ""
                          )}`}
                        >
                          {stock.change_perc || "N/A"}
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span className="font-medium text-gray-700">
                          {stock.market_cap || "N/A"}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span className="font-medium text-gray-700">
                          ₹{stock.target || "N/A"}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRatingBadgeClass(
                            stock.rating ?? ""
                          )}`}
                        >
                          {stock.rating || "N/A"}
                        </span>
                      </td>

                      {/* Profit Booked */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span className="text-green-600 font-medium">
                          {stock.profit_booked || "N/A"}
                        </span>
                      </td>

                      {/* Upside/Downside */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span
                          className={getUpsideDownsideClass(
                            stock.upside_downside ?? ""
                          )}
                        >
                          {stock.upside_downside || "N/A"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-sm border-r border-gray-200">
                        <span className="text-gray-600">
                          {formatDate(stock.date ?? "")}
                        </span>
                      </td>
                      <td className="flex px-4 py-3 text-sm border-r space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                        >
                          View/Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="cursor-pointer"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 mb-2 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        No research data found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
              <Button
                disabled={page === 1 || loading}
                onClick={() => setPage(page - 1)}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page === totalPages || loading}
                onClick={() => setPage(page + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
