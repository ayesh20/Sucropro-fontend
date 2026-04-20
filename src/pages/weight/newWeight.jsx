import { useState, useEffect } from "react";
import { RefreshCw, Search, CheckCircle, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/* ── tiny info display row ── */
const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-700">{value || "—"}</span>
    </div>
);

/* ── spinner svg ── */
const Spinner = ({ size = 14 }) => (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
);

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function LogNewWeight() {
    const navigate = useNavigate();

    /* ── Search phase ── */
    const [searchQuery, setSearchQuery] = useState("");
    const [searchMode, setSearchMode] = useState("batchId"); // "batchId" | "farmerId"
    const [searching, setSearching] = useState(false);
    const [foundBatch, setFoundBatch] = useState(null);  // batch doc from DB

    /* ── Weight form ── */
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        sugarcaneWeightWithVehicle: "",
        vehicleWeight: "",
        actualSugarcaneWeight: "",
        vehicleNo: "",
        date: "",
    });

    /* ── Derived net weight calc ── */
    const handleWeightChange = (key, value) => {
        setForm((prev) => {
            const updated = { ...prev, [key]: value };
            const gross = parseFloat(updated.sugarcaneWeightWithVehicle);
            const tare = parseFloat(updated.vehicleWeight);
            updated.actualSugarcaneWeight =
                !isNaN(gross) && !isNaN(tare) && gross >= tare
                    ? parseFloat((gross - tare).toFixed(2)).toString()
                    : "";
            return updated;
        });
    };

    /* ── Search handler ── */
    const handleSearch = async () => {
        const q = searchQuery.trim();
        if (!q) {
            toast.error(searchMode === "batchId" ? "Please enter a Batch ID" : "Please enter a Farmer ID");
            return;
        }
        setSearching(true);
        setFoundBatch(null);
        setForm({ sugarcaneWeightWithVehicle: "", vehicleWeight: "", actualSugarcaneWeight: "", vehicleNo: "", date: "" });
        try {
            const token = localStorage.getItem("authToken");
            const endpoint = searchMode === "batchId"
                ? `${API_BASE}/api/batch/find/${encodeURIComponent(q)}`
                : `${API_BASE}/api/batch/find-by-farmer/${encodeURIComponent(q)}`;

            const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Batch not found");

            setFoundBatch(data);
            /* Pre-fill vehicle & date from batch */
            setForm({
                sugarcaneWeightWithVehicle: data.Weightwithvehicle != null ? String(data.Weightwithvehicle) : "",
                vehicleNo: data.VehicleNo || "",
                date: data.Date ? new Date(data.Date).toISOString().split("T")[0] : "",
                vehicleWeight: "",
                actualSugarcaneWeight: "",
            });
            toast.success("Batch found — fields auto-filled");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSearching(false);
        }
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!foundBatch) { toast.error("Search and select a batch first"); return; }

        const required = ["date", "vehicleNo", "sugarcaneWeightWithVehicle", "vehicleWeight", "actualSugarcaneWeight"];
        for (const key of required) {
            if (!form[key]) { toast.error("Please fill in all required fields"); return; }
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const payload = {
                BatchId:               foundBatch.BatchId,
                FeildId:               foundBatch.FeildId   || "",
                CaneAge:               foundBatch.Caneage   || "",
                CaneVariety:           foundBatch.Vatiety   || "",
                StorageUnit:           foundBatch.Unit      || "",
                Date:                  form.date,
                Weightwithvehicle:     parseFloat(form.sugarcaneWeightWithVehicle),
                VehicleWeight:         parseFloat(form.vehicleWeight),
                ActualSugarcaneWeight: parseFloat(form.actualSugarcaneWeight),
                VehicleNo:             form.vehicleNo,
            };

            const res = await fetch(`${API_BASE}/api/weight/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save weight");

            toast.success("Weight logged successfully!");
            navigate("/batch-list");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Reset ── */
    const handleReset = () => {
        setSearchQuery("");
        setFoundBatch(null);
        setForm({ sugarcaneWeightWithVehicle: "", vehicleWeight: "", actualSugarcaneWeight: "", vehicleNo: "", date: "" });
    };

    const inputClass =
        "w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20 transition";
    const labelClass =
        "block text-[10px] font-bold tracking-widest text-slate-400 mb-1.5 uppercase";

    return (
        <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
            <Sidebar activePage="Log New Weight" />

            <main className="flex-1 overflow-y-auto bg-green-50 p-7">

                {/* ── Top bar ── */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
                            <Scale size={26} className="text-green-700" /> Log New Weight
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Search by Batch ID or Farmer ID — details auto-fill
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 text-xs font-semibold px-4 py-2 rounded-lg transition"
                    >
                        <RefreshCw size={12} /> Reset
                    </button>
                </div>

                {/* ════════════════════════════════════
                    STEP 1 — Search
                ════════════════════════════════════ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 mb-5">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                        Step 1 — Find Batch
                    </p>

                    {/* Toggle pills */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { key: "batchId", label: "Batch ID" },
                            { key: "farmerId", label: "Farmer ID" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => { setSearchMode(key); setSearchQuery(""); setFoundBatch(null); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${searchMode === key
                                        ? "bg-green-900 text-white border-green-900"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-green-700 hover:text-green-800"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Search bar */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder={
                                    searchMode === "batchId"
                                        ? "Enter Batch ID  (e.g. B-2024-149)"
                                        : "Enter Farmer ID (e.g. F-001)"
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="flex items-center gap-2 bg-green-900 hover:bg-green-800 disabled:opacity-60 text-white font-bold px-7 py-3 rounded-xl transition text-sm whitespace-nowrap"
                        >
                            {searching ? <><Spinner /> Searching…</> : <><Search size={14} /> Search</>}
                        </button>
                    </div>

                    {searchMode === "farmerId" && (
                        <p className="text-[11px] text-slate-400 mt-2.5 pl-1">
                            💡 Loads the most recent batch registered under that Farmer ID.
                        </p>
                    )}
                </div>

                {/* ════════════════════════════════════
                    STEP 2 — Batch details (auto-filled)
                ════════════════════════════════════ */}
                {foundBatch && (
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
                            <InfoRow label="Batch ID" value={foundBatch.BatchId} />
                            <InfoRow label="Farmer ID" value={foundBatch.FarmerId} />
                            <InfoRow label="Field ID" value={foundBatch.FeildId} />
                            <InfoRow label="Harvest Date" value={fmtDate(foundBatch.Date)} />
                            <InfoRow label="Cane Variety" value={foundBatch.Vatiety} />
                            <InfoRow label="Cane Age" value={foundBatch.Caneage ? `${foundBatch.Caneage} months` : null} />
                            <InfoRow label="Vehicle No" value={foundBatch.VehicleNo} />
                            <InfoRow label="Storage Unit" value={foundBatch.Unit} />
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════
                    STEP 3 — Weight entry
                ════════════════════════════════════ */}
                {foundBatch && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-6">
                            Step 3 — Enter Weight Details
                        </p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-5">

                            {/* LEFT */}
                            <div className="flex flex-col gap-5">

                                {/* Weight with vehicle */}
                                <div>
                                    <label className={labelClass}>
                                        Sugarcane Weight With Vehicle (Tonnes) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0" step="0.01"
                                        placeholder="e.g. 35.00"
                                        value={form.sugarcaneWeightWithVehicle}
                                        onChange={(e) => handleWeightChange("sugarcaneWeightWithVehicle", e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Vehicle weight */}
                                <div>
                                    <label className={labelClass}>
                                        Vehicle Weight (Tonnes) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0" step="0.01"
                                        placeholder="e.g. 10.00"
                                        value={form.vehicleWeight}
                                        onChange={(e) => handleWeightChange("vehicleWeight", e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Net weight (auto-calc) */}
                                <div>
                                    <label className={labelClass}>
                                        Net Sugarcane Weight (Tonnes)
                                        <span className="ml-2 text-[9px] text-slate-300 normal-case font-normal">auto-calculated</span>
                                    </label>
                                    <input
                                        type="number"
                                        readOnly
                                        placeholder="—"
                                        value={form.actualSugarcaneWeight}
                                        className={
                                            form.actualSugarcaneWeight
                                                ? "w-full bg-green-50 border-2 border-green-400 rounded-xl px-4 py-3 text-sm text-green-900 font-black outline-none cursor-not-allowed"
                                                : "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed"
                                        }
                                    />
                                </div>

                            </div>

                            {/* RIGHT */}
                            <div className="flex flex-col gap-5">

                                {/* Vehicle number */}
                                <div>
                                    <label className={labelClass}>
                                        Vehicle Number <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. LM-7865"
                                        value={form.vehicleNo}
                                        onChange={(e) => setForm((p) => ({ ...p, vehicleNo: e.target.value }))}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Delivery date */}
                                <div>
                                    <label className={labelClass}>
                                        Delivery Date <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                                        className={`${inputClass} pr-10`}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Submit button (repeated at bottom for convenience) */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="mt-7 w-full flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-sm shadow-md shadow-green-900/20"
                        >
                            {loading ? <><Spinner size={16} /> Saving…</> : <><Scale size={16} /> Submit Weight</>}
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!foundBatch && !searching && (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                        <Scale size={48} className="mb-4 text-slate-200" />
                        <p className="text-sm font-semibold">
                            {searchMode === "batchId"
                                ? "Enter a Batch ID above and click Search"
                                : "Enter a Farmer ID above and click Search"}
                        </p>
                        <p className="text-xs mt-1">Batch details will auto-fill once found</p>
                    </div>
                )}

            </main>
        </div>
    );
}