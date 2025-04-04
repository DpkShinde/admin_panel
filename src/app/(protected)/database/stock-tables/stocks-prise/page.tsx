"use client";

import { useEffect, useState } from "react";
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
  const [data, setData] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      console.log(result)
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
    router.push(`/database/stock-tables/stocks-prise/${id}`);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await readXlsxFile(selectedFile);
      // Assuming the first row contains headers
      const headers = rows[0] as string[];
      const jsonData = rows.slice(1).map((row) => {
        const entry: { [key: string]: any } = {};
        headers.forEach((header, index) => {
          entry[header] = row[index];
        });
        return entry;
      });

      const res = await fetch("/api/stocks_prise_history/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
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
      fetchData(); // Refresh data after upload
    } catch (e: any) {
      console.error("Failed to upload file:", e);
      setError("Failed to upload file. Please check the file format.");
      toast.error("Failed to upload file. Please check the file format.");
    } finally {
      setLoading(false);
      setSelectedFile(null); // Reset selected file
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
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
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-green-800">
          Stock Price History
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
             className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
            onClick={() =>
              router.push("/database/stock-tables/stocks-prise/add")
            }
          >
            Add Stocks
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload">
              <Button
                disabled={loading}
                variant="outline"
                className="px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 transition-colors duration-300"
              >
                Select Excel File
              </Button>
            </label>
            <Button
              onClick={handleFileUpload}
              disabled={loading || !selectedFile}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Import Data"}
            </Button>
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
