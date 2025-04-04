"use client";
"use client";
import { useEffect, useState } from "react";
import { StockList, StockScreenerValuation } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import readXlsxFile from "read-excel-file";

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
  const [data, setData] = useState<StockList[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/stocks_list/all");
      const result = await res.json();
      console.log(result);
      setData(result?.data);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load stock data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  //handle delete record
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/stocks_list/delete", {
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
    router.push(`/database/stock-tables/stocks_list/${id}`);
  };

  //handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readXlsxFile(file);

      //convert excel row to api format
      const formattedData = rows.slice(1).map((row) => ({
        company: row[0],
        ltp_inr: row[1],
        change_percent: row[2],
        market_cap_cr: row[3],
        roe: row[4],
        pe: row[5],
        pbv: row[6],
        ev_ebitda: row[7],
        sales_growth_5y: row[8],
        clarification: row[9],
        sector: row[10],
        High_52W_INR: row[11],
        Low_52W_INR: row[12],
        stock_index: row[13],
        event_date: row[14],
      }));

      //send data to backend
      const response = await fetch(`/api/stocks_list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formattedData }),
      });

      if (response.ok) {
        toast.success("Excel data imported successfully!");
        fetchData();
      } else {
        console.error("Error reading Excel file:");
        toast.error("Invalid file format.");
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className="p-5 overflow-hidden shadow-md rounded-md">
      <div className="">
        <h1 className="text-2xl font-bold text-center mb-4 dark:text-green-900">
          Stocks Screener Valuation
        </h1>
        <div className="flex justify-between">
          <Button
            variant="add"
            className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
            onClick={() =>
              router.push("/database/stock-tables/stocks_list/add")
            }
          >
            Add Stocks
          </Button>

          {/* File Upload Button */}
          <label
            htmlFor="file-upload"
            className="text-center p-1 px-2 cursor-pointer bg-gray-700 text-white rounded-md hover:bg-gray-500 transition"
          >
            Upload Excel
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Show selected file name */}
          {selectedFile && (
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
          )}
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full text-sm border border-gray-300  rounded-md">
            <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  company
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  ltp_inr
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  change_percent
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  market_cap_cr
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  roe
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  pe
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  pbv
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  ev_ebitda
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  sales_growth_5y
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  profit_growth_5y
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  clarification
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  sector
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  High_52W_INR
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Low_52W_INR
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  stock_index
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  event_date
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
                      {record.company}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.ltp_inr}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.change_percent}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.market_cap_cr}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.roe}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.pe}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.pbv || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.ev_ebitda}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.sales_growth_5y}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.profit_growth_5y}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.clarification}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.sector}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.High_52W_INR}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.Low_52W_INR}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.stock_index}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.event_date}
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
                                Are you sure you want to delete {record.company}
                                ?
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
                  <td colSpan={13} className="text-center py-4">
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
