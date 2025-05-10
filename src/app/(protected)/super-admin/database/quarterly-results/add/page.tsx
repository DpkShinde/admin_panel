"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the interface for the data structure
interface EarningResult {
  id?: number; // ID is optional for new entries
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

export default function AddEarningResult() {
  // State to manage the form data
  const [formData, setFormData] = useState<Partial<EarningResult>>({
    company_id: undefined,
    image_url: "",
    title: "",
    MainContent: "<p><br></p>", // Initialize with a paragraph to prevent empty editor issues
    created_date: "",
  });

  // State to manage the submission status
  const [submitting, setSubmitting] = useState(false);

  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);

  // Ref for the contentEditable div
  const editorRef = useRef<HTMLDivElement>(null);

  // Flag to prevent recursive updates
  const isUpdatingRef = useRef(false);

  // Store company name and id for the select box
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // useRouter hook for navigation
  const router = useRouter();

  // Font sizes array for selection
  const fontSizes = [
    { value: "1", label: "X-Small" },
    { value: "2", label: "Small" },
    { value: "3", label: "Normal" },
    { value: "4", label: "Large" },
    { value: "5", label: "X-Large" },
    { value: "6", label: "XX-Large" },
    { value: "7", label: "XXX-Large" },
  ];

  // Initialize the editor content when component mounts or formData.MainContent changes
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = formData.MainContent || "<p><br></p>";
      isUpdatingRef.current = false;
    }
  }, []);

  // Save selection state to a variable that will be used by editor commands
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  };

  // Restore selection from saved range
  const restoreSelection = (range : any) => {
    if (range && editorRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  // Handle editor input and update formData
  const handleEditorInput = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      
      const newContent = editorRef.current.innerHTML;
      setFormData((prev) => ({
        ...prev,
        MainContent: newContent
      }));
      
      isUpdatingRef.current = false;
    }
  };

  // Set up event listeners for the editor
  useEffect(() => {
    const editor = editorRef.current;
    
    if (editor) {
      editor.addEventListener("input", handleEditorInput);
      
      return () => {
        editor.removeEventListener("input", handleEditorInput);
      };
    }
  }, []);

  /**
   * Handles changes to the standard input fields (except the contentEditable div).
   * Updates the formData state.
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "company_id"
          ? value
            ? parseInt(value, 10)
            : undefined // Convert to number, or undefined if empty
          : value,
    }));
  };

  /**
   * Improved execCommand function that keeps cursor position
   */
  const execCommand = (command: string, value: string = "") => {
    if (!editorRef.current) return;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Save the current selection
    const savedSelection = saveSelection();
    
    // Execute the command
    document.execCommand(command, false, value);
    
    // Update formData with new content
    const newContent = editorRef.current.innerHTML;
    if (newContent !== formData.MainContent) {
      setFormData(prev => ({
        ...prev,
        MainContent: newContent
      }));
    }
    
    // Restore selection when appropriate
    // For some commands, we don't restore selection immediately
    if (command !== 'insertHTML' && command !== 'insertOrderedList' && 
        command !== 'insertUnorderedList') {
      if (savedSelection) restoreSelection(savedSelection);
    }
  };

  /**
   * Apply heading format with improved implementation
   */
  const applyHeading = (tag: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const savedSelection = saveSelection();
    
    document.execCommand("formatBlock", false, tag);
    
    // Update the state after the command
    const newContent = editorRef.current.innerHTML;
    setFormData(prev => ({
      ...prev,
      MainContent: newContent
    }));
    
    // Try to restore selection
    if (savedSelection) restoreSelection(savedSelection);
  };

  /**
   * Insert list with improved implementation
   */
  const insertList = (listType: "ul" | "ol") => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    if (listType === "ul") {
      document.execCommand("insertUnorderedList", false);
    } else {
      document.execCommand("insertOrderedList", false);
    }
    
    // Update state
    const newContent = editorRef.current.innerHTML;
    setFormData(prev => ({
      ...prev,
      MainContent: newContent
    }));
  };

  /**
   * Inserts a table with improved implementation
   */
  const insertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");

    if (!rows || !cols || !editorRef.current) return;
    
    const numRows = parseInt(rows, 10);
    const numCols = parseInt(cols, 10);

    if (numRows > 0 && numCols > 0) {
      // Focus editor and save current selection
      editorRef.current.focus();
      
      let tableHTML =
        '<table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">';

      // Create header row
      tableHTML += "<thead><tr>";
      for (let j = 0; j < numCols; j++) {
        tableHTML +=
          '<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Header ' +
          (j + 1) +
          "</th>";
      }
      tableHTML += "</tr></thead>";

      // Create data rows
      tableHTML += "<tbody>";
      for (let i = 0; i < numRows; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < numCols; j++) {
          tableHTML +=
            '<td style="border: 1px solid #ddd; padding: 8px;">Cell ' +
            (i + 1) +
            "-" +
            (j + 1) +
            "</td>";
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</tbody>";

      tableHTML += "</table><p><br></p>"; // Add a paragraph after the table

      // Insert HTML and update state
      execCommand("insertHTML", tableHTML);
    }
  };

  /**
   * Improved form submission handler
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Get the latest content directly from the editor
    const currentContent = editorRef.current ? editorRef.current.innerHTML : formData.MainContent;

    // Create submission data with the latest content
    const submissionData = {
      ...formData,
      MainContent: currentContent,
    };

    // Destructure data for validation
    const { company_id, title, MainContent, created_date } = submissionData;

    // Basic validation
    if (
      company_id === undefined ||
      !title ||
      !MainContent ||
      !created_date ||
      MainContent.trim() === "" ||
      MainContent === "<p><br></p>"
    ) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      // Send POST request to the API endpoint
      const response = await fetch("/api/earning-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      // Handle response
      if (!response.ok) {
        // Attempt to parse JSON error, but fallback to text
        const errorText = await response.text();
        let errorMessage = `Error adding data: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use the text response
          errorMessage = `Error adding data: ${response.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      // Assuming success response might not always be JSON
      const successText = await response.text();
      let successMessage = "Data added successfully!";
      try {
        const successJson = JSON.parse(successText);
        successMessage = successJson.message || successMessage;
      } catch (parseError) {
        // If JSON parsing fails, just use the default success message
      }

      alert(successMessage); // Show success message

      // Redirect on success
      router.push("/super-admin/database/quarterly-results");
    } catch (err: any) {
      console.error("Error adding earning result:", err);
      setError(err.message || "An unexpected error occurred."); // Display error message
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  // Effect to fetch company options when the component mounts
  useEffect(() => {
    const fetchCompanyOptions = async () => {
      try {
        const response = await fetch("/api/earning-results/allCom");
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data: CompanyOption[] = await response.json(); // Assuming data is an array of CompanyOption
        if (response.status !== 200) {
          throw new Error("Failed to fetch companies"); // Adjust if API returns specific error format
        }
        setCompanyOptions(data);
      } catch (error: any) {
        console.error("Error fetching companies:", error);
        // Optionally set an error state for fetching companies
        setError(`Failed to load companies: ${error.message}`);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanyOptions();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Add New Earning Result
      </h1>

      {/* Display error message if there is an error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* The form for adding a new earning result */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        {/* Company Select Input */}
        <div>
          <label
            htmlFor="company_id"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Company:
          </label>
          {loadingCompanies ? (
            <div className="text-gray-600">Loading companies...</div>
          ) : (
            <select
              id="company_id"
              name="company_id"
              value={formData.company_id ?? ""} // Use ?? "" to handle undefined state
              onChange={handleInputChange}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 text-black" // Added text-black for select
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
        <div>
          <label
            htmlFor="image_url"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Image URL:
          </label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url || ""}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 text-black"
          />
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 text-black"
          />
        </div>

        {/* Main Content Manual Rich Text Editor */}
        <div>
          <label
            htmlFor="MainContent"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Main Content:
          </label>

          {/* Custom Toolbar */}
          <div className="border border-gray-300 rounded-t-md bg-gray-100 p-1 flex flex-wrap gap-1">
            {/* Text formatting buttons */}
            <button
              type="button"
              onClick={() => execCommand("bold")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700 font-bold"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700 italic"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCommand("underline")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700 underline"
              title="Underline"
            >
              U
            </button>

            {/* Font size dropdown */}
            <select
              onChange={(e) => {
                execCommand("fontSize", e.target.value);
              }}
              value="3" // Keep '3' as a visual default that doesn't apply immediately
              className="p-1 border rounded-md text-sm text-black"
              title="Font Size"
            >
              {fontSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>

            {/* Alignment buttons */}
            <button
              type="button"
              onClick={() => execCommand("justifyLeft")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Align Left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyCenter")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-1 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-1 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyRight")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Align Right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                  transform="rotate(180 10 10)"
                />
              </svg>
            </button>

            {/* List buttons */}
            <button
              type="button"
              onClick={() => insertList("ul")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => insertList("ol")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Numbered List"
            >
              1. List
            </button>

            {/* Headings dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  applyHeading(e.target.value);
                  e.target.value = ""; // Reset selection after use
                }
              }}
              value="" // Default empty value
              className="p-1 border rounded-md text-black"
              title="Format"
            >
              <option value="" disabled>
                Format
              </option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="p">Paragraph</option>
            </select>

            {/* Table button */}
            <button
              type="button"
              onClick={insertTable}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Insert Table"
            >
              Table
            </button>

            {/* Link button */}
            <button
              type="button"
              onClick={() => {
                const url = prompt("Enter URL:");
                if (url) execCommand("createLink", url);
              }}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Insert Link"
            >
              Link
            </button>

            {/* Color buttons */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  const color = prompt(
                    "Enter text color (e.g. #ff0000, red):",
                    "#000000"
                  );
                  if (color) execCommand("foreColor", color);
                }}
                className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
                title="Text Color"
              >
                <span className="text-black font-bold">A</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const color = prompt(
                    "Enter highlight color (e.g. #ffff00, yellow):",
                    "#ffff00"
                  );
                  if (color) execCommand("hiliteColor", color);
                }}
                className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
                title="Highlight Color"
              >
                <span className="bg-yellow-200 px-1">H</span>
              </button>
            </div>

            {/* Clear formatting button */}
            <button
              type="button"
              onClick={() => execCommand("removeFormat")}
              className="p-1 hover:bg-gray-200 rounded-md text-gray-700"
              title="Clear Formatting"
            >
              Clear
            </button>
          </div>

          {/* Editor area */}
          <div
            ref={editorRef}
            contentEditable={true}
            className="min-h-[300px] p-3 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:border-blue-500 overflow-y-auto text-black" // Added text-black
          />
        </div>

        {/* Created Date Input */}
        <div>
          <label
            htmlFor="created_date"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Created Date:
          </label>
          <input
            type="date"
            id="created_date"
            name="created_date"
            value={formData.created_date || ""} // Use || "" to handle undefined state
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 text-black"
          />
        </div>

        {/* Form Submission Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="submit"
            disabled={submitting || loadingCompanies} // Disable if submitting or companies are loading
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add Result"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-bold text-gray-600 hover:text-gray-800 transition duration-300 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}