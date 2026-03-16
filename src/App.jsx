import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth Pages
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Usermanagement/usermanagement.jsx";

// App Pages
import Dashboard from "./pages/Dashboard/dashboard.jsx";
import LogNewBatch from "./pages/New batch/newbatch.jsx";
import UserManagement from "./pages/Usermanagement/usermanagement.jsx";


function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: {
            duration: 3000,
            iconTheme: { primary: "#4ade80", secondary: "#fff" },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/"          element={<Login />} />
          <Route path="/user-management"  element={<UserManagement />} />

          {/* App */}
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/new-batch"           element={<LogNewBatch />} />
         

          {/* Catch all → redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;