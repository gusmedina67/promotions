import { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar"; 
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import axios from "axios";

export default function CreateQRCode() {
  const [prizeType, setPrizeType] = useState("");
  const [message, setMessage] = useState("");
  
  const handleCreate = async () => {
    try {
      const response = await axios.post("https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg/generate-qrcodes", { prize_type: prizeType });
      setMessage(response.data.message);
    } catch (err) {
      setMessage("Error creating QR Code");
    }
  };

  return (
    <>
      {/* Navbar at the top */}
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Create QR Code</h1>
        <input type="text" value={prizeType} onChange={(e) => setPrizeType(e.target.value)} placeholder="Enter prize type" className="border p-2 rounded w-full mb-4" />
        <Button onClick={handleCreate}>Generate QR Code</Button>
        {message && <Alert>{message}</Alert>}
      </div>
    </>
  );
}