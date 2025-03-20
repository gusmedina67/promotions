import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Check for the token
  const token = localStorage.getItem("cognito_access_token");

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Otherwise, render the protected component
  return children;
}
 