import { useState } from "react";
import axios from "axios";
import logo from "../assets/chilspot-logo.png";
import "../App.css"; // Import CSS styles
import { Alert } from "../components/ui/alert";
import { scanQRCode } from "../services/api";
import { submitWinnerDetails } from "../services/api";

export default function LandingPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [winnerDetails, setWinnerDetails] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ phone: "", email: "" });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{3}-\d{3}-\d{4}$/.test(phone);
  };

  // ------------------------------------
  // Handle reCAPTCHA token retrieval
  // ------------------------------------
  const getRecaptchaToken = async (action = "scan") => {
    // Ensure `window.grecaptcha` is loaded
    if (!window.grecaptcha) {
      console.warn("reCAPTCHA not loaded yet");
      return null;
    }
    try {
      // reCAPTCHA v3: pass your site key from index.html
      const token = await window.grecaptcha.execute("6LfHH_sqAAAAADnByWVRNTdL1u8YicZNmDFffx-T", { action });
      return token;
    } catch (err) {
      console.error("reCAPTCHA execution error:", err);
      return null;
    }
  };

  const handleScan = async () => {
    const userAgent = navigator.userAgent;
    setLoading(true);
    setMessage("");
    setError("");
    setOutcome("");
    
    try {
      // 1. Get reCAPTCHA token for action = 'scan'
      const recaptchaToken = await getRecaptchaToken("scan");
      if (!recaptchaToken) {
        throw new Error("No reCAPTCHA token acquired");
      }

      // 2. Include token in request body
      const response = await scanQRCode(
        { qr_code_id: code, user_agent: userAgent, recaptcha_token: recaptchaToken }
      );
      setMessage(response.data.message);
      setOutcome(response.data.outcome || "NO_PRIZE");
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error. Por favor intente de nuevo.");
    }
    setLoading(false);
  };

  const handleClaimPrize = async () => {
    if (!validateEmail(winnerDetails.email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "El formato de correo no es válido" }));
      return;
    }
    if (!validatePhone(winnerDetails.phone)) {
      setErrors((prevErrors) => ({ ...prevErrors, phone: "El teléfono debe estar como XXX-XXX-XXXX" }));
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");
    
    try {
      // 1. Get reCAPTCHA token for action = 'claimPrize'
      const recaptchaToken = await getRecaptchaToken("claimPrize");
      if (!recaptchaToken) {
        throw new Error("No reCAPTCHA token acquired");
      }

      // 2. Include token in request body
      const response = await submitWinnerDetails(
        { 
          qr_code_id: code, 
          name: winnerDetails.name, 
          phone: winnerDetails.phone, 
          email: winnerDetails.email,
          recaptcha_token: recaptchaToken
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error. Por favor intente de nuevo.");
    }
    setSubmitting(false);
  };

  return (
    <div className="container">
      <img src={logo} alt="ChilSpot Logo" className="App-logo" />
      <h2>¡Gracias por participar en esta promoción!</h2>
      <p>Por favor ingresa el código localizado debajo del QR:</p>
      <input
        type="text"
        placeholder="CHS-XXXXXXXXXX"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={14}
        className="input-field"
        disabled={outcome === 'WINNER'}
      />
      <button onClick={handleScan} disabled={loading || code.length !== 14 || outcome === 'WINNER' || outcome === "CLAIMED"} className="submit-btn">
        {loading ? "Verificando..." : "Verificar código"}
      </button>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {outcome === "WINNER" && (
        <div>
          <h3>Ingresa tu información para obtener tu premio:</h3>
          <input
            type="text"
            placeholder="Nombre completo"
            disabled={message.includes('ganador')}
            value={winnerDetails.name}
            onChange={(e) => setWinnerDetails({ ...winnerDetails, name: e.target.value.replace(/[^a-zA-Z ]/g, "").slice(0, 100) })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="XXX-XXX-XXXX"
            disabled={message.includes('ganador')}
            value={winnerDetails.phone}
            onChange={(e) => {
              let rawValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
              let formattedValue = rawValue
                .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
                .slice(0, 12);
              setWinnerDetails({ ...winnerDetails, phone: formattedValue });
              setErrors({ ...errors, phone: validatePhone(formattedValue) ? "" : "El teléfono debe estar como XXX-XXX-XXXX" });
            }}
            maxLength={12}
            className="input-field"
          />
          {errors.phone && <Alert className="small-error-msg">{errors.phone}</Alert>}

          <input
            type="email"
            placeholder="Correo"
            disabled={message.includes('ganador')}
            onChange={(e) => {
              setWinnerDetails({ ...winnerDetails, email: e.target.value });
              setErrors({ ...errors, email: validateEmail(e.target.value) ? "" : "El formato de correo no es válido" });
            }}
            className="input-field"
          />
          {errors.email && <Alert className="small-error-msg">{errors.email}</Alert>}

          <button
            onClick={handleClaimPrize}
            disabled={submitting || !winnerDetails.name || !winnerDetails.phone || !winnerDetails.email || errors.phone || errors.email || message.includes('ganador')}
            className="submit-btn"
          >
            {submitting ? "Enviando..." : "Obtener mi premio"}
          </button>
        </div>
      )}
    </div>
  );
}
