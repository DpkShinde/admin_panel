"use client";
import { useEffect, useState } from "react";
import type { StockScreenerData } from "../../../../../types/index";
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
  const [data, setData] = useState<StockScreenerData[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const router = useRouter();

  async function fetchData(pageNumber = 1) {
    const res = await fetch(
      `/api/stocks_screnner_data/all?page=${pageNumber}&limit=${limit}`
    );
    const result = await res.json();
    setData(result?.data);
    setTotalPages(result?.totalPages);
  }

  useEffect(() => {
    fetchData(page);
  }, [page]);

  // Delete record only after confirmation
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/stocks_screnner_data/delete", {
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
    router.push(`/database/stock-tables/stocks-screnner-data/${id}`);
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
        CompanyName: row[0],
        LastTradedPrice: row[1],
        ChangePercentage: row[2],
        MarketCap: row[3],
        High52W: row[4],
        Low52W: row[5],
        Sector: row[6],
        CurrentPE: row[7],
        IndexName: row[8],
        RecordDate: row[9],
        ROE: row[10],
        PBV: row[11],
        EV_EBITDA: row[12],
        FiveYearSalesGrowth: row[13],
        FiveYearProfitGrowth: row[14],
        Volume: row[15],
        EPS: row[16],
        EPSGrowth: row[17],
        DividendYield: row[18],
        DividendAmount: row[19],
        ROCE: row[20],
        Analyst_Rating: row[21],
        Market_cap_crore: row[22],
        sector_earnings_yoy: row[23],
        sector_earnings_yoy_per: row[24],
        Industries: row[25],
        NIFTY_50: row[26],
        NIFTY_NEXT_50: row[27],
        NIFTY_100: row[28],
        NIFTY_200: row[29],
        NIFTY_SMALLCAP_100: row[30],
        NIFTY_MIDSMALLCAP_400: row[31],
        NIFTY_LARGEMIDCAP_250: row[32],
        NIFTY_500: row[33],
      }));

      //send data to backend
      const response = await fetch(`/api/stocks_screnner_data`, {
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
            Stocks Screener Data
          </h1>
          <div className="flex justify-between">
            <Button
              variant="add"
              className="p-2 ml-5 cursor-pointer"
              onClick={() =>
                router.push("/database/stock-tables/stocks-screnner-data/add")
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
          </div>
          <div className="overflow-x-auto p-5">
            <table className="min-w-full text-sm border border-gray-300 shadow-md">
              <thead className="bg-green-700 text-white text-xs uppercase font-semibold sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Company Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    LTP
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Change%
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Market Cap
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    High 52W
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Low 52W
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Sector
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Current PE
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Index Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Record Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    ROE
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    PBV
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    EV/EBITDA
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    5Y Sales Growth
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    5Y Profit Growth
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Volume
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    EPS
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    EPS Growth
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Dividend Yield
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Dividend Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    ROCE
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Analyst Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Market_cap_crore
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    sector_earnings_yoy
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    sector_earnings_yoy_per
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Industries
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_50
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_NEXT_50
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_100
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_200
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_SMALLCAP_100
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NNIFTY_MIDSMALLCAP_400
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_LARGEMIDCAP_250
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    NIFTY_500
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-center divide-y divide-gray-200">
                {data.length > 0 ? (
                  data.map((record) => (
                    <tr key={record.id} className="bg-white hover:bg-green-100">
                      <td className="border border-gray-300 px-4 py-2 text-left">
                        {record.CompanyName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.LastTradedPrice}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.ChangePercentage}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.MarketCap}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.High52W}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.Low52W}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-left">
                        {record.Sector}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.CurrentPE}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.IndexName === null ? "-" : record.IndexName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(record.RecordDate).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.ROE}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.PBV}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.EV_EBITDA}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.FiveYearSalesGrowth}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.FiveYearProfitGrowth}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.Volume}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.EPS}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.EPSGrowth}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.DividendYield}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.DividendAmount}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.ROCE}%
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.Analyst_Rating === null
                          ? "-"
                          : record.Analyst_Rating}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.Market_cap_crore === null
                          ? "-"
                          : record.Market_cap_crore}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.sector_earnings_yoy === null
                          ? "-"
                          : record.sector_earnings_yoy}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.sector_earnings_yoy_per === null
                          ? "-"
                          : record.sector_earnings_yoy_per}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.Industries === null ? "-" : record.Industries}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_50 === null ? "-" : record.NIFTY_50}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_NEXT_50 === null
                          ? "-"
                          : record.NIFTY_NEXT_50}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_100 === null ? "-" : record.NIFTY_100}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_200 === null ? "-" : record.NIFTY_200}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_SMALLCAP_100 === null
                          ? "-"
                          : record.NIFTY_SMALLCAP_100}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_MIDSMALLCAP_400 === null
                          ? "-"
                          : record.NIFTY_MIDSMALLCAP_400}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_LARGEMIDCAP_250 === null
                          ? "-"
                          : record.NIFTY_LARGEMIDCAP_250}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.NIFTY_500 === null ? "-" : record.NIFTY_500}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex justify-center space-x-2">
                        <Button
                          className="px-2 py-1 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
                          onClick={() => handleEdit(record.id)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="px-2 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition"
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
                                Are you sure you want to delete{" "}
                                {record.CompanyName}?
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
      </div>
    </>
  );
};

export default Home;
