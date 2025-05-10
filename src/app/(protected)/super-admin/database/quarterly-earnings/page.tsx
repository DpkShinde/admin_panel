"use client";
import { useEffect, useState } from "react";
import { CompanyFinancialResult } from "@/types";
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

export default function Home() {
  const [data, setData] = useState<CompanyFinancialResult[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const router = useRouter();

  //get stock
  async function fetchData(pageNumber = 1) {
    const res = await fetch(
      `/api/quaterly-earnings/all?page=${pageNumber}&limit=${limit}`
    );
    const result = await res.json();
    console.log(result);
    setData(result?.data);
    setTotalPages(result?.totalPages);
  }
  useEffect(() => {
    fetchData(page);
  }, [page]);

  //delete the stock
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/quaterly-earnings/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      if (res.ok) {
        toast.success("Stock deleted successfully!");
        setData((prevData) =>
          prevData.filter((stock) => stock.company_id !== deleteId)
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
    router.push(`/super-admin/database/quarterly-earnings/${id}`);
  };

  return (
    <div className="p-5 overflow-hidden shadow-md rounded-md">
      <div className="">
        <h1 className="text-2xl font-bold text-center mb-4 dark:text-green-900">
          Quaterly Earnings
        </h1>
        <div className="flex justify-between">
          <Button
            variant="add"
            className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
            onClick={() =>
              router.push(
                "/super-admin/database/quarterly-earnings/add"
              )
            }
          >
            Add Stocks
          </Button>

          <Button onClick={() => router.push("/super-admin/database/quarterly-results/add")}>
            Add Quaterly Results
          </Button>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full text-sm border border-gray-300 shadow-md rounded-md">
            <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Company_name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Result_type
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  ltp_rs
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  market_cap
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  revenue_cr
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  change_percent
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  tentative_date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  gross_profit_percent
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  net_profit_percentss
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  tag
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  created_at
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  updated_at
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
                    key={record.company_id}
                    className="bg-white hover:bg-green-100 transition"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.company_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.result_type}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.ltp_rs}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.market_cap}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.revenue_cr}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.change_percent}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.tentative_date instanceof Date
                        ? record.tentative_date.toLocaleDateString()
                        : record.tentative_date}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.gross_profit_percent}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.net_profit_percent}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.tag}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.created_at instanceof Date
                        ? record.created_at.toLocaleDateString()
                        : record.created_at}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.updated_at instanceof Date
                        ? record.updated_at.toLocaleDateString()
                        : record.updated_at}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
                          onClick={() => {
                            handleEdit(record.company_id);
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                              onClick={() => setDeleteId(record.company_id)}
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
                                {record.company_name}?
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
                  <td colSpan={5} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* paginetion */}
        <div className="flex justify-between items-center mt-4">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
