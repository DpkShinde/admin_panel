"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Company } from "@/types";
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

export default function CompaniesTable() {
  const [data, setData] = useState<Company[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const limit = 10;
  const router = useRouter();

  // Fetch all companies
  const fetchData = async (pageNumber = 1) => {
    try {
      const response = await fetch(
        `/api/stock_details_tables/companies/all?page=${pageNumber}&limit=${limit}`
      );
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        setData(result?.data);
        setTotalPages(result?.totalPages);
        console.log(result);
      } else {
        toast.error("Failed to fetch companies.");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/stock_details_tables/companies/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Company deleted successfully!");
        setData((prev) => prev.filter((company) => company.id !== deleteId));
      } else {
        toast.error(result.message || "An error occurred while deleting.");
      }
    } catch (err) {
      console.error("Error deleting company:", err);
      toast.error("Server error while deleting.");
    }

    setDeleteId(null);
  };

  const handleEdit = (id: number) => {
    router.push(`/database/stock-details/companies-table/${id}`);
  };

  // handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readXlsxFile(file);

      //convert excel row to api format
      const formattedData = rows.slice(1).map((row) => ({
        name: row[0],
        market_cap_category: row[1],
      }));

      //send data to backend
      const response = await fetch(`/api/stock_details_tables/companies`, {
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
      <h1 className="text-2xl font-bold text-center mb-4 dark:text-green-900">
        Companies Table
      </h1>

      <div className="flex justify-end mb-4">
        <Button
          variant="add"
          className="p-2 ml-5 cursor-pointer hover:bg-green-800 transition"
          onClick={() => router.push("/database/stock-details/companies-table/add")}
        >
          Add Company
        </Button>

        {/* File Upload Button */}
        <label
          htmlFor="file-upload"
          className="text-center p-1 px-2 cursor-pointer bg-gray-700 text-white rounded-md hover:bg-gray-500 transition ml-2"
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
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Market Cap Category
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-center divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((company) => (
                <tr
                  key={company.id}
                  className="bg-white hover:bg-green-100 transition"
                >
                  <td className="border border-gray-300 px-4 py-2 text-left">
                    {company.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-left">
                    {company.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-left">
                    {company.market_cap_category}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex justify-center space-x-2">
                      <Button
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
                        onClick={() => handleEdit(company.id)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            onClick={() => setDeleteId(company.id)}
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
                              Are you sure you want to delete {company.name}?
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
                <td colSpan={4} className="text-center py-4">
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
  );
}
