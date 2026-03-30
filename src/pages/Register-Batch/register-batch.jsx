import { useState } from "react";
import { Search, Truck, Scale, RefreshCw, CheckCircle, ChevronRight, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import RefreshButton from "../../components/RefreshButton";

const API_BASE = import.meta.env.VITE_BACKEND_URL;


const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{value ?? "—"}</span>
    </div>
);

const fmt = (n) => (n !== undefined && n !== null ? Number(n).toFixed(2) : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");


export default function RegisterBatch() {
    /* Search phase */
    const [searchId, setSearchId] = useState("");
    const [searching, setSearching] = useState(false);
    const [batch, setBatch] = useState(null);          // fetched batch document

    /* New-vehicle phase */
    const [newWeightWithVehicle, setNewWeightWithVehicle] = useState("");
    const [newVehicleWeight, setNewVehicleWeight] = useState("");
    const [updating, setUpdating] = useState(false);

    /* Derived */
    const newNetWeight =
        newWeightWithVehicle !== "" && newVehicleWeight !== ""
            ? Math.max(0, parseFloat(newWeightWithVehicle) - parseFloat(newVehicleWeight))
            : null;

    const totalNetWeight =
        batch && newNetWeight !== null
            ? parseFloat((batch.NetWeight + newNetWeight).toFixed(2))
            : null;


    const handleSearch = async () => {
        const id = searchId.trim();
        if (!id) { toast.error("Please enter a Batch ID"); return; }

        setSearching(true);
        setBatch(null);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_BASE}/api/batch/find/${encodeURIComponent(id)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Batch not found");
            setBatch(data);
            toast.success("Batch loaded");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSearching(false);
        }
    };


    const handleUpdate = async () => {
        if (!batch) return;
        if (!newWeightWithVehicle || !newVehicleWeight) {
            toast.error("Enter both weight fields");
            return;
        }
        if (newNetWeight === null || isNaN(newNetWeight)) {
            toast.error("Invalid weight values");
            return;
        }

        setUpdating(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(
                `${API_BASE}/api/batch/update-weight/${encodeURIComponent(batch.BatchId)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ newNetWeight }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            toast.success("Batch weight updated successfully!");

            setBatch(data.batch);
            setNewWeightWithVehicle("");
            setNewVehicleWeight("");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleReset = () => {
        setSearchId("");
        setBatch(null);
        setNewWeightWithVehicle("");
        setNewVehicleWeight("");
    };

    const inputClass =
        "w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20 transition";


    return (
        <div className="flex h-screen font-sans bg-gradient-to-br from-green-50 to-slate-100 overflow-hidden">
            <Sidebar activePage="Registered Batches" />

            <main className="flex-1 overflow-y-auto p-7">

                {/* ── Top bar ── */}
                <div className="flex justify-between items-start mb-7">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
                            Register Batch Weight
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Search an existing batch and add new vehicle delivery weight
                        </p>
                    </div>
                    <RefreshButton />
                </div>


                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 mb-5">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                        Step 1 — Find Batch
                    </p>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Enter Batch ID (e.g. B-2024-149)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="flex items-center gap-2 bg-green-900 hover:bg-green-800 disabled:opacity-60 text-white font-bold px-7 py-3 rounded-xl transition cursor-pointer text-sm whitespace-nowrap"
                        >
                            {searching ? (
                                <>
                                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    Searching…
                                </>
                            ) : (
                                <>
                                    <Search size={14} /> Search
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    PHASE 2 — Details + New Vehicle
                ══════════════════════════════════════════ */}
                {batch && (
                    <>
                        {/* Batch details card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 mb-5">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                                    Step 2 — Batch Details
                                </p>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                                    <CheckCircle size={12} /> Found
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                <InfoRow label="Batch ID" value={batch.BatchId} />
                                <InfoRow label="Field ID" value={batch.FeildId} />
                                <InfoRow label="Harvest Date" value={fmtDate(batch.Date)} />
                                <InfoRow label="Cane Variety" value={batch.Vatiety} />
                                <InfoRow label="Cane Age (months)" value={batch.Caneage} />
                                <InfoRow label="Storage Unit" value={batch.Unit} />
                                <InfoRow label="Weight with Vehicle (T)" value={fmt(batch.Weightwithvehicle)} />
                                <InfoRow label="Vehicle Weight (T)" value={fmt(batch.VehicleWeight)} />
                            </div>

                            {/* Current net weight highlight */}
                            <div className="mt-6 flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                                <Scale size={22} className="text-green-700 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-green-600">Current Net Weight</p>
                                    <p className="text-2xl font-black text-green-900">{fmt(batch.NetWeight)} <span className="text-sm font-semibold">Tonnes</span></p>
                                </div>
                            </div>
                        </div>

                        {/* New vehicle entry card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 mb-5">
                            <div className="flex items-center gap-2 mb-5">
                                <Truck size={18} className="text-green-700" />
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                                    Step 3 — Add New Vehicle Delivery
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                                {/* Weight with vehicle */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                                        Weight with Vehicle (Tonnes) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 32.50"
                                        value={newWeightWithVehicle}
                                        onChange={(e) => setNewWeightWithVehicle(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Vehicle weight */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                                        Vehicle Weight (Tonnes) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 8.00"
                                        value={newVehicleWeight}
                                        onChange={(e) => setNewVehicleWeight(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Live calculation summary */}
                            {newNetWeight !== null && !isNaN(newNetWeight) && (
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {/* New net weight */}
                                    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl py-4 px-3 text-center">
                                        <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-1">New Net Weight</p>
                                        <p className="text-xl font-black text-slate-800">{fmt(newNetWeight)}</p>
                                        <p className="text-xs text-slate-400">Tonnes</p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-1 text-slate-300">
                                            <ChevronRight size={28} className="text-green-600 animate-pulse" />
                                            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">Added to</span>
                                        </div>
                                    </div>

                                    {/* Total net weight */}
                                    <div className="flex flex-col items-center justify-center bg-green-900 rounded-xl py-4 px-3 text-center shadow-lg shadow-green-900/20">
                                        <p className="text-[9px] font-bold tracking-widest uppercase text-green-300 mb-1">Total Net Weight</p>
                                        <p className="text-xl font-black text-white">{fmt(totalNetWeight)}</p>
                                        <p className="text-xs text-green-300">Tonnes</p>
                                    </div>
                                </div>
                            )}

                            {/* Update button */}
                            <button
                                onClick={handleUpdate}
                                disabled={updating || newNetWeight === null || isNaN(newNetWeight)}
                                className="w-full flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-sm shadow-md shadow-green-900/20"
                            >
                                {updating ? (
                                    <>
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                        Updating…
                                    </>
                                ) : (
                                    <>
                                        <Scale size={16} />
                                        Update Batch Weight
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!batch && !searching && (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                        <Package size={48} className="mb-4 text-slate-200" />
                        <p className="text-sm font-semibold">Enter a Batch ID above and click Search</p>
                        <p className="text-xs mt-1">Batch details and weight update form will appear here</p>
                    </div>
                )}

            </main>
        </div>
    );
}