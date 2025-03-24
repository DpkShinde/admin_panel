"use client";
import { useEffect, useState } from "react";
import { SectorWeightage } from "@/types";
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

export default function Home() {
  const [data, setData] = useState<SectorWeightage[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
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

  // Delete record only after confirmation
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

  return (
    <div className="ml-42">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          Stocks Screener Valuation
        </h1>
        <Button
          variant="default"
          className="mb-6"
          onClick={() =>
            router.push("/database/stock-tables/stocks-sector-weitage/add")
          }
        >
          Add Sectors
        </Button>
        <table className="border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Sector</th>
              <th className="border border-gray-300 px-4 py-2">
                NumberOfCompanies
              </th>
              <th className="border border-gray-300 px-4 py-2">Weightage</th>
              <th className="border border-gray-300 px-4 py-2">MarketCap</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {data.length > 0 ? (
              data.map((record) => (
                <tr key={record.id} className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
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
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="flex justify-center space-x-2">
                      <Button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        onClick={() => {
                          handleEdit(record.id);
                        }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
                <td colSpan={13} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
