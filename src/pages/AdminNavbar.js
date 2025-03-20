import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminNavbar() {
  const location = useLocation();

  // Logout function
  function handleLogout() {
    localStorage.removeItem("cognito_access_token");
    window.location.href = "/admin/login";
  }

  // Define your admin routes and labels
  const navItems = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/create", label: "Create QR Code" },
    { to: "/admin/update", label: "Update QR Code" },
  ];

  // Some basic styling for the nav container
  const navbarStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "0.5rem 1rem",
    borderBottom: "1px solid #ccc",
  };

  // Tabs container to hold all nav links
  const tabsStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "0.5rem",
  };

  // Default link style
  const linkStyle = {
    display: "inline-block",
    padding: "8px 16px",
    textDecoration: "none",
    color: "#555",
    border: "1px solid #ccc",
    backgroundColor: "#e9ecef",
    borderRadius: "4px 4px 0 0",
    transition: "all 0.2s ease",
  };

  // Active tab style
  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: "#fff",
    color: "#007bff",
    borderBottom: "2px solid #007bff",
    fontWeight: "bold",
  };

  // Logout button styling
  const logoutButtonStyle = {
    marginLeft: "auto",
    padding: "8px 16px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <nav style={navbarStyle}>
      <div style={tabsStyle}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={isActive ? activeLinkStyle : linkStyle}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <button onClick={handleLogout} style={logoutButtonStyle}>
        Logout
      </button>
    </nav>
  );
}
