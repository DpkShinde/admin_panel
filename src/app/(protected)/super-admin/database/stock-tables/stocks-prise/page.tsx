"use client";
import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import Papa from "papaparse";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>("");
  const [showAddColumnPop, setShowAddColumnPop] = useState<boolean>(false);
  const router = useRouter();

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stocks_prise_history/all");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const result = await res.json();
      console.log(result);
      setData(result?.data || []);
    } catch (e: any) {
      console.error("Failed to fetch data:", e);
      setError("Failed to load stock data.");
      toast.error("Failed to load stock data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/stocks_prise_history/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        toast.success("Stock data deleted successfully.");
        setData((prevData) =>
          prevData.filter((stock) => stock.id !== deleteId)
        );
      } catch (e: any) {
        console.error("Failed to delete stock data:", e);
        setError("Failed to delete stock data.");
        toast.error("Failed to delete stock data.");
      } finally {
        setLoading(false);
        setDeleteId(null); // Reset deleteId after attempt
      }
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/super-admin/database/stock-tables/stocks-prise/${id}`);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      let jsonData: any[] = [];
  
      if (file.name.endsWith(".csv")) {
        // Parse CSV using PapaParse
        const text = await file.text();
        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });
  
        if (parsed.errors.length > 0) {
          console.error("CSV Parsing Errors:", parsed.errors);
          toast.error("CSV contains invalid rows. Please check the file.");
          throw new Error(`CSV parsing failed: ${parsed.errors[0].message}`);
        }
  
        const headers = parsed.meta.fields || [];
  
        if (!headers.includes("stock_name") || !headers.includes("stock_symbol")) {
          throw new Error("Missing 'stock_name' or 'stock_symbol' headers in CSV.");
        }
  
        jsonData = parsed.data.map((row: any) => {
          const entry: { [key: string]: any } = {
            stock_name: row.stock_name,
            stock_symbol: row.stock_symbol,
          };
  
          Object.entries(row).forEach(([key, value]) => {
            if (key !== "stock_name" && key !== "stock_symbol") {
              entry[key] = value === "" ? null : Number(value) || 0;
            }
          });
  
          return entry;
        });
  
      } else {
        // Parse Excel (.xlsx or .xls) using read-excel-file
        const rows = await readXlsxFile(file);
        const headers = rows[0] as string[];
  
        jsonData = rows.slice(1).map((row) => {
          const entry: { [key: string]: any } = {
            stock_name: row[0],
            stock_symbol: row[1],
          };
  
          for (let i = 2; i < headers.length; i++) {
            const dateKey = headers[i];
            const value = row[i];
            if (dateKey && value !== undefined) {
              entry[dateKey] =
                typeof value === "number" ? value : Number(value) || 0;
            }
          }
  
          return entry;
        });
      }
  
      // POST to your backend API
      const res = await fetch("/api/stocks_prise_history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: jsonData }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `Failed to upload data: ${res.status} - ${
            errorData?.message || res.statusText
          }`
        );
      }
  
      toast.success("Stock data uploaded successfully.");
      fetchData(); // refresh the list or table after upload
  
    } catch (e: any) {
      console.error("Failed to upload file:", e);
      setError("Failed to upload file. Please check the file format.");
      toast.error("Failed to upload file. Please check the file format.");
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  const handleAddColumn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stocks_prise_history/addCol`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colName: newDate }),
      });

      if (!response.ok) {
        toast.error("unable to add column");
      }

      toast.success(`Column '${newDate}' added successfully.`);
      setNewDate("");
      setShowAddColumnPop(false);
      fetchData();
    } catch (error: any) {
      console.error("Failed to add date column:", error);
      setError("Failed to add date column.");
      toast.error("Failed to add date column.");
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique dates from the data for dynamic column headers
  const allDates = data.reduce((acc: string[], record) => {
    Object.keys(record).forEach((key) => {
      if (
        key !== "id" &&
        key !== "stock_name" &&
        key !== "stock_symbol" &&
        !acc.includes(key)
      ) {
        acc.push(key);
      }
    });
    return acc;
  }, []);

  return (
    <div className="p-6 shadow-lg rounded-lg bg-white max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-green-800">
          Stock Price History
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
            onClick={() =>
              router.push("/super-admin/database/stock-tables/stocks-prise/add")
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
          <div>
            {/* for add column  */}
            <Button
              variant={"addDate"}
              onClick={() => {
                setShowAddColumnPop(true);
              }}
            >
              {" "}
              + Add Date Column
            </Button>
            {showAddColumnPop && (
              <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add New Column
                  </h2>
                  <Input
                    type="date"
                    placeholder="Column Name"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddColumnPop(false)}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md shadow transition"
                    >
                      Add Column
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-green-600 rounded-full mb-2"></div>
            <p className="text-green-800">Loading stock data...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-green-700 to-green-800">
              <tr>
                <th className="sticky left-0 px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-inherit z-10">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Symbol
                </th>
                {allDates.map((date) => (
                  <th
                    key={date}
                    className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {date}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-green-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="sticky left-0 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-inherit z-10">
                      {record.stock_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.stock_symbol}
                    </td>
                    {allDates.map((date) => (
                      <td
                        key={date}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right"
                      >
                        {typeof record[date] === "number"
                          ? record[date].toFixed(2)
                          : record[date]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-center gap-2">
                        <Button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                          onClick={() => handleEdit(record.id)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                              onClick={() => setDeleteId(record.id)}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-lg border border-gray-200 shadow-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold text-gray-800">
                                Confirm Deletion
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold">
                                  {record.stock_symbol}
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex gap-2 mt-4">
                              <AlertDialogCancel
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-300"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                              >
                                Delete
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
                  <td
                    colSpan={allDates.length + 3}
                    className="px-6 py-12 text-center text-gray-500 italic"
                  >
                    No stock data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
