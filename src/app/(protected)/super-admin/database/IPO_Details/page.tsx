"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define a more specific type for the ipo
interface ipodetail {
  company_id: string;
  name: string;
  industry: string;
  description: string;
  total_yarn_varieties: number;
  active_yarn_varieties: number;
  customer_count: number;
  established_year: number;
}

const IpoDetailsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iposDetails, setIpoDetails] = useState<ipodetail[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ipoToDelete, setIpoToDelete] = useState<ipodetail | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchIpoDetails = async () => {
      try {
        const response = await fetch("/api/ipodetails");
        if (!response.ok) throw new Error("Failed to fetch IPO's");

        const result = await response.json();
        console.log("Fetched data:", result);

        if (Array.isArray(result)) {
          setIpoDetails(result);
        } else {
          throw new Error("Invalid API response: Data is not an array");
        }
      } catch (error) {
        console.error("Error fetching IPOs:", error);
        setIpoDetails([]);
      }
    };
    fetchIpoDetails();
  }, []);

  const handleDeleteClick = (ipo: ipodetail) => {
    setIpoToDelete(ipo);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!ipoToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/ipodetails/${ipoToDelete.company_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete IPO: ${response.statusText}`);
      }

      // Remove the deleted IPO from the state
      setIpoDetails(
        iposDetails.filter((ipo) => ipo.company_id !== ipoToDelete.company_id)
      );
      setError(null);
    } catch (error) {
      console.error("Error deleting IPO:", error);
      setError("Failed to delete IPO. Please try again later.");
    } finally {
      setIsDeleteDialogOpen(false);
      setIpoToDelete(null);
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setIpoToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          IPO Details Page
        </h1>
        <Button
          onClick={() =>
            router.push("/super-admin/database/IPO_Details/AddIPO")
          }
        >
          Add IPO Details
        </Button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white border border-gray-200 shadow-lg min-w-max">
          <thead className="bg-green-600 text-white">
            <tr>
              {[
                "company_id",
                "name",
                "industry",
                "description",
                "total_yarn_varieties",
                "active_yarn_varieties",
                "customer_count",
                "established_year",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-sm font-semibold border border-gray-300 text-center"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {iposDetails.length > 0 ? (
              iposDetails.map((ipo, index) => (
                <tr
                  key={`${ipo.company_id}~${index}`}
                  className="even:bg-gray-100 text-center hover:bg-gray-200 transition"
                >
                  <td className="px-4 py-2 text-black border border-gray-300 w-20">
                    {ipo.company_id}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {ipo.name}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {ipo.industry}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-120">
                    {ipo.description}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {ipo.total_yarn_varieties}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {ipo.active_yarn_varieties}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">
                    {ipo.customer_count}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {ipo.established_year}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    <Button
                      onClick={() =>
                        router.push(
                          `/super-admin/database/IPO_Details/AddIPO?company_id=${
                            ipo.company_id
                          }&name=${encodeURIComponent(ipo.name)}`
                        )
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </Button>

                    <button
                      onClick={() => handleDeleteClick(ipo)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No IPO Details found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the IPO details for{" "}
              {ipoToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={cancelDelete} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IpoDetailsPage;
