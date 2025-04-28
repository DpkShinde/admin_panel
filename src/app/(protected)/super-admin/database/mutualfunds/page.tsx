"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import readXlsxFile from "read-excel-file";
import { toast } from "sonner";

interface MutualFund {
  fund_id: number;
  name: string;
  launch_date: string;
  benchmark: string;
  riskometer: string;
  turnover_percent: number;
  type: string;
  return_since_launch: number;
  min_investment: number;
  expense_ratio: number;
  min_sip: number;
  min_cheques: number;
  min_withdrawal: number;
  exit_load: string;
  remark: string;
  fund_objective: string;
}

const MutualPage: React.FC = () => {
  const router = useRouter();

  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchIpoDetails = async () => {
    try {
      const response = await fetch("/api/mutualfunds");
      if (!response.ok) throw new Error("Failed to fetch Mutual Funds");

      const result = await response.json();
      console.log("Fetched data:", result);

      if (Array.isArray(result)) {
        setMutualFunds(result);
      } else {
        throw new Error("Invalid API response: Data is not an array");
      }
    } catch (error) {
      console.error("Error fetching mutual funds:", error);
      setMutualFunds([]);
    }
  };
  useEffect(() => {
    fetchIpoDetails();
  }, []);

  const handleDeleteClick = (fund: MutualFund) => {
    setSelectedFund(fund);
    setShowDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFund) return;

    try {
      const response = await fetch(`/api/mutualfunds/${selectedFund.fund_id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete mutual fund");

      setMutualFunds((prev) =>
        prev.filter((f) => f.fund_id !== selectedFund.fund_id)
      );
      setSelectedFund(null);
      setShowDialog(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readXlsxFile(file);

      const header = rows[0];
      const dataRows = rows.slice(1);

      const groupedData: Record<string, any> = {};
      let lastFundId: number | null = null;
      let lastFundOverview: any = null;

      dataRows.forEach((row) => {
        const currentFundId =
          row[0] !== null && row[0] !== undefined ? Number(row[0]) : lastFundId;

        if (!currentFundId) return; // Skip if fund_id can't be determined

        if (!groupedData[currentFundId]) {
          const fundOverview = {
            name: row[1],
            nav: row[2],
            change_percent: row[3],
            launch_date: row[4],
            benchmark: row[5],
            riskometer: row[6],
            rating: row[7],
            turnover_percent: row[8],
            type: row[9],
            current_aum_cr: row[10],
            return_since_launch: row[11],
            min_investment: row[12],
            expense_ratio: row[13],
            min_additional_investment: row[14],
            min_sip: row[15],
            min_cheques: row[16],
            min_withdrawal: row[17],
            exit_load: row[18],
            remark: row[19],
            fund_objective: row[20],
          };

          groupedData[currentFundId] = {
            fund_id: currentFundId,
            fund_overview: fundOverview,
            performance_summary: [],
            cagr_summary: [],
            peer_comparison: [],
          };

          lastFundId = currentFundId;
          lastFundOverview = fundOverview;
        }

        // Apply last overview if current row doesn't include it
        if (
          !groupedData[currentFundId].fund_overview?.name &&
          lastFundOverview
        ) {
          groupedData[currentFundId].fund_overview = lastFundOverview;
        }

        // Append performance summary
        if (row[21] !== null) {
          groupedData[currentFundId].performance_summary.push({
            year: row[21],
            nav: row[22],
            sales_yoy_growth_cr: row[23],
            benchmark_returns: row[24],
            fund_returns: row[25],
            investor_returns: row[26],
            expense_ratio: row[27],
          });
        }

        // Append CAGR summary
        if (row[28] !== null) {
          groupedData[currentFundId].cagr_summary.push({
            period_years: row[28],
            benchmark_returns: row[29],
            fund_returns: row[30],
            investor_returns: row[31],
          });
        }

        // Append peer comparison
        if (row[32] !== null) {
          groupedData[currentFundId].peer_comparison.push({
            peer_name: row[32],
            rating: row[33],
            aum_cr: row[34],
            return_1y: row[35],
            return_3y: row[36],
            return_5y: row[37],
          });
        }
      });

      const formattedData = Object.values(groupedData);

      const response = await fetch("/api/mutualfunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (response.status === 201) {
        fetchIpoDetails();
        toast.success("File uploaded successfully!");
      } else {
        toast.error(
          `Error uploading file: ${result.message || "Unknown error"}`
        );
      }

      console.log("Upload result:", result);
    } catch (error: any) {
      toast.error(`Error uploading file: ${error.message || error}`);
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          MutualFunds Details Page
        </h1>
        <div>
          <Button
            className="mr-3.5"
            onClick={() => router.push("/super-admin/database/mutualfunds/AddMutualFund")}
          >
            Add Mutual fund
          </Button>
          <label
            htmlFor="file-upload"
            className="text-center p-[7px] px-2 cursor-pointer bg-gray-700 text-white rounded-md hover:bg-gray-500 transition"
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
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white border border-gray-200 shadow-lg min-w-max">
          <thead className="bg-green-600 text-white">
            <tr>
              {[
                "fund_id",
                "name",
                "Objective",
                "Launch_date",
                "Benchmark",
                "Riskometer",
                "Turnover %",
                "Type",
                "Returns since Launch",
                "Min Investment",
                "Exp Ratio",
                "Min SIP",
                "Min Cheque",
                "Min Withdrawal",
                "Exit Load",
                "Remark",
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
            {mutualFunds.length > 0 ? (
              mutualFunds.map((mutualfund, index) => (
                <tr
                  key={`${mutualfund.fund_id}~${index}`}
                  className="even:bg-gray-100 text-center hover:bg-gray-200 transition"
                >
                  <td className="px-4 py-2 text-black border border-gray-300 w-20">
                    {mutualfund.fund_id}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-40">
                    {mutualfund.name}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-120">
                    {mutualfund.fund_objective}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {mutualfund.launch_date.split("T")[0]
                      ? mutualfund.launch_date.split("T")[0]
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {mutualfund.benchmark}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {mutualfund.riskometer}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    {mutualfund.turnover_percent}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">
                    {mutualfund.type}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.return_since_launch}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.min_investment}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.expense_ratio}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.min_sip}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.min_cheques}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.min_withdrawal}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.exit_load}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">
                    {mutualfund.remark}
                  </td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">
                    <Button
                      onClick={() =>
                        router.push(
                          `/super-admin/database/mutualfunds/AddMutualFund?fund_id=${
                            mutualfund.fund_id
                          }&name=${encodeURIComponent(mutualfund.name)}`
                        )
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDeleteClick(mutualfund)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={17} className="text-center py-4 text-gray-500">
                  No MutualFunds found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the Mutual fund details for{" "}
              <strong>{selectedFund?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MutualPage;
