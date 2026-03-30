import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login/Login.jsx";
import Dashboard from "./pages/Dashboard/dashboard.jsx";
import LogNewBatch from "./pages/New batch/newbatch.jsx";
import UserManagement from "./pages/Usermanagement/usermanagement.jsx";
import AllBatches from "./pages/All batch/allbatch.jsx";
import SucroseCalculation from "./pages/calculation/calculation.jsx";
import RegisterBatch from "./pages/Register-Batch/register-batch.jsx";


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

          <Route path="/" element={<Login />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-batch" element={<LogNewBatch />} />
          <Route path="/batch-list" element={<AllBatches />} />
          <Route path="/calculation" element={<SucroseCalculation />} />
          <Route path="/registered-batches" element={<RegisterBatch />} />



          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;