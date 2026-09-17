import { useState, useRef } from "react";
import { Search, Truck, Scale, RefreshCw, CheckCircle, ChevronRight, Package, Printer, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import RefreshButton from "../../components/RefreshButton";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/*  print helper  */
function printBill(billRef) {
  const content = billRef.current?.innerHTML;
  if (!content) return;

  const win = window.open("", "_blank", "width=860,height=720");
  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Batch Receipt</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print { body { padding: 0; } }
        body { background: #fff; }
      </style>
    </head>
    <body class="p-10 font-sans text-slate-800 bg-white">
      ${content}
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 1200);
}

/*  Bill content  */
function BillContent({ batch, printedAt }) {
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const fields = [
    ["Batch ID", batch.BatchId],
    ["Farmer ID", batch.FarmerId || "N/A"],
    ["Harvest Date", fmtDate(batch.Date)],
    ["Field ID", batch.FeildId],
    ["Cane Variety", batch.Vatiety],
    ["Cane Age", `${batch.Caneage} Months`],
    ["Vehicle Number", batch.VehicleNo || "N/A"],
    ["Storage Unit", batch.Unit],
    ["Weight w/ Vehicle", `${Number(batch.Weightwithvehicle).toFixed(2)} T`],
  ];

  return (
    <div className="font-sans text-slate-800">
      {/* Header  */}
      <div className="text-center border-b-2 border-green-800 pb-4 mb-5">
        <h1 className="text-xl font-extrabold text-green-800 tracking-wide">
          🌿 LANKA SUGAR COMPANY (PVT) LTD
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">
          Batch Registration Receipt &nbsp;·&nbsp; Printed: {printedAt}
        </p>
      </div>

      {/* Sub-title  */}
      <p className="text-center text-[11px] font-bold tracking-[3px] uppercase text-green-800 mb-5">
        — Farmer Delivery Receipt —
      </p>

      {/* Info grid  */}
      <div className="grid grid-cols-2 gap-x-7 gap-y-3 mb-5">
        {fields.map(([label, val]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold tracking-[2px] uppercase text-slate-400">
              {label}
            </span>
            <span className="text-[13px] font-semibold text-slate-800">{val}</span>
          </div>
        ))}
      </div>

      {/* Weight highlight  */}
      <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-xl px-5 py-4 mb-5">
        <span className="text-[10px] font-bold tracking-[2px] uppercase text-green-800">
          Gross Weight with Vehicle (Tonnes)
        </span>
        <span className="text-2xl font-black text-green-800">
          {Number(batch.Weightwithvehicle).toFixed(2)} T
        </span>
      </div>

      {/* Footer  */}
      <div className="border-t border-dashed border-slate-300 pt-4 flex justify-between items-end text-[10px] text-slate-400">
        <div className="flex flex-col gap-0.5">
          <span>Batch ID: <strong className="text-slate-600">{batch.BatchId}</strong></span>
          <span>This receipt is computer generated.</span>
        </div>
        <div className="text-center">
          <div className="w-40 border-t border-slate-500 mt-7 pt-1 text-[10px] text-slate-600">
            Authorised Signature
          </div>
        </div>
      </div>
    </div>
  );
}

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
    const [searchMode, setSearchMode] = useState("batchId"); // "batchId" | "farmerId"
    const [searching, setSearching] = useState(false);
    const [batch, setBatch] = useState(null);
    const [weight, setWeight] = useState(null);

    /* New-vehicle phase */
    const [newWeightWithVehicle, setNewWeightWithVehicle] = useState("");
    const [newVehicleNumber, setNewVehicleNumber] = useState("");
    const [updating, setUpdating] = useState(false);

    /* bill modal state */
    const [showBill, setShowBill] = useState(false);
    const billRef = useRef(null);
    const printedAt = new Date().toLocaleString("en-GB");


    const handleSearch = async () => {
        const id = searchId.trim();
        if (!id) {
            toast.error(searchMode === "batchId" ? "Please enter a Batch ID" : "Please enter a Farmer ID");
            return;
        }

        setSearching(true);
        setBatch(null);
        setWeight(null);
        try {
            const token = localStorage.getItem("authToken");

            /* Choose endpoint based on search mode */
            const endpoint = searchMode === "batchId"
                ? `${API_BASE}/api/batch/find/${encodeURIComponent(id)}`
                : `${API_BASE}/api/batch/find-by-farmer/${encodeURIComponent(id)}`;

            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Batch not found");
            setBatch(data);

            /* Try to load associated weight record (optional, non-blocking) */
            try {
                const res2 = await fetch(`${API_BASE}/api/weight/find/${encodeURIComponent(data.BatchId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data2 = await res2.json();
                if (res2.ok) {
                    if (Array.isArray(data2)) {
                        const totalNetWeight = data2.reduce((sum, w) => sum + (parseFloat(w.NetWeight) || 0), 0);
                        setWeight({ ...data2[0], NetWeight: totalNetWeight });
                    } else {
                        setWeight(data2);
                    }
                }
            } catch (_) { /* weight record may not exist yet */ }

            toast.success("Batch loaded");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSearching(false);
        }
    };


    const handleUpdate = async () => {
        if (!batch) return;
        if (!newWeightWithVehicle || !newVehicleNumber) {
            toast.error("Enter both Weight with Vehicle and Vehicle Number");
            return;
        }

        setUpdating(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(
                `${API_BASE}/api/batch/update-delivery/${encodeURIComponent(batch.BatchId)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ Weightwithvehicle: newWeightWithVehicle, VehicleNo: newVehicleNumber, Date: new Date().toISOString() }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            // Only attempt weight update if there is a weight object backing it contextually in state
            if (weight) {
                const resWeight = await fetch(
                    `${API_BASE}/api/weight/update-delivery/${encodeURIComponent(batch.BatchId)}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ Weightwithvehicle: newWeightWithVehicle, VehicleNo: newVehicleNumber, Date: new Date().toISOString() }),
                    }
                );
                const dataWeight = await resWeight.json();
                if (!resWeight.ok) throw new Error(dataWeight.message || "Weight schema update failed");
                setWeight(prev => ({ ...prev, ...dataWeight.weight, NetWeight: prev.NetWeight }));
            }

            toast.success("Delivery details successfully updated in all schemas!");

            setBatch(data.batch);
            setNewWeightWithVehicle("");
            setNewVehicleNumber("");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleReset = () => {
        setSearchId("");
        setBatch(null);
        setWeight(null);
        setNewWeightWithVehicle("");
        setNewVehicleNumber("");
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

                    {/* ── Search mode toggle ── */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { key: "batchId", label: "Batch ID" },
                            { key: "farmerId", label: "Farmer ID" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => { setSearchMode(key); setSearchId(""); setBatch(null); setWeight(null); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${searchMode === key
                                        ? "bg-green-900 text-white border-green-900"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-green-700 hover:text-green-800"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

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
                                <><Search size={14} /> Search</>
                            )}
                        </button>
                    </div>

                    {/* Hint text under search bar */}
                    {searchMode === "farmerId" && (
                        <p className="text-[11px] text-slate-400 mt-2.5 pl-1">
                            💡 Searching by Farmer ID loads the most recent batch registered under that farmer.
                        </p>
                    )}
                </div>

                {/*  PHASE 2 — Details + New Vehicle */}
                {batch && (
                    <>
                        {/* Batch details card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 mb-5">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                                    Step 2 — Batch Details
                                </p>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowBill(true)} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-green-800 px-4 py-1.5 rounded-full transition shadow-sm">
                                        <Printer size={12} /> Print Receipt
                                    </button>
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                                        <CheckCircle size={12} /> Found
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                <InfoRow label="Batch ID" value={batch.BatchId} />
                                <InfoRow label="Field ID" value={batch.FeildId} />
                                <InfoRow label="Harvest Date" value={fmtDate(batch.Date)} />
                                <InfoRow label="Cane Variety" value={batch.Vatiety} />
                                <InfoRow label="Cane Age (months)" value={batch.Caneage} />
                                <InfoRow label="Storage Unit" value={batch.Unit} />

                            </div>

                            {/* Current net weight highlight */}
                            <div className="mt-6 flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                                <Scale size={22} className="text-green-700 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-green-600">Current Net Weight</p>
                                    <p className="text-2xl font-black text-green-900">{fmt(weight?.NetWeight)} <span className="text-sm font-semibold">Tonnes</span></p>
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
                                {/* update weight with vehicle */}
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

                                {/* Vehicle Number */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                                        Vehicle Number <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. LM-7865"
                                        value={newVehicleNumber}
                                        onChange={(e) => setNewVehicleNumber(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Update button */}
                            <button
                                onClick={handleUpdate}
                                disabled={updating || !newWeightWithVehicle || !newVehicleNumber}
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
                                        Update Batch Delivery
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
                        <p className="text-sm font-semibold">
                            {searchMode === "batchId"
                                ? "Enter a Batch ID above and click Search"
                                : "Enter a Farmer ID above and click Search"}
                        </p>
                        <p className="text-xs mt-1">Batch details and weight update form will appear here</p>
                    </div>
                )}

            </main>

            {/* BILL MODAL */}
            {showBill && batch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-600" />
                                <span className="font-bold text-slate-800 text-sm"> — Farmer Receipt — </span>
                            </div>
                            <button onClick={() => setShowBill(false)} className="text-slate-400 hover:text-slate-700 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <div ref={billRef} className="border border-slate-200 rounded-xl p-6 bg-white">
                                <BillContent batch={batch} printedAt={printedAt} />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                            <button onClick={() => printBill(billRef)} className="flex-1 flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition text-sm">
                                <Printer size={16} /> Print Receipt
                            </button>
                            <button onClick={() => setShowBill(false)} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}