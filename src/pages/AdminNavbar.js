import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/chilspot-logo.png";

export default function AdminNavbar() {
  const location = useLocation();

  // Logout function
  function handleLogout() {
    localStorage.removeItem("cognito_access_token");
    window.location.href = "/admin/login";
  }

  // Define your admin routes and labels
  const navItems = [
    { to: "/admin", label: "Panel de control" },
    { to: "/admin/create", label: "Crear código QR" },
    { to: "/admin/update", label: "Actualizar código QR" },
  ];

  // Container holding logo + nav
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    background: "#f3f4f6",
    // Enough padding to match overall layout
    padding: "0.5rem 1rem",
  };

  // Nav styling
  const navbarStyle = {
    display: "flex",
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
    padding: "8px 16px",    // Height + padding to match the button
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
    // Add some margin-left to create space between the last tab and this button
    marginLeft: "2rem",
    padding: "11px 16px",    // matches the tabs' vertical + horizontal padding
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    // Because the tabs have a top border radius, we can keep the button fully rounded or do the same shape
    // If you prefer the same top shape as tabs, use: borderRadius: "4px 4px 0 0"
  };

  return (
    <div style={containerStyle}>

      {/* Make the logo clickable: wrap <img> in a <Link> */}
      <Link to="/admin" style={{ marginRight: "1rem" }}>
        <img
          src={logo}
          alt="ChilSpot Logo"
          style={{ width: "150px" }}
        />
      </Link>

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
          Salir
        </button>
      </nav>
    </div>
  );
}
