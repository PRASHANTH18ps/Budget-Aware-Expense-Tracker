import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import NavBar from "./components/NavBar";
import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

function AppInner() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <NavBar />}
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard/></PrivateRoute>
          } />

          <Route path="/categories" element={
            <PrivateRoute><Categories/></PrivateRoute>
          } />

          <Route path="/budgets" element={
            <PrivateRoute><Budgets/></PrivateRoute>
          } />

          <Route path="/reports" element={
            <PrivateRoute><Reports/></PrivateRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}
