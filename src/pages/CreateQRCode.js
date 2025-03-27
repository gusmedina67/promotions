import { useState } from "react";
import AdminNavbar from "./AdminNavbar"; 
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { createQRCode } from "../services/api";

export default function CreateQRCode() {
  const [prizeType, setPrizeType] = useState("");
  const [count, setCount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Convert count to integer, defaulting to 0 if empty
  const numericCount = parseInt(count, 10) || 0;

  // Only enable the button if we have a non-empty prizeType AND a count > 0 AND not currently loading
  const isGenerateDisabled = !prizeType.trim() || numericCount <= 0 || isLoading;

  // For numeric input only
  const handleCountChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setCount(numericValue);
  };

  async function handleCreate() {
    setIsLoading(true);
    setMessage("");
    const token = localStorage.getItem("cognito_access_token");
    try {
      const response = await createQRCode(
        { prize_type: prizeType, count: count },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      handleAuthError(err, "Error creating QR Code");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Potential 401 or other errors
  function handleAuthError(err, fallbackMessage) {
    if (err?.response?.status === undefined || (err.response && err.response.status === 401)) {
      localStorage.removeItem("cognito_access_token");
      window.location.href = "/admin/login";
    } else {
      setMessage(fallbackMessage);
    }
  }

  // Button styling
  const generateBtnStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: isGenerateDisabled ? "#ccc" : "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: isGenerateDisabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease",
  };

  // Hover effect if button is enabled
  const handleMouseOver = (e) => {
    if (!isGenerateDisabled) {
      e.currentTarget.style.backgroundColor = "#0056b3"; 
    }
  };
  const handleMouseOut = (e) => {
    if (!isGenerateDisabled) {
      e.currentTarget.style.backgroundColor = "#007bff";
    }
  };

  // Button text changes when loading
  const buttonText = isLoading ? "Generating..." : "Generate QR Code";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Sticky Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 999, background: "white" }}>
        <AdminNavbar />
      </div>

      <div className="p-6" style={{ flexGrow: 1, overflowY: "auto" }}>
        <h1 className="text-2xl font-semibold mb-4">Create QR Code</h1>

        {/* Increase maxWidth to 1500px for a wider input */}
        <div style={{ maxWidth: "1500px", marginBottom: "1rem" }}>
          <input
            type="text"
            value={prizeType}
            onChange={(e) => setPrizeType(e.target.value)}
            placeholder="Enter prize type"
            className="border w-full mb-4"
            style={{
              fontSize: "1rem",
              height: "3rem",
              padding: "0.5rem",
              borderRadius: "4px",
              minWidth: "500px",
              marginRight: "10px"
            }}
          />

          <input
            type="number"
            value={count}
            onChange={handleCountChange}
            placeholder="Enter count"
            className="border w-full mb-4"
            style={{
              fontSize: "1rem",
              height: "3rem",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          />

          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handleCreate}
              disabled={isGenerateDisabled}
              style={generateBtnStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              {buttonText}
              {isLoading && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    width: "1rem",
                    height: "1rem",
                    display: "inline-block",
                    borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {message && (
          <div style={{ marginTop: "1rem" }}>
            <Alert>{message}</Alert>
          </div>
        )}
      </div>

      {/* Inline spinner keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
