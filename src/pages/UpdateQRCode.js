import { useState } from "react";
import AdminNavbar from "./AdminNavbar"; 
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { updateQRCode } from "../services/api";

export default function UpdateQRCode() {
  const [qrCodeId, setQrCodeId] = useState("");
  const [prizeType, setPrizeType] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Only enable the button if we have both fields non-empty and not loading
  const isUpdateDisabled = !qrCodeId.trim() || !prizeType.trim() || isLoading;

  async function handleUpdate() {
    setIsLoading(true);
    setMessage("");
    const token = localStorage.getItem("cognito_access_token");
    try {
      const response = await updateQRCode(
        { qr_code_id: qrCodeId, prize_type: prizeType },
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
      handleAuthError(err, "Error updating QR Code");
    } finally {
      setIsLoading(false);
    }
  };

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
  const updateBtnStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: isUpdateDisabled ? "#ccc" : "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: isUpdateDisabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease",
  };

  // Hover effect if button is enabled
  const handleMouseOver = (e) => {
    if (!isUpdateDisabled) {
      e.currentTarget.style.backgroundColor = "#0056b3"; 
    }
  };
  const handleMouseOut = (e) => {
    if (!isUpdateDisabled) {
      e.currentTarget.style.backgroundColor = "#007bff";
    }
  };

  // Button text changes when loading
  const buttonText = isLoading ? "Updating..." : "Update QR Code";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Sticky Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 999, background: "white" }}>
        <AdminNavbar />
      </div>

      <div className="p-6" style={{ flexGrow: 1, overflowY: "auto" }}>
        <h1 className="text-2xl font-semibold mb-4">Update QR Code</h1>
        
        {/* Container for inputs, etc. */}
        <div style={{ maxWidth: "600px", marginBottom: "1rem" }}>
          <input
            type="text"
            value={qrCodeId}
            onChange={(e) => setQrCodeId(e.target.value)}
            placeholder="Enter QR Code ID"
            className="border w-full mb-4"
            style={{
              fontSize: "1rem",
              height: "3rem",
              padding: "0.5rem",
              borderRadius: "4px",
              marginRight: "10px"
            }}
          />

          <input
            type="text"
            value={prizeType}
            onChange={(e) => setPrizeType(e.target.value)}
            placeholder="Enter new prize type"
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
              onClick={handleUpdate}
              disabled={isUpdateDisabled}
              style={updateBtnStyle}
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
