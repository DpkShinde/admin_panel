"use client";
import { useEffect, useState } from "react";
import { SectorWeightage } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import readXlsxFile from "read-excel-file";
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

export default function Home() {
  const [data, setData] = useState<SectorWeightage[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/stocks_sector_weitage/all");
      const result = await res.json();
      console.log(result);
      setData(result?.data);
    }
    fetchData();
  }, []);

  //handle delete stock
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/stocks_sector_weitage/delete", {
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
    router.push(`/database/stock-tables/stocks-sector-weitage/${id}`);
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
        Sector: row[0],
        NumberOfCompanies: row[1],
        Weightage: row[2],
        MarketCap: row[3],
      }));

      //send data to backend
      const response = await fetch(`/api/stocks_sector_weitage`, {
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
              router.push("/database/stock-tables/stocks-sector-weitage/add")
            }
          >
            Add Sectors
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
          <table className="min-w-full text-sm border border-gray-300 shadow-md rounded-md">
            <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Sector
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  NumberOfCompanies
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Weightage
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  MarketCap
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
                      {record.Sector}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.NumberOfCompanies}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.Weightage}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.MarketCap}
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
                                Are you sure you want to delete {record.Sector}?
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
      </div>
    </div>
  );
}
