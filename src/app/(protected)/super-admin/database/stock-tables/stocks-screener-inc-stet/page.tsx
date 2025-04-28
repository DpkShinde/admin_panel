"use client";
import { useEffect, useState } from "react";
import { StockScreenerIncomeStatement } from "@/types";
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
  const [data, setData] = useState<StockScreenerIncomeStatement[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const router = useRouter();

  //to get all data
  async function fetchData(pageNumber = 1) {
    const res = await fetch(
      `/api/stocks_screener_inc_stet/all?page=${pageNumber}&limit=${limit}`
    );
    const result = await res.json();
    setData(result?.data);
    setTotalPages(result?.totalPages);
  }

  useEffect(() => {
    fetchData(page);
  }, [page]);

  //delete the record
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

  //handle edit
  const handleEdit = (id: number) => {
    router.push(`/super-admin/database/stock-tables/stocks-screener-inc-stet/${id}`);
  };

  //handle excel file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readXlsxFile(file);

      //convert excel row to api format
      const formattedData = rows.slice(1).map((row) => ({
        Symbol: row[0],
        Revenue: row[1],
        RevenueGrowth: row[2],
        GrossProfit: row[3],
        OperatingIncome: row[4],
        NetIncome: row[5],
        EBITDA: row[6],
        EPS_Diluted: row[7],
        EPSDilutedGrowth: row[8],
      }));

      //send data to backend
      const response = await fetch(`/api/stocks_screener_inc_stet`, {
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
          Stocks Screener Income Statement
        </h1>
        <div className="flex justify-between">
          <Button
            variant="add"
            className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
            onClick={() =>
              router.push("/super-admin/database/stock-tables/stocks-screener-inc-stet/add")
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
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Show selected file name */}
          {selectedFile && (
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
          )}
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full text-sm border border-gray-300 shadow-md rounded-md">
            <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Symbol
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Market_Cap
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Sector
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Revenue
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Revenue Growth
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Gross Profit
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Operating Income
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Net Income
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EBITDA
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EPS_Diluted
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EPS Diluted Growth
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Market_cap_crore
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  pToE
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  pToB
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  peg
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  pToS
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  pToCF
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  price
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  ev
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  evEbitda
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  evSales
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  evEbit
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  index
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  marketCapCategory
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-center divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((record) => (
                  <tr
                    key={record.id}
                    className="bg-white hover:bg-green-100 transition"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.Symbol}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.Market_cap}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.sector}
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
                      {record.Market_cap_crore}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.pToE}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.pToB}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.peg}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.pToS}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.pToCF}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.price}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.ev}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.evEbitda}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.evSales}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.evEbit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.index}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.marketCapCategory}
                    </td>
                    {/* Actions Column */}
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
