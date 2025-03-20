import { useState } from "react";
import axios from "axios";
import logo from "../assets/chilspot-logo.png";
import "../App.css"; // Import CSS styles
import { Alert } from "../components/ui/alert";

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

  const handleScan = async () => {
    const userAgent = navigator.userAgent;
    setLoading(true);
    setMessage("");
    setError("");
    setOutcome("");
    
    try {
      const response = await axios.post(
        "https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg/scan",
        { qr_code_id: code, user_agent: userAgent }
      );
      setMessage(response.data.message);
      setOutcome(response.data.outcome || "NO_PRIZE");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleClaimPrize = async () => {
    if (!validateEmail(winnerDetails.email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "Invalid email format" }));
      return;
    }
    if (!validatePhone(winnerDetails.phone)) {
      setErrors((prevErrors) => ({ ...prevErrors, phone: "Phone must be in XXX-XXX-XXXX format" }));
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");
    
    try {
      const response = await axios.post(
        "https://4n6n2dwrla.execute-api.us-west-1.amazonaws.com/stg/submit-winner",
        { 
          qr_code_id: code, 
          name: winnerDetails.name, 
          phone: winnerDetails.phone, 
          email: winnerDetails.email 
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="container">
      <img src={logo} alt="ChilSpot Logo" className="App-logo" />
      <h2>Thank you for participating in this contest!</h2>
      <p>Please provide your code below:</p>
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
        {loading ? "Checking..." : "Submit"}
      </button>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {outcome === "WINNER" && (
        <div>
          <h3>Enter your details to claim your prize:</h3>
          <input
            type="text"
            placeholder="Name"
            disabled={message.includes('successfully')}
            value={winnerDetails.name}
            onChange={(e) => setWinnerDetails({ ...winnerDetails, name: e.target.value.replace(/[^a-zA-Z ]/g, "").slice(0, 100) })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="XXX-XXX-XXXX"
            disabled={message.includes('successfully')}
            value={winnerDetails.phone}
            onChange={(e) => {
              let rawValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
              let formattedValue = rawValue
                .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
                .slice(0, 12);
              setWinnerDetails({ ...winnerDetails, phone: formattedValue });
              setErrors({ ...errors, phone: validatePhone(formattedValue) ? "" : "Phone must be in XXX-XXX-XXXX format" });
            }}
            maxLength={12}
            className="input-field"
          />
          {errors.phone && <Alert className="small-error-msg">{errors.phone}</Alert>}

          <input
            type="email"
            placeholder="Email"
            disabled={message.includes('successfully')}
            onChange={(e) => {
              setWinnerDetails({ ...winnerDetails, email: e.target.value });
              setErrors({ ...errors, email: validateEmail(e.target.value) ? "" : "Invalid email format" });
            }}
            className="input-field"
          />
          {errors.email && <Alert className="small-error-msg">{errors.email}</Alert>}

          <button
            onClick={handleClaimPrize}
            disabled={submitting || !winnerDetails.name || !winnerDetails.phone || !winnerDetails.email || errors.phone || errors.email || message.includes('successfully')}
            className="submit-btn"
          >
            {submitting ? "Submitting..." : "Claim my Prize"}
          </button>
        </div>
      )}
    </div>
  );
}
