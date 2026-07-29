import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-hot-toast";
import { FileClock, Search, ArrowDownRight, Droplets } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/predictions/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.data);
      } else {
        toast.error(data.message || "Failed to load prediction history");
      }
    } catch (err) {
      toast.error("Error fetching history");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.storageCompartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Prediction History" />

      <main className="flex-1 overflow-y-auto p-7">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 m-0">Prediction History</h1>
            <p className="text-sm text-gray-500 mt-1">Review past ML predictions and sucrose loss estimates</p>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by Batch ID or Unit..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-green-500 shadow-sm"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Batch ID</th>
                  <th className="py-4 px-5">Unit</th>
                  <th className="py-4 px-5">Duration</th>
                  <th className="py-4 px-5">Temp</th>
                  <th className="py-4 px-5">Humid</th>
                  <th className="py-4 px-5">Initial Ren.</th>
                  <th className="py-4 px-5">Predicted Ren.</th>
                  <th className="py-4 px-5">Loss (%)</th>
                  <th className="py-4 px-5">Net Weight</th>
                  <th className="py-4 px-5">Sucrose Loss</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-500 font-medium">Loading history...</td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400">
                      <FileClock size={32} className="mx-auto mb-2 opacity-30" />
                      No predictions found
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap">
                        {item.batchId}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md">
                          {item.storageCompartment}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-600 font-medium whitespace-nowrap">
                        {item.durationDays} Days
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-500 whitespace-nowrap">
                        {item.avgTemp}°C
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-500 whitespace-nowrap">
                        {item.avgHumidity}%
                      </td>
                      <td className="py-3 px-8 font-bold text-slate-500 whitespace-nowrap">
                        {item.entryRendement}
                      </td>
                      <td className="py-3 px-8 font-black text-green-700 whitespace-nowrap">
                        {item.predictedRendement}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                          <ArrowDownRight size={14} />
                          {item.predictedLoss}%
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Droplets size={14} className="text-blue-400" />
                          {item.batchWeight} T
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Droplets size={14} className="text-blue-400" />
                          {item.sucroseLoss} T
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
