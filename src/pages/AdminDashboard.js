import { useState, useEffect, useRef } from "react";
import AdminNavbar from "./AdminNavbar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    qr_codes_total: 0,
    scans_total: 0,
    winners_total: 0,
  });
  const [error, setError] = useState("");
  const isFetching = useRef(false); // ✅ Prevent duplicate requests

  // Winners panel states
  const [showWinners, setShowWinners] = useState(false);
  const [winnersList, setWinnersList] = useState([]);
  const [winnersError, setWinnersError] = useState("");
  const [isFetchingWinners, setIsFetchingWinners] = useState(false);

  // Search term for filtering winners
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isFetching.current) return;
    isFetching.current = true; // ✅ Mark API call as in-progress

    const token = localStorage.getItem("cognito_access_token");
    // Fetch overall stats from /admin/reports
    axios
      .get("https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg/admin/reports", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setStats(response.data);
      })
      .catch(() => setError("Failed to fetch admin reports"));
  }, []);

  // Handle click on "Winners" row
  const handleWinnersClick = () => {
    if (!showWinners) {
      fetchWinners();
    } else {
      setShowWinners(false);
    }
  };

  // Fetch winners from /admin/winners
  const fetchWinners = () => {
    setIsFetchingWinners(true);
    setWinnersError("");

    const token = localStorage.getItem("cognito_access_token");
    axios
      .get("https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg/admin/winners", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data && response.data.winners) {
          setWinnersList(response.data.winners);
        }
        setShowWinners(true);
      })
      .catch(() => {
        setWinnersError("Failed to fetch winners list");
      })
      .finally(() => setIsFetchingWinners(false));
  };

  /**
   * Parse a date string like "2025-03-19T23:56:31.916597" as UTC (if no timezone info),
   * then convert it to local time, returning yyyy-mm-dd hh:mm:ss.
   */
  const formatDate = (utcString) => {
    if (!utcString) return "";

    // If the string already has a 'Z' or '+/-' offset, we assume it has a timezone.
    // Otherwise, we append 'Z' to interpret it as UTC.
    const hasTimeZone = /[zZ+\-]\d*$/.test(utcString);

    // If there's a 'T' but no 'Z' or offset, add 'Z'
    let normalized = utcString.trim();
    if (!hasTimeZone && normalized.includes("T")) {
      normalized += "Z"; // Force UTC
    }

    // Now create the Date object. The JS engine will interpret it as UTC if it ends with Z.
    const date = new Date(normalized);

    // Build local date/time in yyyy-mm-dd hh:mm:ss
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // Handle checking "Delivered" checkbox
  const handleDeliveredToggle = async (winner) => {
    if (winner.delivery_date) {
      // Already delivered; do nothing or maybe show a small alert
      return;
    }

    const confirmAction = window.confirm("Are you sure you want to mark this prize as delivered?");
    if (!confirmAction) return;

    // Post to /admin/winners/delivery-date
    const token = localStorage.getItem("cognito_access_token");
    try {
      const resp = await axios.post(
        "https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg/admin/winners/delivery-date",
        {
          winner_id: winner.winner_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // The response returns { message, winner_id, delivery_date }
      const newDeliveryDate = resp.data.delivery_date;

      // Update local state with new delivery_date
      setWinnersList((prevList) =>
        prevList.map((w) =>
          w.winner_id === winner.winner_id
            ? { ...w, delivery_date: newDeliveryDate }
            : w
        )
      );
    } catch (err) {
      alert("Failed to update delivery date.");
    }
  };

  // Filter logic for searchTerm
  const filteredWinners = winnersList.filter((winner) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true; // no search => show all
  
    const deliveredStr = winner.delivery_date ? "delivered" : "not delivered";
  
    // 1. If user typed exactly "delivered"
    if (term === "delivered") {
      return !!winner.delivery_date;
    }
    // 2. If user typed exactly "not delivered"
    if (term === "not delivered") {
      return !winner.delivery_date;
    }
  
    // 3. For partial substring on everything else:
    const combined = [
      winner.qr_code_id,
      winner.name,
      winner.email,
      winner.phone,
      winner.prize_type,
      deliveredStr, // "delivered" or "not delivered"
    ]
      .map((field) => (field ? field.toLowerCase() : ""))
      .join(" ");
  
    return combined.includes(term);
  });
 

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        {error && <Alert type="error">{error}</Alert>}
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">Overall Stats</h2>
            <ul>
              <li className="p-2 border-b">
                <strong>QR Codes:</strong> {stats.qr_codes_total}
              </li>
              <li className="p-2 border-b">
                <strong>Total Scans:</strong> {stats.scans_total}
              </li>
              <li
                className="p-2 border-b"
                style={{ cursor: "pointer" }}
                onClick={handleWinnersClick}
              >
                <strong>Winners:</strong> {stats.winners_total}
              </li>
            </ul>
          </CardContent>
        </Card>

        {showWinners && (
          <Card className="mt-4">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Winners List</h3>
              {winnersError && <Alert type="error">{winnersError}</Alert>}
              {isFetchingWinners && <p>Loading Winners...</p>}

              {!isFetchingWinners && winnersList.length > 0 && (
                <>
                  {/* Search Bar */}
                  <div style={{ marginBottom: "1rem" }}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search winners... (QR code, name, email, phone, prize, delivered)"
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "1rem",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          QR Code
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          Name
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          Email
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          Phone
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          Prize
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          Claimed Date
                        </th>
                        <th
                          style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          Delivered
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                          Delivered Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWinners.map((winner) => {
                        const claimedDate = formatDate(winner.claimed_at);
                        const deliveredDate = winner.delivery_date
                          ? formatDate(winner.delivery_date)
                          : "";

                        return (
                          <tr key={winner.winner_id}>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {winner.qr_code_id}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {winner.name}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {winner.email}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {winner.phone}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {winner.prize_type}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {claimedDate}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "center",
                              }}
                            >
                              {winner.delivery_date ? (
                                <input type="checkbox" checked readOnly />
                              ) : (
                                <input
                                  type="checkbox"
                                  onChange={() => handleDeliveredToggle(winner)}
                                />
                              )}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                              {deliveredDate}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
              {!isFetchingWinners && winnersList.length === 0 && <p>No winners found.</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
