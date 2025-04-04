"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddStock() {
  const router = useRouter();
  
  // Generate dates for April 2025
  const generateAprilDates = () => {
    const dates: Record<string, string> = {};
    for (let day = 1; day <= 30; day++) {
      const formattedDay = day.toString().padStart(2, '0');
      dates[`2025-04-${formattedDay}`] = "";
    }
    return dates;
  };

  const [formData, setFormData] = useState({
    stock_name: "",
    stock_symbol: "",
    ...generateAprilDates()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For price fields, ensure they're valid numbers
    if (name.startsWith('2025-04')) {
      const numValue = value === "" ? "" : parseFloat(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty string values to null before sending
    const processedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value === "" ? null : value,
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
      toast.error(`Error adding stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Group dates by week for better UI organization
  const getWeeklyGroups = () => {
    const weeks = [];
    const datesToShow = Object.keys(formData).filter(key => key.startsWith("2025-04"));
    
    for (let i = 0; i < datesToShow.length; i += 7) {
      weeks.push(datesToShow.slice(i, i + 7));
    }
    
    return weeks;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
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
                className="mt-1"
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
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium text-lg mb-4">April 2025 Price History</h3>
            
            {getWeeklyGroups().map((weekDates, weekIndex) => (
              <div key={`week-${weekIndex}`} className="mb-6">
                <h4 className="font-medium mb-2">Week {weekIndex + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weekDates.map(date => {
                    const dayNumber = parseInt(date.slice(8));
                    return (
                      <div key={date} className="flex flex-col">
                        <Label htmlFor={date} className="text-sm">
                          {new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Label>
                        <Input
                          id={date}
                          type="number"
                          name={date}
                          placeholder="Price"
                          step="0.01"
                          value={formData[date as keyof typeof formData]}
                          onChange={handleChange}
                          className="mt-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
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