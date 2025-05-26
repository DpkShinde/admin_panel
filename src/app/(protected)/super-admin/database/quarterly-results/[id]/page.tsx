"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner"; // Assuming you also want toast notifications here
import RichTextEditor from "@/components/text-editors/RichTextEditor"; // Import your Tiptap-based editor

interface EarningResult {
  id: number;
  company_id: number;
  image_url: string;
  title: string;
  MainContent: string; // This will store HTML content from the editor
  created_date: string;
}

interface CompanyOption {
  company_id: number;
  company_name: string;
}

export default function EditEarningResult() {
  const [formData, setFormData] = useState<Partial<EarningResult>>({
    company_id: undefined,
    image_url: "",
    title: "",
    MainContent: "", // Initialize with an empty string for HTML
    created_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Ensure ID is treated as string for consistency

  // Effect to fetch company options when the component mounts
  useEffect(() => {
    const fetchCompanyOptions = async () => {
      try {
        const response = await fetch("/api/earning-results/allCom");
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data: CompanyOption[] = await response.json();
        setCompanyOptions(data);
      } catch (error: any) {
        console.error("Error fetching companies:", error);
        setError(`Failed to load companies: ${error.message}`);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanyOptions();
  }, []);

  // Effect to fetch Earning Result data
  useEffect(() => {
    if (!id) {
      setError("No earning result ID provided.");
      setLoading(false);
      return;
    }

    const fetchEarningResult = async () => {
      try {
        const response = await fetch(`/api/earning-results/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Error fetching data: ${response.status}`
          );
        }
        const data: EarningResult = await response.json();
        console.log("Fetched data:", data);

        // Format date for the input field
        const formattedDate = data.created_date
          ? new Date(data.created_date).toISOString().split("T")[0]
          : "";

        setFormData({
          ...data,
          created_date: formattedDate, // Set the formatted date
        });
      } catch (err: any) {
        console.error("Error fetching earning result:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningResult();
  }, [id]);

  // Handles changes to standard input fields (not the rich text editor)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!, // '!' because formData can be null initially but not when this is called
      [name]:
        name === "company_id"
          ? value
            ? parseInt(value, 10)
            : undefined // Convert to number, or undefined if empty
          : value,
    }));
  };

  // This function receives and stores the HTML string from RichTextEditor
  const handleContentChange = (htmlContent: string) => {
    setFormData((prev) => ({ ...prev!, MainContent: htmlContent }));
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Basic validation
    if (
      !formData?.id || // Ensure ID exists for update
      formData.company_id === undefined ||
      !formData.title ||
      !formData.MainContent ||
      !formData.created_date ||
      formData.MainContent.trim() === "" ||
      formData.MainContent === "<p></p>" || // Check for empty Tiptap paragraph
      formData.MainContent === "<p><br></p>" // Check for default empty Tiptap paragraph
    ) {
      setError("Please fill in all required fields, including the main content.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/earning-results/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update earning result");
      }

      console.log("Earning Result Updated:", data.message);
      toast.success(data.message);
      router.push(`/super-admin/database/quarterly-results`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render Loading or Error State ---
  if (loading || loadingCompanies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-700 text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          <span>Loading earning result and companies...</span>
        </div>
      </div>
    );
  }

  if (error && (!formData || !formData.id)) {
    // Display fetch error if no data loaded or invalid ID
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md text-center">
          <p className="text-xl font-semibold mb-2">Error!</p>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If formData is null after loading, it means the ID was not found
  if (!formData || !formData.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white px-6 py-4 rounded-xl shadow-md text-center">
          <p className="text-xl font-semibold mb-2 text-gray-800">
            Earning result not found.
          </p>
          <button
            onClick={() => router.push(`/super-admin/database/quarterly-results`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Results List
          </button>
        </div>
      </div>
    );
  }

  // --- Render Form (once data is loaded) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Edit Earning Result
                </h1>
                <p className="text-blue-100 mt-1">
                  Modify the quarterly earning information
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">
                  Error Updating Earning Result
                </h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Company Select */}
            <div className="space-y-3">
              <label
                htmlFor="company_id"
                className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
              >
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>Company</span>
              </label>
              {loadingCompanies ? (
                <div className="text-gray-600 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                  Loading companies...
                </div>
              ) : (
                <select
                  id="company_id"
                  name="company_id"
                  value={formData.company_id ?? ""}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-lg"
                >
                  <option value="" disabled>
                    Select a company
                  </option>
                  {companyOptions.map((company) => (
                    <option key={company.company_id} value={company.company_id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Image URL Input */}
            <div className="space-y-3">
              <label
                htmlFor="image_url"
                className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
              >
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Image URL</span>
              </label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                placeholder="Enter image URL (optional)..."
                value={formData.image_url || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-lg"
              />
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label
                htmlFor="title"
                className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
              >
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.206 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.794 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.794 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.206 18 16.5 18s-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Title</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter the earning result title..."
                value={formData.title || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-lg"
              />
            </div>

            {/* Main Content (RichTextEditor) */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Main Content</span>
              </label>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-200">
                <RichTextEditor
                  content={formData.MainContent ?? ""} // Pass initial content from formData
                  onChange={handleContentChange} // Receive updated HTML content
                  placeholder="Detailed earning result content goes here..."
                  minHeight="500px"
                  showPreview={true}
                />
              </div>
            </div>

            {/* Created Date Input */}
            <div className="space-y-3">
              <label
                htmlFor="created_date"
                className="flex items-center space-x-2 text-lg font-semibold text-gray-800"
              >
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h.01M7 12h.01M7 15h.01M17 12h.01M17 15h.01M17 18h.01M16 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Created Date</span>
              </label>
              <input
                type="date"
                id="created_date"
                name="created_date"
                value={formData.created_date || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || loadingCompanies}
                className="w-full sm:w-auto px-8 py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2
                         focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Update Result</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/super-admin/database/quarterly-results`)
                }
                className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 focus:ring-4 focus:ring-gray-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}