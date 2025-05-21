"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Define the interface for the data structure
interface EarningResult {
  id: number;
  company_id: number;
  image_url: string;
  title: string;
  MainContent: string;
  created_date: string;
}

export default function EditEarningResult() {
  const [formData, setFormData] = useState<EarningResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);

  // Ref for the contentEditable div
  const editorRef = useRef<HTMLDivElement>(null);
  // console.log(editorRef.current?.innerHTML)
  // console.log(editorRef)

  // Ref to track if we're programmatically updating the editor (to prevent input loop)
  const isUpdatingContentRef = useRef(false);

  // Ref to save cursor position
    const selectionStateRef = useRef<{
      startNode: Node | null;
      startOffset: number;
      endNode: Node | null;
      endOffset: number;
  } | null>(null);

  // useRouter hook for navigation
  const router = useRouter();

  // Get parameters from the URL
  const params = useParams();
  const id = params.id; 

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

  // --- Data Fetching Effect ---
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

        setFormData(data);

        if (editorRef.current) {
          isUpdatingContentRef.current = true; 
          editorRef.current.innerHTML = data.MainContent || "<p><br></p>"; // Use fetched content or default
          isUpdatingContentRef.current = false;
        }
      } catch (err: any) {
        console.error("Error fetching earning result:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningResult();
  }, [id]); 

  useEffect(() => {
    const editorElement = editorRef.current;

    const updateContent = () => {
      if (editorElement && !isUpdatingContentRef.current) {
        
        saveSelection();

        setFormData((prev) => {
          if (!prev) return null; 
          return {
            ...prev,
            MainContent: editorElement.innerHTML,
          };
        });
      }
    };

    // Add event listeners to the editor
    if (editorElement) {
      editorElement.addEventListener("input", updateContent);
      editorElement.addEventListener("blur", saveSelection); 

      // Clean up the event listeners
      return () => {
        editorElement.removeEventListener("input", updateContent);
        editorElement.removeEventListener("blur", saveSelection);
      };
    }
  }, [formData]); 

 
  const saveSelection = () => {
    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      editorRef.current?.contains(
        selection.getRangeAt(0).commonAncestorContainer
      )
    ) {
      const range = selection.getRangeAt(0);
      selectionStateRef.current = {
        startNode: range.startContainer,
        startOffset: range.startOffset,
        endNode: range.endContainer,
        endOffset: range.endOffset,
      };
    } else {
      selectionStateRef.current = null; // Clear selection if outside editor
    }
  };

  // Restore saved selection
  const restoreSelection = () => {
    if (
      selectionStateRef.current &&
      editorRef.current?.contains(selectionStateRef.current.startNode)
    ) {
      const selection = window.getSelection();
      const range = document.createRange();

      try {
        range.setStart(
          selectionStateRef.current.startNode!, 
          selectionStateRef.current.startOffset
        );
        range.setEnd(
          selectionStateRef.current.endNode!, 
          selectionStateRef.current.endOffset
        );

        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (e) {
        console.error("Failed to restore selection:", e);
       
        selectionStateRef.current = null;
      }
    }
  };

  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]:
          name === "company_id"
            ? value
              ? parseInt(value, 10)
              : undefined
            : value,
      };
    });
  };

  /**
   * Executes a document command on the contentEditable element.
   * @param command - The command to execute (e.g., 'bold', 'italic').
   * @param value - The value for the command (e.g., URL for 'createLink').
   */
  const execCommand = (command: string, value: string = "") => {
    if (editorRef.current) {
      // Ensure the editor is focused (needed for execCommand)
      editorRef.current.focus();

      // Restore selection before executing command
      restoreSelection();

      try {
        // Execute the command
        document.execCommand(command, false, value);
      } catch (e) {
        console.error(`Error executing command ${command}:`, e);
        // Often happens with commands like foreColor/hiliteColor if no text is selected.
        // We can ignore these errors for now.
      }

      const updatedContent =
        editorRef.current?.innerHTML || formData?.MainContent || "";

      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          MainContent: updatedContent,
        };
      });

      // Save the new selection state immediately after update
      saveSelection();
    }
  };

  /**
   * Applies a heading format. Fixed implementation for headings.
   * @param tag - The heading tag to apply (e.g., 'h1', 'h2', 'p').
   */
  const applyHeading = (tag: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();

      // Apply heading
      document.execCommand("formatBlock", false, `<${tag}>`); // Need to wrap tag in <>

      // Update the state
      const updatedContent =
        editorRef.current?.innerHTML || formData?.MainContent || "";
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          MainContent: updatedContent,
        };
      });
      saveSelection(); // Save new selection
    }
  };

  /**
   * Fixed implementation for inserting lists.
   * @param listType - The type of list: 'ul' or 'ol'.
   */
  const insertList = (listType: "ul" | "ol") => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();

      // Apply list commands
      if (listType === "ul") {
        document.execCommand("insertUnorderedList", false);
      } else {
        document.execCommand("insertOrderedList", false);
      }

      // Update the state
      const updatedContent =
        editorRef.current?.innerHTML || formData?.MainContent || "";
      setFormData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          MainContent: updatedContent,
        };
      });
      saveSelection(); // Save new selection
    }
  };

  /**
   * Inserts a basic table into the contentEditable element.
   * Prompts the user for rows and columns.
   */
  const insertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");

    if (rows && cols) {
      const numRows = parseInt(rows, 10);
      const numCols = parseInt(cols, 10);

      if (numRows > 0 && numCols > 0) {
        let tableHTML =
          '<table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">';

        // Create header row if more than 1 row is requested
        if (numRows > 1) {
          tableHTML += "<thead><tr>";
          for (let j = 0; j < numCols; j++) {
            tableHTML +=
              '<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Header ' +
              (j + 1) +
              "</th>";
          }
          tableHTML += "</tr></thead>";
        }

        // Create data rows
        tableHTML += "<tbody>";
        const startRow = numRows > 1 ? 1 : 0; // Start from row 1 if header is present
        for (let i = startRow; i < numRows; i++) {
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

        // Insert the table HTML
        execCommand("insertHTML", tableHTML);
      }
    }
  };

  /**
   * Handles the form submission.
   * Sends a PUT request to the API.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return; // Don't submit if data hasn't loaded

    setSubmitting(true);
    setError(null);

    // Get the latest content directly from the editor (this should be synced by input handler, but extra safe)
    const currentContent = editorRef.current?.innerHTML || formData.MainContent;

    // Use the current formData state for submission
    const submissionData = {
      ...formData,
      MainContent: currentContent,
    };

    // Destructure data for validation
    const {
      company_id,
      title,
      MainContent: content,
      created_date,
    } = submissionData; // Renamed MainContent to content for clarity in validation

    // Basic validation
    if (
      !id || // Ensure ID exists
      company_id === undefined ||
      !title ||
      !content ||
      !created_date ||
      content.trim() === "" ||
      content === "<p><br></p>" // Check if it's just the default empty paragraph
    ) {
      setError(
        "Please fill in all required fields, including the main content."
      );
      setSubmitting(false);
      return;
    }

    try {
      // Send PUT request to the API endpoint
      const response = await fetch(`/api/earning-results/${id}`, {
        method: "PUT", // Use PUT for updating
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Error updating data: ${response.status}`
        );
      }

      router.push("/super-admin/database/quarterly-results");
    } catch (err: any) {
      console.error("Error updating earning result:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render Loading or Error State ---
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error && !formData) {
    // Display fetch error if no data loaded
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading earning result: {error}
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm font-bold text-gray-600 hover:text-gray-800 transition duration-300 ease-in-out"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto p-6 text-center text-gray-600">
        Earning result not found.
      </div>
    );
  }

  //format the date
  const formatDateForInput = (dateString: string | null | undefined) => {
    try {
      if (!dateString) return "";
      const date = new Date(dateString);
      const offset = date.getTimezoneOffset();
      const correctedDate = new Date(date.getTime() - offset * 60 * 1000);
      return correctedDate.toISOString().split("T")[0];
    } catch (error: any) {
      console.error("Error formatting input date:", dateString, error);
      return "";
    }
  };

  // --- Render Form (once data is loaded) ---
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Edit Earning Result
      </h1>

      {/* Display error message if there is an error (either fetch or submit) */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* The form for editing the earning result */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        {/* Company ID Input */}
        <div>
          <label
            htmlFor="company_id"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Company ID:
          </label>
          <input
            type="number"
            id="company_id"
            name="company_id"
            value={formData.company_id ?? ""}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
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
            value={formData.image_url}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
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
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
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
                e.target.value = "3"; // Reset to default value after use
              }}
              value="3" // Default value displayed
              className="p-1 border rounded-md text-gray-700 text-sm"
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

            {/* List buttons - fixed implementation */}
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

            {/* Headings dropdown - fixed implementation */}
            <select
              onChange={(e) => {
                applyHeading(e.target.value);
                e.target.value = ""; // Reset selection after use
              }}
              value="" // Default empty value
              className="p-1 border rounded-md text-gray-700 text-sm"
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
            className="min-h-[300px] p-3 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:border-blue-500 overflow-y-auto"
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
            value={formatDateForInput(formData.created_date)}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        {/* Form Submission Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Updating..." : "Update Result"}
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
