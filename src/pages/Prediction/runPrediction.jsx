import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-hot-toast";
import { Zap, Search, Activity, Thermometer, Droplets, Clock, Box, TrendingDown, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function RunPrediction() {
  const [batches, setBatches] = useState([]);
  const [predictedBatchIds, setPredictedBatchIds] = useState(new Set());
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [loadingBatch, setLoadingBatch] = useState(false);

  // Form states
  const [duration, setDuration] = useState(2);
  const [storageUnit, setStorageUnit] = useState("");
  const [temp, setTemp] = useState(30);
  const [humidity, setHumidity] = useState(70);

  // Prediction states
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchBatches();
    fetchPredictedBatchIds();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/batch/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.batches) {
        // Sort batches to show newest first
        const sorted = data.batches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBatches(sorted);
      }
    } catch (err) {
      toast.error("Failed to load batches");
    }
  };

  const fetchPredictedBatchIds = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/predictions/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const ids = new Set(data.data.map(p => p.batchId));
        setPredictedBatchIds(ids);
      }
    } catch (err) {
    }
  };

  const handleBatchSelect = async (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    setResult(null);

    if (!batchId) {
      setBatchData(null);
      return;
    }

    setLoadingBatch(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/predictions/batch-data/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBatchData(data);
        setStorageUnit(data.storageCompartment);
      } else {
        toast.error(data.message || "Failed to load batch details");
        setBatchData(null);
      }
    } catch (err) {
      toast.error("Error fetching batch data");
      setBatchData(null);
    } finally {
      setLoadingBatch(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedBatchId) {
      return toast.error("Please select a batch first");
    }

    setPredicting(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/predictions/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          batchId: selectedBatchId,
          durationDays: duration,
          avgTemp: temp,
          avgHumidity: humidity
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Prediction successful!");
        const rawFeatures = data.data.featureImportance || {};
        const formattedFeatures = Object.keys(rawFeatures).map(key => ({
          name: key,
          value: parseFloat((rawFeatures[key] * 100).toFixed(2)) // Convert to percentage
        })).sort((a, b) => b.value - a.value); // Sort descending

        setResult({
          ...data.data,
          chartData: formattedFeatures
        });
      } else {
        toast.error(data.message || "Prediction failed");
      }
    } catch (err) {
      toast.error("Error connecting to ML service");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Run Prediction" />

      <main className="flex-1 overflow-y-auto p-7">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 m-0">Run ML Prediction</h1>
          <p className="text-sm text-gray-500 mt-1">Predict post-storage sucrose rendement and analyze losses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">



          {/* Left Column: Form & Batch Details */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Input Form */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
              <div className="flex items-center gap-2 mb-4 text-green-800">
                <Search size={18} />
                <h2 className="text-sm font-bold">Prediction Inputs</h2>
              </div>

              <form onSubmit={handlePredict} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Batch</label>
                  <select
                    value={selectedBatchId}
                    onChange={handleBatchSelect}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 bg-slate-50"
                    required
                  >
                    <option value="">-- Choose Batch ID --</option>
                    {batches
                      .filter(b => !predictedBatchIds.has(b.BatchId))
                      .map(b => (
                        <option key={b.BatchId} value={b.BatchId}>{b.BatchId}</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Box size={14} className="text-amber-500" /> Storage Unit
                  </label>
                  <input
                    type="text"
                    value={storageUnit || ""}
                    placeholder="Auto-filled from batch..."
                    disabled
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" /> Storage Duration (Days)
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 bg-slate-50"
                  >
                    <option value={2}>2 Days</option>
                    <option value={3}>3 Days</option>
                    <option value={4}>4 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Thermometer size={14} className="text-red-500" /> Avg Temperature (°C)
                  </label>
                  <input
                    type="number"
                    min="20" max="45" step="0.1"
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Droplets size={14} className="text-blue-500" /> Avg Humidity (%)
                  </label>
                  <input
                    type="number"
                    min="30" max="100" step="1"
                    value={humidity}
                    onChange={e => setHumidity(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 bg-slate-50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={predicting || !selectedBatchId || loadingBatch}
                  className={`mt-2 w-full py-2.5 rounded-lg text-white font-bold text-sm transition-colors flex items-center justify-center gap-2
                    ${predicting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
                >
                  {predicting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Predicting...
                    </span>
                  ) : (
                    <>
                      <Zap size={16} fill="currentColor" /> Run ML Model
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-lg text-white font-bold text-sm transition-colors bg-slate-500 hover:bg-slate-600"
                  onClick={() => {
                    setSelectedBatchId("");
                    setBatchData(null);
                    setStorageUnit("");
                    setDuration(2);
                    setTemp(30);
                    setHumidity(70);
                    setResult(null);
                  }}
                >
                  Clear All
                </button>
              </form>
            </div>


            {loadingBatch && (
              <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-center text-sm text-slate-500 font-medium">
                Loading batch data...
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {!result && !predicting && (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                <Activity size={48} className="mb-3 opacity-20" />
                <p className="font-semibold">No Prediction Results Yet</p>
                <p className="text-xs mt-1">Select a batch and run the model to see insights</p>
              </div>
            )}

            {result && (
              <>
                {/* Result Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-5 shadow-md text-white">
                    <div className="text-[11px] font-bold tracking-wider text-green-300 uppercase mb-2">Predicted Rendement</div>
                    <div className="text-4xl font-black">{result.predictedRendement}</div>
                    <div className="text-xs text-green-200 mt-2">After {result.durationDays} days of storage</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
                      Rendement Drop <TrendingDown size={14} className="text-red-500" />
                    </div>
                    <div className="text-3xl font-black text-red-600">-{result.predictedLoss}</div>
                    <div className="text-xs text-slate-500 mt-2 font-medium">From initial {result.entryRendement}</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
                      Est. Sucrose Loss <Box size={14} className="text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-amber-600">{result.sucroseLoss}</div>
                    <div className="text-xs text-slate-500 mt-2 font-medium">Tons of extractable sugar</div>
                  </div>
                </div>

                {/* Batch Baseline Details */}
                {batchData && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">Baseline Batch Data</h2>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Entry Rendement</div>
                        <div className="text-lg font-black text-gray-800">{batchData.entryRendement}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Compartment</div>
                        <div className="text-lg font-black text-amber-600">{batchData.storageCompartment}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Initial Brix</div>
                        <div className="text-base font-bold text-gray-800">{batchData.entryBrix}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Initial Pol</div>
                        <div className="text-base font-bold text-gray-800">{batchData.entryPol}°</div>
                      </div>
                      <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Net Weight</div>
                          <div className="text-base font-bold text-gray-800">{batchData.batchWeight} Tons</div>
                        </div>
                        <Scale size={20} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
