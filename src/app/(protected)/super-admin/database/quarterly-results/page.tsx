"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EarningResult {
  id: number;
  company_id: number;
  image_url: string;
  title: string;
  MainContent: string;
  created_date: string;
}

export default function EarningResultsList() {
  const [results, setResults] = useState<EarningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/earning-results/all");
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setResults(data);
      } catch (err: any) {
        console.error("Error fetching earning results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this earning result?")) {
      try {
        const response = await fetch(`/api/earning-results/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Error deleting data: ${response.status}`
          );
        }
        setResults(results.filter((result) => result.id !== id));
        alert("Earning result deleted successfully.");
      } catch (err: any) {
        console.error("Failed to delete earning result:", err);
        alert(`Failed to delete earning result: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading earning results...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading earning results: {error}
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error: any) {
      console.log("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Earning Results</h1>

      <div className="flex justify-end mb-4">
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() =>
            router.push("/super-admin/database/quarterly-results/add")
          }
        >
          Add New Result
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.company_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(result.created_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/super-admin/database/quarterly-results/${result.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-300 ease-in-out"
                  >
                    View/Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(result.id)}
                    className="text-red-600 hover:text-red-900 transition duration-300 ease-in-out"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {results.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No earning results found.
          </div>
        )}
      </div>
    </div>
  );
}
