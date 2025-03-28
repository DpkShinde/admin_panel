"use client";
import { useEffect, useState } from "react";
import type {
  FundDetails,
  StockScreenerData,
} from "../../../../../types/index";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

const Home = () => {
  const [data, setData] = useState<FundDetails[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  async function fetchData() {
    const res = await fetch("/api/funds/all");
    const result = await res.json();
    setData(result?.data);
    console.log(data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Delete record only after confirmation
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/funds/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      if (res.ok) {
        toast.success("Fund deleted successfully!");
        setData((prevData) =>
          prevData.filter((stock) => stock.ID !== deleteId)
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
    router.push(`/database/Funds/fund_details/${id}`);
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
        Scheme_Name: row[0],
        Scheme_Code: row[1],
        Scheme_Type: row[2],
        Sub_Category: row[3],
        NAV: row[4],
        AuM_Cr: row[5],
        Column_1D_Change: row[6],
        NAV_Date: row[7],
        Column_52W_High: row[8],
        Column_52WH_as_on: row[9],
        Column_52W_Low: row[10],
        Column_52WL_as_on: row[11],
        Column_1W: row[12],
        Column_1M: row[13],
        Column_3M: row[14],
        Column_6M: row[15],
        YTD: row[16],
        Column_1Y: row[17],
        Column_2Y: row[18],
        Column_3Y: row[19],
        Column_5Y: row[20],
        Column_10Y: row[21],
      }));

      //send data to backend
      const response = await fetch(`/api/funds`, {
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
    <>
      <div className="ml-1 p-5 overflow-hidden shadow-lg rounded-md">
        <div className="">
          <h1 className="text-2xl font-bold text-center mb-4 dark:text-green-900">
            Fund Details
          </h1>
          <div className="flex justify-between">
            <Button
              variant="add"
              className="p-2 ml-5 cursor-pointer"
              onClick={() => router.push("/database/Funds/fund_details/add")}
            >
              Add Funds
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
            <table className="min-w-full text-sm border border-gray-300 shadow-md">
              <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Scheme_Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Scheme_Code
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Scheme_Type
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Sub_Category
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    NAV
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    AuM_Cr
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Column_1D_Change
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NAV_Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Column_52W_High
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_52WH_as_on
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_52W_Low
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_52WL_as_on
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_1W
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_1M
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_3M
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Column_6M
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    YTD
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_1Y
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_2Y
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_3Y
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_5Y
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Column_10Y
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-center divide-y divide-gray-200">
                {data && data.length > 0 ? (
                  data.map((record) => (
                    <tr key={record.ID} className="bg-white hover:bg-green-100">
                      <td className="border px-4 py-2">{record.Scheme_Name}</td>
                      <td className="border px-4 py-2">{record.Scheme_Code}</td>
                      <td className="border px-4 py-2">{record.Scheme_Type}</td>
                      <td className="border px-4 py-2">
                        {record.Sub_Category}
                      </td>
                      <td className="border px-4 py-2">{record.NAV}</td>
                      <td className="border px-4 py-2">{record.AuM_Cr}</td>
                      <td className="border px-4 py-2">
                        {record.Column_1D_Change}
                      </td>
                      <td className="border px-4 py-2">{record.NAV_Date}</td>
                      <td className="border px-4 py-2">
                        {record.Column_52W_High}
                      </td>
                      <td className="border px-4 py-2">
                        {record.Column_52WH_as_on}
                      </td>
                      <td className="border px-4 py-2">
                        {record.Column_52W_Low}
                      </td>
                      <td className="border px-4 py-2">
                        {record.Column_52WL_as_on}
                      </td>
                      <td className="border px-4 py-2">{record.Column_1W}</td>
                      <td className="border px-4 py-2">{record.Column_1M}</td>
                      <td className="border px-4 py-2">{record.Column_3M}</td>
                      <td className="border px-4 py-2">{record.Column_6M}</td>
                      <td className="border px-4 py-2">{record.YTD}</td>
                      <td className="border px-4 py-2">{record.Column_1Y}</td>
                      <td className="border px-4 py-2">{record.Column_2Y}</td>
                      <td className="border px-4 py-2">{record.Column_3Y}</td>
                      <td className="border px-4 py-2">{record.Column_5Y}</td>
                      <td className="border px-4 py-2">{record.Column_10Y}</td>
                      <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                        <Button
                          className="px-2 py-1 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
                          onClick={() => handleEdit(record.ID)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="px-2 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition"
                              onClick={() => setDeleteId(record.ID)}
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
                                {record.Scheme_Name}?
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
      </div>
    </>
  );
};

export default Home;
