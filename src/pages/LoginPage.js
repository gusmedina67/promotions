import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles the login logic
  async function handleLogin(e) {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError("");

    // Simple required-field check
    if (!email || !password) {
      setError("Both email and password are required.");
      setLoading(false);
      return;
    }

    try {
      // Use AWS Cognito "InitiateAuth" endpoint
      const response = await axios.post(
        "https://cognito-idp.us-west-1.amazonaws.com/",
        {
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: "47s7pii5683hi61vojk02jff9v", // Replace with your actual ClientId
        },
        {
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
          },
        }
      );

      // Extract the Access Token (or IdToken)
      const accessToken = response.data.AuthenticationResult.AccessToken;
      const idToken = response.data.AuthenticationResult.IdToken;

      // Store token in localStorage or context (using idToken here as you did)
      localStorage.setItem("cognito_access_token", idToken);

      // Redirect to admin page
      window.location.href = "/admin";
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Form wrapper handles Enter key submission */}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Email or Username"
            style={{ width: "100%", padding: "8px" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Password"
            style={{ width: "100%", padding: "8px" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Disable the button if fields are empty or loading */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          style={{ padding: "10px 20px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
