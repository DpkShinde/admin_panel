"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

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

interface Performance {
  benchmark_returns: string;
  expense_ratio: number;
  fund_returns: string;
  investor_returns: string;
  nav: number;
  sales_yoy_growth_cr: string;
  year: string;
}

interface Cagr {
  benchmark_returns: number;
  fund_returns: number;
  investor_returns: number;
  period_years: string;
}

interface PeerComparisons {
  peer_name: string;
  aum_cr: number;
  return_1y: number;
  return_3y: number;
  return_5y: number;
  rating: string;
}

// Helper function to ensure values are not null
const ensureNotNull = (value: any, defaultValue: any) => {
  return value === null || value === undefined ? defaultValue : value;
};

const AddMutualFundPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fund_id = searchParams.get("fund_id");
  const name = searchParams.get("name");

  const [mutualFund, setMutualFund] = useState<MutualFund>({
    fund_id: fund_id ? Number(fund_id) || 0 : 0,
    name: name || "",
    launch_date: "",
    benchmark: "",
    riskometer: "",
    turnover_percent: 0,
    type: "",
    return_since_launch: 0,
    min_investment: 0,
    expense_ratio: 0,
    min_sip: 0,
    min_cheques: 0,
    min_withdrawal: 0,
    exit_load: "",
    remark: "",
    fund_objective: "",
  });

  const emptyPerfSummary: Performance = {
    benchmark_returns: "",
    expense_ratio: 0,
    fund_returns: "",
    investor_returns: "",
    nav: 0,
    sales_yoy_growth_cr: "",
    year: "",
  };

  const [perfSummary, setPerfSummary] = useState<Performance[]>([
    { ...emptyPerfSummary },
  ]);

  const emptyCagrSummary: Cagr = {
    benchmark_returns: 0,
    fund_returns: 0,
    investor_returns: 0,
    period_years: "",
  };

  const [cagrSummary, setCagrSummary] = useState<Cagr[]>([
    { ...emptyCagrSummary },
  ]);

  const emptyPeerComparison: PeerComparisons = {
    peer_name: "",
    aum_cr: 0,
    return_1y: 0,
    return_3y: 0,
    return_5y: 0,
    rating: "",
  };

  const [peerComparison, setPeerComparison] = useState<PeerComparisons[]>([
    { ...emptyPeerComparison },
  ]);

  useEffect(() => {
    const fetchFundDetails = async () => {
      if (mutualFund.fund_id) {
        try {
          const response = await fetch(
            `/api/mutualfunds/${mutualFund.fund_id}`
          );
          if (!response.ok) throw new Error("Failed to fetch MutualFunds");

          const result = await response.json();
          console.log("Fetched data:", result);

          if (result?.funds && typeof result.funds === "object") {
            // Ensure no null values in the mutual fund data
            const sanitizedFund = {
              ...result.funds,
              fund_id: ensureNotNull(result.funds.fund_id, 0),
              name: ensureNotNull(result.funds.name, ""),
              launch_date: result.funds.launch_date
                ? result.funds.launch_date.split("T")[0]
                : "",
              benchmark: ensureNotNull(result.funds.benchmark, ""),
              riskometer: ensureNotNull(result.funds.riskometer, ""),
              turnover_percent: ensureNotNull(result.funds.turnover_percent, 0),
              type: ensureNotNull(result.funds.type, ""),
              return_since_launch: ensureNotNull(
                result.funds.return_since_launch,
                0
              ),
              min_investment: ensureNotNull(result.funds.min_investment, 0),
              expense_ratio: ensureNotNull(result.funds.expense_ratio, 0),
              min_sip: ensureNotNull(result.funds.min_sip, 0),
              min_cheques: ensureNotNull(result.funds.min_cheques, 0),
              min_withdrawal: ensureNotNull(result.funds.min_withdrawal, 0),
              exit_load: ensureNotNull(result.funds.exit_load, ""),
              remark: ensureNotNull(result.funds.remark, ""),
              fund_objective: ensureNotNull(result.funds.fund_objective, ""),
            };
            setMutualFund(sanitizedFund);
          }

          if (
            result?.performance_summary &&
            Array.isArray(result.performance_summary)
          ) {
            // Ensure no null values in the performance summary data
            const sanitizedPerf = result.performance_summary.map(
              (perf: any) => ({
                benchmark_returns: ensureNotNull(perf.benchmark_returns, ""),
                expense_ratio: ensureNotNull(perf.expense_ratio, 0),
                fund_returns: ensureNotNull(perf.fund_returns, ""),
                investor_returns: ensureNotNull(perf.investor_returns, ""),
                nav: ensureNotNull(perf.nav, 0),
                sales_yoy_growth_cr: ensureNotNull(
                  perf.sales_yoy_growth_cr,
                  ""
                ),
                year: ensureNotNull(perf.year, ""),
              })
            );
            setPerfSummary(
              sanitizedPerf.length > 0
                ? sanitizedPerf
                : [{ ...emptyPerfSummary }]
            );
          }

          if (result?.cagr_Summary && Array.isArray(result.cagr_Summary)) {
            // Ensure no null values in the CAGR summary data
            const sanitizedCagr = result.cagr_Summary.map((cagr: any) => ({
              benchmark_returns: ensureNotNull(cagr.benchmark_returns, 0),
              fund_returns: ensureNotNull(cagr.fund_returns, 0),
              investor_returns: ensureNotNull(cagr.investor_returns, 0),
              period_years: ensureNotNull(cagr.period_years, ""),
            }));
            setCagrSummary(
              sanitizedCagr.length > 0
                ? sanitizedCagr
                : [{ ...emptyCagrSummary }]
            );
          }

          if (
            result?.peer_comparison &&
            Array.isArray(result.peer_comparison)
          ) {
            // Ensure no null values in the peer comparison data
            const sanitizedPeer = result.peer_comparison.map((peer: any) => ({
              peer_name: ensureNotNull(peer.peer_name, ""),
              aum_cr: ensureNotNull(peer.aum_cr, 0),
              return_1y: ensureNotNull(peer.return_1y, 0),
              return_3y: ensureNotNull(peer.return_3y, 0),
              return_5y: ensureNotNull(peer.return_5y, 0),
              rating: ensureNotNull(peer.rating, ""),
            }));
            setPeerComparison(
              sanitizedPeer.length > 0
                ? sanitizedPeer
                : [{ ...emptyPeerComparison }]
            );
          }
        } catch (error) {
          console.error("Error fetching fund details:", error);
        }
      }
    };

    fetchFundDetails();
  }, [mutualFund.fund_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMutualFund((prev) => ({
      ...prev,
      [name]:
        typeof prev[name as keyof MutualFund] === "number"
          ? Number(value) || 0
          : value,
    }));
  };

  const handlePerformanceChange = (
    index: number,
    field: keyof Performance,
    value: string | number
  ) => {
    setPerfSummary((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]:
          typeof updated[index][field] === "number"
            ? Number(value) || 0
            : value,
      };
      return updated;
    });
  };

  const addPerformanceSummary = () => {
    setPerfSummary((prev) => [...prev, { ...emptyPerfSummary }]);
  };

  const removePerformanceSummary = (index: number) => {
    setPerfSummary((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = fund_id ? "PUT" : "POST";
      const endpoint = fund_id
        ? `/api/mutualfunds/${fund_id}`
        : "/api/mutualfunds";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funds: mutualFund,
          performance_summary: perfSummary,
          cagr_Summary: cagrSummary,
          peer_comparison: peerComparison,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${fund_id ? "update" : "create"} mutual fund`
        );
      }

      router.push("/super-admin/database/mutualfunds");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleCagrChange = (
    index: number,
    field: keyof Cagr,
    value: string | number
  ) => {
    setCagrSummary((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]:
          typeof updated[index][field] === "number"
            ? Number(value) || 0
            : value,
      };
      return updated;
    });
  };

  const addCagrSummary = () => {
    setCagrSummary((prev) => [...prev, { ...emptyCagrSummary }]);
  };

  const removeCagrSummary = (index: number) => {
    setCagrSummary((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePeerChange = (
    index: number,
    field: keyof PeerComparisons,
    value: string | number
  ) => {
    setPeerComparison((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]:
          typeof updated[index][field] === "number"
            ? Number(value) || 0
            : value,
      };
      return updated;
    });
  };

  const addPeerComparison = () => {
    setPeerComparison((prev) => [...prev, { ...emptyPeerComparison }]);
  };

  const removePeerComparison = (index: number) => {
    setPeerComparison((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-256 mx-auto p-4 shadow-lg rounded-xl">
      <CardContent>
        <h2 className="text-xl text-center font-semibold mb-4">
          {fund_id ? "Edit Mutual Fund" : "Add Mutual Fund"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Fund Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Fund Name</label>
              <Input
                name="name"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Launch Date</label>
              <Input
                name="launch_date"
                type="date"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.launch_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Benchmark</label>
              <Input
                name="benchmark"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.benchmark}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Riskometer</label>
              <Input
                name="riskometer"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.riskometer}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Turnover %</label>
              <Input
                name="turnover_percent"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.turnover_percent}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Type</label>
              <Input
                name="type"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.type}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Return Since Launch
              </label>
              <Input
                name="return_since_launch"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.return_since_launch}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Min Investment</label>
              <Input
                name="min_investment"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.min_investment}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Expense Ratio</label>
              <Input
                name="expense_ratio"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.expense_ratio}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Min SIP</label>
              <Input
                name="min_sip"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.min_sip}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Min Cheques</label>
              <Input
                name="min_cheques"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.min_cheques}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Min Withdrawal</label>
              <Input
                name="min_withdrawal"
                type="number"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.min_withdrawal}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Exit Load</label>
              <Input
                name="exit_load"
                className="shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                value={mutualFund.exit_load}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Remark</label>
              <textarea
                name="remark"
                value={mutualFund.remark}
                onChange={handleChange}
                className="w-full p-2 border rounded shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Fund Objective</label>
              <textarea
                name="fund_objective"
                value={mutualFund.fund_objective}
                onChange={handleChange}
                className="w-full p-2 border rounded shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              />
            </div>
          </div>

          {/* Performance Summary Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Performance Summary</h2>
              <Button
                type="button"
                variant="outline"
                className="shadow-sm border border-gray-300 flex items-center"
                onClick={addPerformanceSummary}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                Add Year
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full border border-gray-300">
                <TableHeader className="bg-green-700 text-white">
                  <TableRow>
                    <TableHead className="border border-gray-300">
                      Year
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Fund Returns
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Benchmark Returns
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Investor Returns
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      NAV
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Expense Ratio
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Sales YoY Growth (Cr)
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfSummary.map((perf, index) => (
                    <TableRow key={index} className="border border-gray-200">
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          placeholder="e.g. 2023-24"
                          value={perf.year}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "year",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          value={perf.fund_returns}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "fund_returns",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          value={perf.benchmark_returns}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "benchmark_returns",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          value={perf.investor_returns}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "investor_returns",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          value={perf.nav}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "nav",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          value={perf.expense_ratio}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "expense_ratio",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          value={perf.sales_yoy_growth_cr}
                          onChange={(e) =>
                            handlePerformanceChange(
                              index,
                              "sales_yoy_growth_cr",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 text-center">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePerformanceSummary(index)}
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* CAGR Summary Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">CAGR Summary</h2>
              <Button
                type="button"
                variant="outline"
                className="shadow-sm border border-gray-300 flex items-center"
                onClick={addCagrSummary}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                Add CAGR
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full border border-gray-300">
                <TableHeader className="bg-green-700 text-white">
                  <TableRow>
                    <TableHead className="border border-gray-300">
                      Period (Years)
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Fund Returns (%)
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Benchmark Returns (%)
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Investor Returns (%)
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cagrSummary.map((cagr, index) => (
                    <TableRow key={index} className="border border-gray-200">
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          placeholder="e.g. 1Y, 3Y, 5Y"
                          value={cagr.period_years}
                          onChange={(e) =>
                            handleCagrChange(
                              index,
                              "period_years",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={cagr.fund_returns}
                          onChange={(e) =>
                            handleCagrChange(
                              index,
                              "fund_returns",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={cagr.benchmark_returns}
                          onChange={(e) =>
                            handleCagrChange(
                              index,
                              "benchmark_returns",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={cagr.investor_returns}
                          onChange={(e) =>
                            handleCagrChange(
                              index,
                              "investor_returns",
                              e.target.value
                            )
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 text-center">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCagrSummary(index)}
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Peer Comparison</h2>
              <Button
                type="button"
                variant="outline"
                className="shadow-sm border border-gray-300 flex items-center"
                onClick={addPeerComparison}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                Add Peers
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full border border-gray-300">
                <TableHeader className="bg-green-700 text-white">
                  <TableRow>
                    <TableHead className="border border-gray-300">
                      Name
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      Rating
                    </TableHead>
                    <TableHead className="border border-gray-300">
                      AUM (Cr)
                    </TableHead>
                    <TableHead className="border border-gray-300">1Y</TableHead>
                    <TableHead className="border border-gray-300">3Y</TableHead>
                    <TableHead className="border border-gray-300">5Y</TableHead>
                    <TableHead className="border border-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peerComparison.map((peer, index) => (
                    <TableRow key={index} className="border border-gray-200">
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          placeholder="Name"
                          value={peer.peer_name}
                          onChange={(e) =>
                            handlePeerChange(index, "peer_name", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="text"
                          value={peer.rating}
                          onChange={(e) =>
                            handlePeerChange(index, "rating", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={peer.aum_cr}
                          onChange={(e) =>
                            handlePeerChange(index, "aum_cr", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={peer.return_1y}
                          onChange={(e) =>
                            handlePeerChange(index, "return_1y", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={peer.return_3y}
                          onChange={(e) =>
                            handlePeerChange(index, "return_3y", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300">
                        <Input
                          type="number"
                          step="0.01"
                          value={peer.return_5y}
                          onChange={(e) =>
                            handlePeerChange(index, "return_5y", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </TableCell>
                      <TableCell className="border border-gray-300 text-center">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePeerComparison(index)}
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {fund_id ? "Update Fund" : "Add Fund"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddMutualFundPage;
