import { useState, useEffect, useRef } from "react";
import AdminNavbar from "./AdminNavbar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { fetchWinnersList } from "../services/api";
import { fetchQRCodesList } from "../services/api";
import { adminReports } from "../services/api";
import { updateWinnersDeliveryDate } from "../services/api";

// -------------------------------
// Admin Dashboard
// -------------------------------
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    qr_codes_total: 0,
    scans_total: 0,
    winners_total: 0,
  });
  const [error, setError] = useState("");
  const isFetching = useRef(false);

  // -------------------------------
  // Winners panel states
  // -------------------------------
  const [showWinners, setShowWinners] = useState(false);
  const [winnersList, setWinnersList] = useState([]);
  const [winnersError, setWinnersError] = useState("");
  const [isFetchingWinners, setIsFetchingWinners] = useState(false);
  const [searchTermWinners, setSearchTermWinners] = useState("");

  // Sorting for Winners
  const [winnersSortField, setWinnersSortField] = useState("qr_code_id");
  const [winnersSortDirection, setWinnersSortDirection] = useState("asc");

  // -------------------------------
  // QR Codes panel states
  // -------------------------------
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [qrCodesList, setQrCodesList] = useState([]);
  const [qrCodesError, setQrCodesError] = useState("");
  const [isFetchingQrCodes, setIsFetchingQrCodes] = useState(false);
  const [searchTermQr, setSearchTermQr] = useState("");

  // Sorting for QR Codes
  const [sortField, setSortField] = useState("prize_type");
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination for QR codes
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // -------------------------------
  // Fetch overall stats (admin/reports)
  // -------------------------------
  useEffect(() => {
    if (isFetching.current) return;
    isFetching.current = true;

    const token = localStorage.getItem("cognito_access_token");
    adminReports({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => setStats(response.data))
      .catch((err) => handleAuthError(err, "Error al intentar obtener los reportes administrativos."));
  }, []);

  // Handle Potential 401 or other errors
  function handleAuthError(err, fallbackMessage) {
    if (err?.response?.status === undefined || (err.response && err.response.status === 401)) {
      localStorage.removeItem("cognito_access_token");
      window.location.href = "/admin/login";
    } else {
      setError(fallbackMessage);
    }
  }

  // -------------------------------
  // Winners Logic
  // -------------------------------
  const handleWinnersClick = () => {
    if (!showWinners) fetchWinners();
    else setShowWinners(false);
  };

  const fetchWinners = () => {
    setIsFetchingWinners(true);
    setWinnersError("");

    const token = localStorage.getItem("cognito_access_token");
    fetchWinnersList({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.data && response.data.winners) {
          setWinnersList(response.data.winners);
        }
        setShowWinners(true);
      })
      .catch((err) => handleAuthError(err, "Error el intentar obtener la lista de ganadores"))
      .finally(() => setIsFetchingWinners(false));
  };

  // Winners Sort
  function handleWinnersSort(field) {
    if (field === winnersSortField) {
      setWinnersSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setWinnersSortField(field);
      setWinnersSortDirection("asc");
    }
  }

  function sortWinners(a, b) {
    let valA = a[winnersSortField];
    let valB = b[winnersSortField];

    // Convert to string for comparison (or parse numeric if needed).
    valA = valA ? String(valA).toLowerCase() : "";
    valB = valB ? String(valB).toLowerCase() : "";

    if (valA < valB) return winnersSortDirection === "asc" ? -1 : 1;
    if (valA > valB) return winnersSortDirection === "asc" ? 1 : -1;
    return 0;
  }

  // Filter winners
  const filteredWinners = winnersList.filter((winner) => {
    const term = searchTermWinners.toLowerCase().trim();
    if (!term) return true;

    const deliveredStr = winner.delivery_date ? "delivered" : "not delivered";

    if (term === "delivered") return !!winner.delivery_date;
    if (term === "not delivered") return !winner.delivery_date;

    const combined = [
      winner.qr_code_id,
      winner.name,
      winner.email,
      winner.phone,
      winner.prize_type,
      deliveredStr,
    ]
      .map((field) => (field ? field.toLowerCase() : ""))
      .join(" ");

    return combined.includes(term);
  });

  // Sorted winners
  const sortedWinners = [...filteredWinners].sort(sortWinners);

  // Mark delivered
  const handleDeliveredToggle = async (winner) => {
    if (winner.delivery_date) return;
    const confirmAction = window.confirm("¿Estás seguro que deseas marcar este premio como entregado?");
    if (!confirmAction) return;

    const token = localStorage.getItem("cognito_access_token");
    try {
      const resp = await updateWinnersDeliveryDate({ winner_id: winner.winner_id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newDeliveryDate = resp.data.delivery_date;
      setWinnersList((prevList) =>
        prevList.map((w) => (w.winner_id === winner.winner_id ? { ...w, delivery_date: newDeliveryDate } : w))
      );
    } catch (err) {
      handleAuthError(err, "Error al intentar actualizar la fecha de entrega.");
    }
  };

  // -------------------------------
  // QR Codes Logic
  // -------------------------------
  const handleQRCodesClick = () => {
    if (!showQRCodes) fetchQRCodes();
    else setShowQRCodes(false);
  };

  const fetchQRCodes = () => {
    setIsFetchingQrCodes(true);
    setQrCodesError("");

    const token = localStorage.getItem("cognito_access_token");
    fetchQRCodesList({ headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (response.data && response.data.qr_codes) {
          setQrCodesList(response.data.qr_codes);
        }
        setShowQRCodes(true);
      })
      .catch((err) => handleAuthError(err, "Error al intentar obtener la lista de códigos QR."))
      .finally(() => setIsFetchingQrCodes(false));
  };

  // Sorting for QR codes
  function handleSort(field) {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function sortQrCodes(a, b) {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "total_scans") {
      valA = parseFloat(valA || 0);
      valB = parseFloat(valB || 0);
    } else {
      valA = valA ? String(valA).toLowerCase() : "";
      valB = valB ? String(valB).toLowerCase() : "";
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }

  // Filter QR codes
  const filteredQrCodes = qrCodesList.filter((item) => {
    const term = searchTermQr.toLowerCase().trim();
    if (!term) return true;

    const totalScansStr = String(item.total_scans || 0);
    const claimedStr = item.claimed ? "claimed" : "not claimed";
    const validStr = item.is_valid ? "valid" : "invalid";

    if (term === "claimed") return !!item.claimed;
    if (term === "not claimed") return !item.claimed;
    if (term === "valid") return !!item.is_valid;
    if (term === "invalid") return !item.is_valid;

    const combined = [
      item.qr_code_id,
      item.prize_type,
      totalScansStr,
      claimedStr,
      validStr,
    ]
      .map((field) => (field ? field.toLowerCase() : ""))
      .join(" ");

    return combined.includes(term);
  });

  const sortedQrCodes = [...filteredQrCodes].sort(sortQrCodes);

  // Pagination
  const totalPages = Math.ceil(sortedQrCodes.length / pageSize);
  const currentPageData = sortedQrCodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Date Formatting
  function formatDate(utcString) {
    if (!utcString) return "";
    const hasTimeZone = /[zZ+\-]\d*$/.test(utcString);
    let normalized = utcString.trim();
    if (!hasTimeZone && normalized.includes("T")) {
      normalized += "Z";
    }
    const date = new Date(normalized);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  function handlePageSizeChange(e) {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1);
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  // -------------------------------
  // Render QR Codes Table
  // -------------------------------
  function renderQrCodesTable() {
    return (
      <>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("qr_code_id")}
              >
                Código QR
                {sortField === "qr_code_id" && (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th
                style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("prize_type")}
              >
                Tipo de premio
                {sortField === "prize_type" && (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th
                style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("total_scans")}
              >
                Escaneos
                {sortField === "total_scans" && (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th
                style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("claimed")}
              >
                Redimido
                {sortField === "claimed" && (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
              <th
                style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                onClick={() => handleSort("is_valid")}
              >
                Es válido
                {sortField === "is_valid" && (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((qr) => {
              const claimedStr = qr.claimed ? "Yes" : "No";
              const validStr = qr.is_valid ? "Yes" : "No";
              const scans = typeof qr.total_scans === "number" ? qr.total_scans : 0;

              return (
                <tr key={qr.qr_code_id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{qr.qr_code_id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{qr.prize_type}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{scans}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{claimedStr}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{validStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handlePrevPage} disabled={currentPage <= 1}>
            Previous
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage >= totalPages}>
            Next
          </Button>
        </div>
      </>
    );
  }

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Sticky Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 999, background: "white" }}>
        <AdminNavbar />
      </div>

      {/* Main Content */}
      <div
        className="p-6"
        style={{
          overflowY: "auto",
          flexGrow: 1,
          width: "100vw",
          padding: "2rem 1rem 4rem 1.5rem",
          boxSizing: "border-box",
          maxWidth: "1720px",
        }}
      >
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "600px" }}>
            <h1 className="text-2xl font-semibold mb-4">Panel de Control</h1>
            {error && <Alert type="error">{error}</Alert>}

            {/* Stats Card */}
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold mb-2">Estadísticas</h2>
                <ul>
                  <li
                    className="p-2 border-b"
                    style={{ cursor: "pointer" }}
                    onClick={handleQRCodesClick}
                  >
                    <strong>Códigos QR:</strong> {stats.qr_codes_total}
                  </li>
                  <li className="p-2 border-b">
                    <strong>Escaneos totales:</strong> {stats.scans_total}
                  </li>
                  <li
                    className="p-2 border-b"
                    style={{ cursor: "pointer" }}
                    onClick={handleWinnersClick}
                  >
                    <strong>Ganadores:</strong> {stats.winners_total}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Winners Panel */}
            {showWinners && (
              <Card className="mt-4">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">Lista de ganadores</h3>
                  {winnersError && <Alert type="error">{winnersError}</Alert>}
                  {isFetchingWinners && <p>Cargando Ganadores...</p>}

                  {!isFetchingWinners && winnersList.length > 0 && (
                    <>
                      {/* Reload & Search Bar */}
                      <div style={{ marginBottom: "1rem" }}>
                        <button
                          onClick={fetchWinners}
                          style={{ padding: "8px 16px", marginRight: "1rem" }}
                        >
                          Recargar ganadores
                        </button>
                        <input
                          type="text"
                          value={searchTermWinners}
                          onChange={(e) => setSearchTermWinners(e.target.value)}
                          placeholder="Búsqueda de ganadores... (código, nombre, correo, teléfono, premio, delivered)"
                          style={{ width: "60%", padding: "8px" }}
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
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("qr_code_id")}
                            >
                              Código QR
                              {winnersSortField === "qr_code_id" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("name")}
                            >
                              Nombre
                              {winnersSortField === "name" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("email")}
                            >
                              Correo
                              {winnersSortField === "email" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("phone")}
                            >
                              Teléfono
                              {winnersSortField === "phone" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("prize_type")}
                            >
                              Premio
                              {winnersSortField === "prize_type" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("claimed_at")}
                            >
                              Fecha escaneado
                              {winnersSortField === "claimed_at" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                            <th
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                textAlign: "center",
                              }}
                            >
                              Entregado
                            </th>
                            <th
                              style={{ border: "1px solid #ccc", padding: "8px", cursor: "pointer" }}
                              onClick={() => handleWinnersSort("delivery_date")}
                            >
                              Fecha de entrega
                              {winnersSortField === "delivery_date" &&
                                (winnersSortDirection === "asc" ? " ▲" : " ▼")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedWinners.map((winner) => {
                            const claimedDate = formatDate(winner.claimed_at);
                            const deliveredDate = winner.delivery_date ? formatDate(winner.delivery_date) : "";

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
                  {!isFetchingWinners && winnersList.length === 0 && (
                    <p>No se encontraron ganadores.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* QR Codes Panel */}
            {showQRCodes && (
              <Card className="mt-4">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">Códigos QR</h3>
                  {qrCodesError && <Alert type="error">{qrCodesError}</Alert>}
                  {isFetchingQrCodes && <p>Cargando códigos QR...</p>}

                  {!isFetchingQrCodes && qrCodesList.length > 0 && (
                    <>
                      {/* Reload & Search Bar */}
                      <div style={{ marginBottom: "1rem" }}>
                        <button
                          onClick={fetchQRCodes}
                          style={{ padding: "8px 16px", marginRight: "1rem" }}
                        >
                          Recargar códigos QR
                        </button>
                        <input
                          type="text"
                          value={searchTermQr}
                          onChange={(e) => {
                            setSearchTermQr(e.target.value);
                            setCurrentPage(1); // reset to page 1 on new search
                          }}
                          placeholder="Búsqueda de códigos QR... (código, premio, escaneos, redimido, válido)"
                          style={{ width: "60%", padding: "8px" }}
                        />
                      </div>

                      {/* Page size dropdown */}
                      <div style={{ marginBottom: "1rem" }}>
                        <label htmlFor="pageSizeSelect" style={{ marginRight: "8px" }}>
                          Mostrar resultados por:
                        </label>
                        <select
                          id="pageSizeSelect"
                          value={pageSize}
                          onChange={handlePageSizeChange}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      {renderQrCodesTable()}
                    </>
                  )}
                  {!isFetchingQrCodes && qrCodesList.length === 0 && (
                    <p>No se encontraron códigos QR.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
