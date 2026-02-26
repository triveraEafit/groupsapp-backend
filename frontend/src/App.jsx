import React from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Groups from "./pages/Groups.jsx";
import { getToken, clearToken } from "./api/client.js";

function Protected({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const token = getToken();

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>GroupsApp</Link>
        <div style={{ flex: 1 }} />
        {token ? (
          <button
            onClick={() => {
              clearToken();
              navigate("/login");
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Navigate to={token ? "/groups" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/groups"
          element={
            <Protected>
              <Groups />
            </Protected>
          }
        />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </div>
  );
}