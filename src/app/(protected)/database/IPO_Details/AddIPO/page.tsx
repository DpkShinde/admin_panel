"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

interface Company {
  company_id: number;
  name: string;
  industry: string;
  description: string;
  total_yarn_varieties: number;
  active_yarn_varieties: number;
  customer_count: number;
  established_year: number;
}

interface IpoDetails {
  opening_date: string;
  closing_date: string;
  allotment_date: string;
  refund_date: string;
  listing_date: string;
  lot_size: number;
  min_investment: number;
  price_band_max: number;
  price_band_min: number;
  face_value: number;
  shares_offered: number;
  offer_for_sale: number;
  fresh_issue: number;
  offer_to_public: number;
  purpose: string;
}

interface Financial {
  fiscal_year: string;
  revenue: number;
  ebit: number;
  pat: number;
  net_worth: number;
  total_debt: number;
}

interface Ratios {
  debt_to_equity: number;
  ebit_margin: number;
  fiscal_year: string;
  roce: number;
  roe: number;
}

interface Subscription {
  category: string;
  subscription_times: number;
}

export default function AddCompany() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract parameters from URL if available
  const company_id = searchParams.get("company_id");
  const name = searchParams.get("name");

  // Initialize state with data from URL (if editing) or default values
  const [company, setCompany] = useState<Company>({
    company_id: company_id ? Number(company_id) : 0,
    name: name || "",
    industry: "",
    description: "",
    total_yarn_varieties: 0,
    active_yarn_varieties: 0,
    customer_count: 0,
    established_year: 0,
  });

  const [ipoDetails, setIpoDetails] = useState<IpoDetails>({
    opening_date: "",
    closing_date: "",
    allotment_date: "",
    refund_date: "",
    listing_date: "",
    lot_size: 0,
    min_investment: 0,
    price_band_max: 0,
    price_band_min: 0,
    face_value: 0,
    shares_offered: 0,
    offer_for_sale: 0,
    fresh_issue: 0,
    offer_to_public: 0,
    purpose: "",
  });

  const emptyFinancial: Financial = {
    fiscal_year: "",
    revenue: 0,
    ebit: 0,
    pat: 0,
    net_worth: 0,
    total_debt: 0,
  };

  const emptyRatios: Ratios = {
    fiscal_year: "",
    debt_to_equity: 0,
    ebit_margin: 0,
    roce: 0,
    roe: 0,
  };

  const emptySubscription: Subscription = {
    category: "",
    subscription_times: 0
  }

  const [financials, setFinancials] = useState<Financial[]>([{ ...emptyFinancial }]);
  const [ratios, setRatios] = useState<Ratios[]>([{ ...emptyRatios }]);
  const [subscription, setSubscription] = useState<Subscription[]>([{ ...emptySubscription }])

  useEffect(() => {
    const fetchIpoDetails = async () => {
      if (company.company_id) {
        try {
          const response = await fetch(`/api/ipodetails/${company.company_id}`);
          if (!response.ok) throw new Error("Failed to fetch IPO details");

          const result = await response.json();
          console.log("Fetched data:", result);

          // If response has a company key and it's an object, use it
          if (result?.company && typeof result.company === 'object') {
            setCompany(result.company);
          }

          if (result?.ipo_details && Array.isArray(result.ipo_details) && result.ipo_details.length > 0) {
            setIpoDetails(result.ipo_details[0]);
          }

          if (result?.financials && Array.isArray(result.financials) && result.financials.length > 0) {
            setFinancials(result.financials);
          } else {
            setFinancials([{ ...emptyFinancial }]);
          }

          if (result?.ratios && Array.isArray(result.ratios) && result.ratios.length > 0) {
            setRatios(result.ratios);
          } else {
            setRatios([{ ...emptyRatios }]);
          }

          if (result?.subscription && Array.isArray(result.subscription) && result.subscription.length > 0) {
            setSubscription(result.subscription);
          } else {
            setSubscription([{ ...emptySubscription }]);
          }
        } catch (error) {
          console.error("Error fetching IPO details:", error);
          // Initialize with empty records if fetch fails
          setFinancials([{ ...emptyFinancial }]);
          setRatios([{ ...emptyRatios }]);
          setSubscription([{ ...emptySubscription }]);
        }
      }
    };

    fetchIpoDetails();
  }, [company.company_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany((prev) => ({
      ...prev,
      [name]: name.includes("_varieties") || name.includes("count") || name.includes("year") ? Number(value) : value,
    }));
  };

  const handleIpoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle price band input specially
    if (name === "price_band") {
      const parts = value.split("-");
      const min = parts[0] ? Number(parts[0].trim()) : 0;
      const max = parts[1] ? Number(parts[1].trim()) : 0;

      setIpoDetails(prev => ({
        ...prev,
        price_band_min: min,
        price_band_max: max
      }));
      return;
    }

    // Remove spaces and convert to camelCase for matching state properties
    const stateName = name.replace(/\s+/g, '_').toLowerCase();

    setIpoDetails(prev => ({
      ...prev,
      [stateName]: stateName.includes("date") ? value : Number(value),
    }));
  };

  const handleFinancialChange = (index: number, field: keyof Financial, value: string) => {
    const updatedFinancials = [...financials];

    if (field === 'fiscal_year') {
      updatedFinancials[index][field] = value;
    } else {
      updatedFinancials[index][field] = Number(value) || 0; // Ensure never undefined
    }

    setFinancials(updatedFinancials);
  };

  const handleRatiosChange = (index: number, field: keyof Ratios, value: string) => {
    const updatedRatios = [...ratios];

    if (field === 'fiscal_year') {
      updatedRatios[index][field] = value;
    } else {
      updatedRatios[index][field] = Number(value) || 0; // Ensure never undefined
    }

    setRatios(updatedRatios);
  };

  // Add the missing function for handling subscription changes
  const handleSubscriptionChange = (index: number, field: keyof Subscription, value: string) => {
    const updatedSubscription = [...subscription];

    if (field === 'category') {
      updatedSubscription[index][field] = value;
    } else {
      updatedSubscription[index][field] = Number(value) || 0; // Ensure never undefined
    }

    setSubscription(updatedSubscription);
  };

  const addFinancialYear = () => {
    setFinancials([...financials, { ...emptyFinancial }]);
  };

  const addRatios = () => {
    setRatios([...ratios, { ...emptyRatios }]);
  };

  // Add the missing function for adding subscriptions
  const addSubscriptions = () => {
    setSubscription([...subscription, { ...emptySubscription }]);
  };

  const removeFinancialYear = (index: number) => {
    const updatedFinancials = [...financials];
    updatedFinancials.splice(index, 1);
    setFinancials(updatedFinancials);
  };

  const removeRatios = (index: number) => {
    const updatedRatios = [...ratios];
    updatedRatios.splice(index, 1);
    setRatios(updatedRatios);
  };

  // Add the missing function for removing subscriptions
  const removeSubscription = (index: number) => {
    const updatedSubscription = [...subscription];
    updatedSubscription.splice(index, 1);
    setSubscription(updatedSubscription);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      company,
      ipo_details: ipoDetails,
      financials,
      ratios,
      subscription // Add subscription data to the form submission
    };

    if (company.company_id) {
      console.log("Updating Company:", formData);
      try {
        const response = await fetch(`/api/ipodetails/${company.company_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to update company");
      } catch (error) {
        console.error("Error updating company:", error);
        return;
      }
    } else {
      console.log("Adding New Company:", formData);
      try {
        const response = await fetch('/api/ipodetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to add company");
      } catch (error) {
        console.error("Error adding company:", error);
        return;
      }
    }

    router.push("/database/IPO_Details");
  };

  return (
    <Card className="w-256 mx-auto p-4 shadow-lg rounded-xl">
      <CardContent>
        <h2 className="text-xl text-center font-semibold mb-4">
          {company.company_id ? "Edit Company" : "Add Company"}
        </h2>
        <h2 className="text-xl font-semibold mb-4">Company Overview</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mt-4 p-4 border rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Company Name</label>
                <Input name="name" type="text" value={company.name} placeholder="Company Name" onChange={handleChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Industry</label>
                <Input name="industry" type="text" value={company.industry} placeholder="Industry" onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea name="description" placeholder="Description" className="w-full h-32 p-2 border rounded" value={company.description} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block font-medium mb-1">Total Yarn Varieties</label>
                <Input name="total_yarn_varieties" type="number" value={company.total_yarn_varieties} onChange={handleChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Active Yarn Varieties</label>
                <Input name="active_yarn_varieties" type="number" value={company.active_yarn_varieties} onChange={handleChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Customer Count</label>
                <Input name="customer_count" type="number" value={company.customer_count} onChange={handleChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Established Year</label>
                <Input name="established_year" type="number" value={company.established_year} onChange={handleChange} required />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-4">IPO Details</h2>
          <div className="mt-4 p-4 border rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Opening Date</label>
                <Input name="opening_date" type="date" value={ipoDetails.opening_date} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Closing Date</label>
                <Input name="closing_date" type="date" value={ipoDetails.closing_date} onChange={handleIpoChange} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">Allotment Date</label>
                <Input name="allotment_date" type="date" value={ipoDetails.allotment_date} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Refunds Date</label>
                <Input name="refund_date" type="date" value={ipoDetails.refund_date} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Listing Date</label>
                <Input name="listing_date" type="date" value={ipoDetails.listing_date} onChange={handleIpoChange} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">Lot Size</label>
                <Input name="lot_size" type="number" value={ipoDetails.lot_size} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Minimum Investment</label>
                <Input name="min_investment" type="number" value={ipoDetails.min_investment} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Price band(Min) (₹)</label>
                <Input
                  name="price_band"
                  type="text"
                  value={`${ipoDetails.price_band_min}`}
                  placeholder="e.g. 800-850"
                  onChange={handleIpoChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Price band (Max) (₹)</label>
                <Input
                  name="price_band"
                  type="text"
                  value={`${ipoDetails.price_band_max}`}
                  placeholder="e.g. 800-850"
                  onChange={handleIpoChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Face Value (₹)</label>
                <Input name="face_value" type="number" value={ipoDetails.face_value} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">No of Shares</label>
                <Input name="shares_offered" type="number" value={ipoDetails.shares_offered} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Offer for sale (₹)</label>
                <Input name="offer_for_sale" type="number" value={ipoDetails.offer_for_sale} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Fresh Issue (₹)</label>
                <Input name="fresh_issue" type="number" value={ipoDetails.fresh_issue} onChange={handleIpoChange} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Offer to public (₹)</label>
                <Input name="offer_to_public" type="number" value={ipoDetails.offer_to_public} onChange={handleIpoChange} required />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Purpose of issue</label>
              <textarea
                name="purpose"
                placeholder="Purpose of the IPO"
                className="w-full h-20 p-2 border rounded"
                value={ipoDetails.purpose}
                onChange={handleIpoChange}
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Financial History</h2>
              <Button
                type="button"
                variant="outline"
                className="flex items-center"
                onClick={addFinancialYear}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                Add Financial Year
              </Button>
            </div>

            {company.company_id ? (
              // For existing companies, display read-only financial data
              financials.length > 0 ? (
                financials.map((fin, index) => (
                  <div key={index} className="mt-4 p-4 border rounded-md">
                    <label className="block font-medium mb-2 text-lg">{fin.fiscal_year}</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Revenue</label>
                        <Input name="revenue" type="number" value={fin.revenue} readOnly />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">EBIT</label>
                        <Input name="ebit" type="number" value={fin.ebit} readOnly />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">PAT</label>
                        <Input name="pat" type="number" value={fin.pat} readOnly />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Net Worth</label>
                        <Input name="net_worth" type="number" value={fin.net_worth} readOnly />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Total Debt</label>
                        <Input name="total_debt" type="number" value={fin.total_debt} readOnly />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 mt-2">No financial data available</p>
              )
            ) : (
              // For new companies, display editable financial forms
              financials.map((fin, index) => (
                <div key={index} className="mt-4 p-4 border rounded-md relative">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeFinancialYear(index)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  )}

                  <div className="mb-4">
                    <label className="block font-medium mb-1">Fiscal Year</label>
                    <Input
                      type="text"
                      placeholder="e.g. FY 2023-24"
                      value={fin.fiscal_year}
                      onChange={(e) => handleFinancialChange(index, 'fiscal_year', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Revenue (₹)</label>
                      <Input
                        type="number"
                        value={fin.revenue}
                        onChange={(e) => handleFinancialChange(index, 'revenue', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">EBIT (₹)</label>
                      <Input
                        type="number"
                        value={fin.ebit}
                        onChange={(e) => handleFinancialChange(index, 'ebit', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">PAT (₹)</label>
                      <Input
                        type="number"
                        value={fin.pat}
                        onChange={(e) => handleFinancialChange(index, 'pat', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Net Worth (₹)</label>
                      <Input
                        type="number"
                        value={fin.net_worth}
                        onChange={(e) => handleFinancialChange(index, 'net_worth', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Total Debt (₹)</label>
                      <Input
                        type="number"
                        value={fin.total_debt}
                        onChange={(e) => handleFinancialChange(index, 'total_debt', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Key Ratios</h2>
              {!company.company_id && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center"
                  onClick={addRatios}
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add Ratios
                </Button>
              )}
            </div>
            <div>
              {company.company_id ? (
                ratios.length > 0 ? (
                  ratios.map((ratio, index) => (
                    <div key={index} className="mt-4 p-4 border rounded-md">
                      <label className="block font-medium mb-2 text-lg">{ratio.fiscal_year}</label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block font-medium mb-1">Debt to Equity</label>
                          <Input name="debt_to_equity" type="number" value={ratio.debt_to_equity} readOnly />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">EBIT Margin</label>
                          <Input name="ebit_margin" type="number" value={ratio.ebit_margin} readOnly />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">ROCE</label>
                          <Input name="roce" type="number" value={ratio.roce} readOnly />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">ROE</label>
                          <Input name="roe" type="number" value={ratio.roe} readOnly />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 mt-2">No Ratios available</p>
                )
              ) : (
                ratios.map((ratio, index) => (
                  <div key={index} className="mt-4 p-4 border rounded-md relative">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeRatios(index)}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    )}

                    <div className="mb-4">
                      <label className="block font-medium mb-1">Fiscal Year</label>
                      <Input
                        type="text"
                        placeholder="e.g. FY 2023-24"
                        value={ratio.fiscal_year}
                        onChange={(e) => handleRatiosChange(index, 'fiscal_year', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Debt to Equity</label>
                        <Input
                          type="number"
                          value={ratio.debt_to_equity}
                          onChange={(e) => handleRatiosChange(index, 'debt_to_equity', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">EBIT Margin</label>
                        <Input
                          type="number"
                          value={ratio.ebit_margin}
                          onChange={(e) => handleRatiosChange(index, 'ebit_margin', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">ROCE</label>
                        <Input
                          type="number"
                          value={ratio.roce}
                          onChange={(e) => handleRatiosChange(index, 'roce', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">ROE</label>
                        <Input
                          type="number"
                          value={ratio.roe}
                          onChange={(e) => handleRatiosChange(index, 'roe', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Subscriptions</h2>
              {!company.company_id && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center"
                  onClick={addSubscriptions}
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add Subscriptions
                </Button>
              )}
            </div>
            <div>
              {company.company_id ? (
                subscription.length > 0 ? (
                  subscription.map((subs, index) => (
                    <div key={index} className="mt-4 p-4 border rounded-md">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block font-medium mb-1">Category</label>
                          <Input name="category" type="text" value={subs.category} readOnly />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Subscription Times</label>
                          <Input name="subscription_times" type="number" value={subs.subscription_times} readOnly />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 mt-2">No Subscription data available</p>
                )
              ) : (
                subscription.map((subs, index) => (
                  <div key={index} className="mt-4 p-4 border rounded-md relative">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeSubscription(index)}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Category</label>
                        <Input
                          type="text"
                          value={subs.category}
                          onChange={(e) => handleSubscriptionChange(index, 'category', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Subscription Times</label>
                        <Input
                          type="number"
                          value={subs.subscription_times}
                          onChange={(e) => handleSubscriptionChange(index, 'subscription_times', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-500 text-white mt-4">
            {company.company_id ? "Update Company" : "Add Company"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}