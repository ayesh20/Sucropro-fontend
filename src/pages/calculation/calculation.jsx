import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Sidebar from "../../components/Sidebar";
import RefreshButton from "../../components/RefreshButton";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function SucroseCalculation() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [brix, setBrix] = useState("");
  const [pol, setPol] = useState("");
  const [purity, setPurity] = useState("");
  const [valueFromDb, setValueFromDb] = useState("");
  const [rendementRes, setRendementRes] = useState(null);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      const [batchRes, renRes] = await Promise.all([
        fetch(`${API_BASE}/api/batch/get`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/rendement/get-rendement`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const batchData = await batchRes.json();
      const renData = await renRes.json();

      if (!batchRes.ok) throw new Error(batchData.message);
      
      const batchList = batchData.batches || [];
      const renList = renData.data || [];

      // Filter out batches that already have a Rendement calculated
      const pendingBatches = batchList.filter(b => 
        !renList.some(r => r.BatchId === b.BatchId)
      );

      setBatches(pendingBatches);
    } catch (err) {
      toast.error("Failed to load batches for calculation");
    }
  };

  const handleCalculatePurity = async () => {
    if (!brix || !pol) {
      toast.error("Please enter BIX and POL");
      return;
    }

    const tId = toast.loading("Calculating purity...");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/rendement/calculate-purity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ brix, pol })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to calculate Purity");

      setPurity(data.purity);
      setValueFromDb(data.valueFromDb);
      toast.success("Purity calculated successfully!", { id: tId });

    } catch (err) {
      toast.error(err.message, { id: tId });
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCalculateRandement = async () => {
    if (!selectedBatchId || !brix || !pol) {
      toast.error("Please select a Batch ID, BIX, and POL");
      return;
    }

    const tId = toast.loading("Calculating Randement...");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/rendement/calculate-randement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ BatchId: selectedBatchId, brix, pol })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to calculate Randement");
      
      setRendementRes(data.data);
      // Update Purity and RealValue just to sync fields in case user clicked "Calculate Now" entirely directly
      setPurity(data.data.purity);
      setValueFromDb(data.data.realValue);

      toast.success("Rendement successfully calculated and saved!", { id: tId });
      
    } catch (err) {
      toast.error(err.message, { id: tId });
    }
  };

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Sucrose Calculation" />

      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 m-0 tracking-tight">Sucrose Calculation</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Automated sucrose productivity calculation engine
            </p>
          </div>
          <RefreshButton onClick={fetchBatches} />
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left Column (Input Parameters) ── */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl shadow-sm p-8 flex flex-col justify-between border border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-6 tracking-tight">Input Parameters</h2>

              {/* SELECT BATCH ID */}
              <div className="mb-6">
                <label className="block text-[9px] font-extrabold tracking-[1.5px] text-slate-500 mb-2 uppercase">SELECT BATCH ID</label>
                <div className="relative">
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-700 appearance-none outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition cursor-pointer"
                  >
                    <option value="">-- Select a Batch --</option>
                    {batches.map(b => (
                      <option key={b._id} value={b.BatchId}>
                        {b.BatchId}
                      </option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="3" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* BIX & POL side by side */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[9px] font-extrabold tracking-[1.5px] text-slate-500 mb-2 uppercase">BIX</label>
                  <input
                    type="number"
                    value={brix}
                    onChange={(e) => setBrix(e.target.value)}
                    placeholder="Enter BIX"
                    className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold tracking-[1.5px] text-slate-500 mb-2 uppercase">POL</label>
                  <input
                    type="number"
                    value={pol}
                    onChange={(e) => setPol(e.target.value)}
                    placeholder="Enter POL"
                    className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-700 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition"
                  />
                </div>
              </div>

              {/* PURITY & Calculate Puerity side by side */}
              <div className="grid grid-cols-2 gap-5 mb-10">
                <div>
                  <label className="block text-[9px] font-extrabold tracking-[1.5px] text-slate-500 mb-2 uppercase">PURITY</label>
                  <input
                    type="text"
                    value={purity}
                    placeholder="Calculated Purity"
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCalculatePurity}
                    className="w-full bg-[#0d4a36] hover:bg-[#0a3829] text-white font-bold text-sm px-4 py-3.5 rounded-xl transition">
                    Calculate Puerity
                  </button>
                </div>
              </div>
            </div>

            {/* Calculate Now button FULL width */}
            <button 
              onClick={handleCalculateRandement}
              className="w-full bg-[#0d4a36] hover:bg-[#0a3829] text-white font-bold text-sm px-4 py-4 rounded-xl transition flex justify-center items-center gap-2">
              <span className="text-yellow-400"><Zap fill="currentColor" size={16} /></span> Calculate Now
            </button>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">

            {/* Dark green card */}
            <div className="bg-[#0f4a38] rounded-3xl p-8 text-white relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-[#a7f3d0] text-sm mb-1 font-medium">Randement</div>
                  <div className="text-[3.5rem] font-black leading-none mb-1 tracking-tighter">{rendementRes ? rendementRes.rendement : "-"}<span className="text-[2.5rem] font-bold">t</span></div>
                  <div className="text-[#a7f3d0] text-xs font-medium tracking-wide">tonnes of sucrose from this battch</div>
                </div>
                <div className="text-right">
                  <div className="text-[#a7f3d0] text-sm mb-1 font-medium">Batch grade</div>
                  <div className="text-xl font-bold">{rendementRes ? rendementRes.grade : "-"}</div>
                </div>
              </div>
            </div>

            {/* Calculation Breakdown card */}
            <div className="bg-white rounded-3xl shadow-sm p-8 flex-1 border border-slate-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-6 tracking-tight">Calculation Breakdown</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-xs font-semibold text-slate-400">Date</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-xs font-semibold text-slate-400">Batch ID</span>
                  <span className="text-xs font-extrabold text-slate-800">{selectedBatchId || "--"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-xs font-semibold text-slate-400">Brix</span>
                  <span className="text-xs font-extrabold text-slate-800">{brix || "--"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-xs font-semibold text-slate-400">Chart Pol</span>
                  <span className="text-xs font-extrabold text-slate-800">{valueFromDb || "--"}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs font-semibold text-slate-400">Peuriety</span>
                  <span className="text-xs font-extrabold text-slate-800">{purity ? `${purity}%` : "--"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
