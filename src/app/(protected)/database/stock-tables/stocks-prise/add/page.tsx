"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddStock() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({
    stock_name: "",
    stock_symbol: "",
  });
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch column names from API
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch("/api/stocks_prise_history/all");
        const json = await res.json();

        if (json.success && json.columns) {
          const dateCols = json.columns.filter((col: string) =>
            /^\d{4}-\d{2}-\d{2}$/.test(col)
          );

          // Initialize formData with empty values for each column
          const initialFormData: Record<string, any> = {
            stock_name: "",
            stock_symbol: "",
          };

          dateCols.forEach((date: string) => {
            initialFormData[date] = "";
          });

          setFormData(initialFormData);
          setDateColumns(dateCols);
        } else {
          toast.error("Failed to load columns");
        }
      } catch (err) {
        toast.error("Error fetching columns");
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name.match(/^\d{4}-\d{2}-\d{2}$/)
        ? value === "" ? "" : parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const processedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    );

    try {
      const res = await fetch("/api/stocks_prise_history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) throw new Error("Failed to add stock");

      toast.success("Stock added successfully");
      router.push("/database/stock-tables/stocks-prise");
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getWeeklyGroups = () => {
    const weeks = [];
    for (let i = 0; i < dateColumns.length; i += 7) {
      weeks.push(dateColumns.slice(i, i + 7));
    }
    return weeks;
  };

  if (loading) {
    return <div className="text-center py-10">Loading form...</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Add Stock</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="stock_name">Stock Name</Label>
              <Input
                id="stock_name"
                name="stock_name"
                placeholder="Enter stock name"
                value={formData.stock_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock_symbol">Stock Symbol</Label>
              <Input
                id="stock_symbol"
                name="stock_symbol"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={formData.stock_symbol}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {dateColumns.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-4">Price History</h3>
              {getWeeklyGroups().map((weekDates, weekIndex) => (
                <div key={`week-${weekIndex}`} className="mb-6">
                  <h4 className="font-medium mb-2">Week {weekIndex + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weekDates.map((date) => (
                      <div key={date} className="flex flex-col">
                        <Label htmlFor={date}>
                          {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Label>
                        <Input
                          id={date}
                          type="number"
                          name={date}
                          placeholder="Price"
                          step="0.01"
                          value={formData[date]}
                          onChange={handleChange}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <CardFooter className="px-0 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/database/stock-tables/stocks-prise")}
              className="w-32"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white w-32"
            >
              Add Stock
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
