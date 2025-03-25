"use client";
import { useEffect, useState } from "react";
import { StockScreenerIncomeStatement } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
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

export default function Dashboard() {
  const [data, setData] = useState<StockScreenerIncomeStatement[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/stocks_screener_inc_stet/all");
      const result = await res.json();
      console.log(result);
      setData(result?.data);
    }
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/stocks_screener_inc_stet/delete", {
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

  const handleEdit = (id: number) => {
    router.push(`/database/stock-tables/stocks-screener-inc-stet/${id}`);
  };

  return (
    <div className="p-5 overflow-hidden shadow-md rounded-md">
      <div className="">
        <h1 className="text-2xl font-bold text-center mb-4 dark:text-green-900">
          Stocks Screener Income Statement
        </h1>
        <Button
          variant="add"
          className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
          onClick={() =>
            router.push("/database/stock-tables/stocks-screener-inc-stet/add")
          }
        >
          Add Stocks
        </Button>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full text-sm border border-gray-300 shadow-md rounded-md">
            <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Symbol
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Revenue
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  RevenueGrowth
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  GrossProfit
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  OperatingIncome
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  NetIncome
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EBITDA
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EPS_Diluted
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EPSDilutedGrowth
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-center divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((record) => (
                  <tr
                    key={record.id}
                    className="bg-white hover:bg-green-100 transition"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.Symbol}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.Revenue}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.RevenueGrowth}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.GrossProfit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.OperatingIncome}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.NetIncome}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.EBITDA}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.EPS_Diluted}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.EPSDilutedGrowth}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
                          onClick={() => {
                            handleEdit(record.id);
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
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
                                Are you sure you want to delete {record.Symbol}?
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
