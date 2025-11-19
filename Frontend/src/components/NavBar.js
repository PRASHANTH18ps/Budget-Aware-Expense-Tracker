import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={{ padding: "8px 16px", background: "#222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontWeight: "bold" }}>Budget Tracker</div>

      <div style={{ display: "flex", gap: 16 }}>
        <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</Link>
        <Link to="/categories" style={{ color: "#fff", textDecoration: "none" }}>Categories</Link>
        <Link to="/budgets" style={{ color: "#fff", textDecoration: "none" }}>Budgets</Link>
        <Link to="/reports" style={{ color: "#fff", textDecoration: "none" }}>Reports</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated ? (
          <>
            {user?.firstName && <div style={{ color: '#fff' }}>Hi, {user.firstName}</div>}
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>Logout</button>
          </>
        ) : (
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Login</Link>
        )}
      </div>
    </nav>
  );
}
