"use client";
import { useEffect, useState } from "react";
import { StockScreenerValuation } from "@/types";
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
  const [data, setData] = useState<StockScreenerValuation[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/stocks_screener_valuetion/all");
      const result = await res.json();
      setData(result?.data);
    }
    fetchData();
  }, []);

  //handle delete record
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/stocks_screener_valuetion/delete", {
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
    router.push(`/database/stock-tables/stocks-valuation/${id}`);
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
        Symbol: row[0],
        MarketCap: row[1],
        MarketCapPercentage: row[2],
        PERatio: row[3],
        PSRatio: row[4],
        PBRatio: row[5],
        PCFRatio: row[6],
        PFCFRatio: row[7],
        Price: row[8],
        EnterpriseValue: row[9],
        EVRevenue: row[10],
        EVEBIT: row[11],
        EVEBITDA: row[12],
      }));

      //send data to backend
      const response = await fetch(`/api/stocks_screener_valuetion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formattedData }),
      });

      if (response.ok) {
        toast.success("Excel data imported successfully!");
        // setData((prevData) => [...prevData, ...formattedData]);
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
              router.push("/database/stock-tables/stocks-valuation/add")
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
                  Symbol
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Market Cap
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Market Cap Percentage
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  PERatio
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  PSRatio
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  PBRatio
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  PFCFRatio
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Price
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Enter prise Value
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EVRevenue
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EVEBIT
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  EVEBITDA
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
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.MarketCap}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.MarketCapPercentage}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.PERatio}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.PSRatio}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.PBRatio}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.PFCFRatio || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.Price}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {record.EnterpriseValue}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.EVRevenue}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.EVEBIT}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.EVEBITDA}
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
