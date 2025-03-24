"use client";
import { useEffect, useState } from "react";
import type { StockScreenerData } from "../../../../../types/index";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Home = () => {
  const [data, setData] = useState<StockScreenerData[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/stocks_screnner_data/all");
      const result = await res.json();
      setData(result?.data);
    }
    fetchData();
  }, []);

  // Delete record only after confirmation
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/stocks_screnner_data/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      if (res.ok) {
        toast.success("Stock deleted successfully!");
        setData((prevData) =>
          prevData.filter((stock) => stock.id !== deleteId)
        );
      } else {
        toast.error("An error occurred while deleting.");
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast.error("An error occurred while deleting.");
    }

    setDeleteId(null);
  };

  console.log(data);

  const handleEdit = (id: number) => {
    router.push(`/database/stock-tables/stocks-screnner-data/${id}`);
  };

  return (
    <>
      <div className="ml-42">
        <div className="overflow-x-auto shadow-lg rounded-md">
          <h1 className="text-2xl font-bold text-center mb-4">
            Stocks Screener Data
          </h1>
          <Button
            variant="secondary"
            className="mb-6 p-2 ml-3"
            onClick={() =>
              router.push("/database/stock-tables/stocks-screener-data/add/")
            }
          >
            Add Stocks
          </Button>
          <table className="min-w-full text-sm border border-gray-300">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-3 py-2">
                  CompanyName
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  LastTradedPrice
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Change%
                </th>
                <th className="border border-gray-300 px-3 py-2">MarketCap</th>
                <th className="border border-gray-300 px-3 py-2">High52W</th>
                <th className="border border-gray-300 px-3 py-2">Low52W</th>
                <th className="border border-gray-300 px-3 py-2">Sector</th>
                <th className="border border-gray-300 px-3 py-2">CurrentPE</th>
                <th className="border border-gray-300 px-3 py-2">IndexName</th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  RecordDate
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  ROE
                </th>
                <th className="border border-gray-300 px-3 py-2">PBV</th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  EV_EBITDA
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  5Y Sales Growth
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  5Y Profit Growth
                </th>
                <th className="border border-gray-300 px-3 py-2">Volume</th>
                <th className="border border-gray-300 px-3 py-2">EPS</th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  EPSGrowth
                </th>
                <th className="border border-gray-300 px-3 py-2">
                  DividendYield
                </th>
                <th className="border border-gray-300 px-3 py-2">
                  DividendAmount
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  ROCE
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-center">
              {data.length > 0 ? (
                data.map((record) => (
                  <tr key={record.id} className="bg-white hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {record.CompanyName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.LastTradedPrice}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.ChangePercentage}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.MarketCap}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.High52W}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.Low52W}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.Sector}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.CurrentPE}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.IndexName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {new Date(record.RecordDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.ROE}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.PBV}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.EV_EBITDA}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.FiveYearSalesGrowth}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.FiveYearProfitGrowth}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.Volume}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.EPS}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.EPSGrowth}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.DividendYield}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.DividendAmount}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {record.ROCE}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2 flex justify-center space-x-2">
                      <Button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        onClick={() => handleEdit(record.id)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            onClick={() => setDeleteId(record.id)}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              {record.CompanyName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={22} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Home;
