import { useState, useRef } from "react";
import { RefreshCw, Printer, X, CheckCircle, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/* ─── print helper ─────────────────────────────────── */
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
      <script src="https://cdn.tailwindcss.com"><\/script>
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
  /* Wait for Tailwind CDN to load before printing */
  setTimeout(() => { win.print(); win.close(); }, 1200);
}

/* ─── Bill content ─── */
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

      {/* ── Header ── */}
      <div className="text-center border-b-2 border-green-800 pb-4 mb-5">
        <h1 className="text-xl font-extrabold text-green-800 tracking-wide">
          🌿 LANKA SUGAR COMPANY (PVT) LTD
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">
          Batch Registration Receipt &nbsp;·&nbsp; Printed: {printedAt}
        </p>
      </div>

      {/* ── Sub-title ── */}
      <p className="text-center text-[11px] font-bold tracking-[3px] uppercase text-green-800 mb-5">
        — Farmer Delivery Receipt —
      </p>

      {/* ── Info grid ── */}
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

      {/* ── Weight highlight ── */}
      <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-xl px-5 py-4 mb-5">
        <span className="text-[10px] font-bold tracking-[2px] uppercase text-green-800">
          Gross Weight with Vehicle (Tonnes)
        </span>
        <span className="text-2xl font-black text-green-800">
          {Number(batch.Weightwithvehicle).toFixed(2)} T
        </span>
      </div>

      {/* ── Footer ── */}
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

/* ─── Main component ──────────────────────────────── */
export default function LogNewBatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    batchId: "",
    harvestDate: "",
    fieldId: "",
    farmerId: "",
    caneVariety: "",
    sugarcaneWeightWithVehicle: "",
    caneAge: "",
    vehicleNo: "",
    storageUnit: "Unit A",
  });

  /* bill modal state */
  const [savedBatch, setSavedBatch] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const billRef = useRef(null);
  const printedAt = new Date().toLocaleString("en-GB");

  /* existing print search state */
  const [searchPrintId, setSearchPrintId] = useState("");
  const [searchingPrint, setSearchingPrint] = useState(false);

  const handleSearchPrint = async () => {
    const id = searchPrintId.trim();
    if (!id) {
      toast.error("Please enter a Batch ID or Farmer ID");
      return;
    }
    setSearchingPrint(true);
    try {
      const token = localStorage.getItem("authToken");
      // Try Batch ID first
      let res = await fetch(`${API_BASE}/api/batch/find/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
      let data = await res.json();

      // If not found by Batch ID, try by Farmer ID
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/batch/find-by-farmer/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
        data = await res.json();
        if (!res.ok) throw new Error("Batch or Farmer not found");
      }

      setSavedBatch(data);
      setShowBill(true);
      toast.success("Existing batch loaded");
      setSearchPrintId("");
    } catch (err) {
      toast.error(err.message || "Failed to find batch");
    } finally {
      setSearchingPrint(false);
    }
  };

  const handleChange = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  /* ── Submit ── */
  const handleSubmit = async () => {
    const required = ["batchId", "harvestDate", "fieldId", "farmerId", "vehicleNo", "caneVariety", "sugarcaneWeightWithVehicle", "caneAge"];
    for (const key of required) {
      if (!form[key]) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        BatchId: form.batchId,
        Date: form.harvestDate,
        FeildId: form.fieldId,
        FarmerId: form.farmerId,
        Vatiety: form.caneVariety,
        Weightwithvehicle: parseFloat(form.sugarcaneWeightWithVehicle),
        Caneage: form.caneAge,
        VehicleNo: form.vehicleNo,
        Unit: form.storageUnit,
      };

      const res = await fetch(`${API_BASE}/api/batch/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save batch");

      toast.success("Batch logged successfully!");
      setSavedBatch(data.batch);   // store for bill
      setShowBill(true);           // open bill modal
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Styles ── */
  const inputClass =
    "w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20 transition";
  const labelClass =
    "block text-[10px] font-bold tracking-widest text-slate-400 mb-1.5 uppercase";
  const chevronSvg = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Log New Batch" />

      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
              <Leaf size={26} className="text-green-700" /> Log New Batch
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Register a new sugarcane harvest delivery
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <div className="flex gap-3">
              {/* Search to Print Existing */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-green-700 focus-within:ring-1 focus-within:ring-green-700 transition shadow-sm h-[48px]">
                <input
                  type="text"
                  placeholder="Print existing (Batch/Farmer ID)"
                  value={searchPrintId}
                  onChange={(e) => setSearchPrintId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchPrint()}
                  className="px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none w-60 h-full"
                />
                <button
                  onClick={handleSearchPrint}
                  disabled={searchingPrint}
                  title="Search & Print Existing"
                  className="bg-slate-50 hover:bg-slate-200 text-slate-700 px-4 h-full border-l border-slate-200 transition flex items-center justify-center disabled:opacity-50"
                >
                  {searchingPrint ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                  ) : (
                    <Printer size={16} />
                  )}
                </button>
              </div>

              {/* Print Current Form State */}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-900 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-10 py-3.5 rounded-xl transition cursor-pointer"
              >
                {loading ? "Saving…" : "💾 Save Batch"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-base font-bold text-gray-900 mb-6">Harvest Information</h2>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">

            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-5">

              {/* Batch ID */}
              <div>
                <label className={labelClass}>Batch ID <span className="text-red-400">*</span></label>
                <input type="text" placeholder="B-2024-149"
                  value={form.batchId}
                  onChange={(e) => handleChange("batchId", e.target.value)}
                  className={inputClass} />
              </div>

              {/* Farmer ID */}
              <div>
                <label className={labelClass}>Farmer ID <span className="text-red-400">*</span></label>
                <input type="text" placeholder="F-001"
                  value={form.farmerId}
                  onChange={(e) => handleChange("farmerId", e.target.value)}
                  className={inputClass} />
              </div>

              {/* Field ID */}
              <div>
                <label className={labelClass}>Field ID <span className="text-red-400">*</span></label>
                <input type="text" placeholder="A-12"
                  value={form.fieldId}
                  onChange={(e) => handleChange("fieldId", e.target.value)}
                  className={inputClass} />
              </div>

              {/* Sugarcane Weight With Vehicle */}
              <div>
                <label className={labelClass}>Sugarcane Weight With Vehicle (Tonnes) <span className="text-red-400">*</span></label>
                <input type="number" placeholder="35"
                  value={form.sugarcaneWeightWithVehicle}
                  onChange={(e) => handleChange("sugarcaneWeightWithVehicle", e.target.value)}
                  className={inputClass} />
              </div>

              {/* Vehicle Number */}
              <div>
                <label className={labelClass}>Vehicle Number <span className="text-red-400">*</span></label>
                <input type="text" placeholder="ABX-1243"
                  value={form.vehicleNo}
                  onChange={(e) => handleChange("vehicleNo", e.target.value)}
                  className={inputClass} />
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-5">

              {/* Harvest Date */}
              <div>
                <label className={labelClass}>Harvest Date <span className="text-red-400">*</span></label>
                <input type="date"
                  value={form.harvestDate}
                  onChange={(e) => handleChange("harvestDate", e.target.value)}
                  className={`${inputClass} pr-10`} />
              </div>

              {/* Cane Variety */}
              <div>
                <label className={labelClass}>Cane Variety <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select value={form.caneVariety}
                    onChange={(e) => handleChange("caneVariety", e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                    <option value="">Select Cane Variety</option>
                    <option value="SL 96 128">SL 96 128</option>
                    <option value="SL 83 06">SL 83 06</option>
                    <option value="SL 96 328">SL 96 328</option>
                    <option value="SL 88 116">SL 88 116</option>
                    <option value="SL 92 5588">SL 92 5588</option>
                  </select>
                  {chevronSvg}
                </div>
              </div>

              {/* Cane Age */}
              <div>
                <label className={labelClass}>Cane Age (Months) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select value={form.caneAge}
                    onChange={(e) => handleChange("caneAge", e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                    <option value="">Select Cane Age</option>
                    {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(m => (
                      <option key={m} value={String(m)}>{m} Months</option>
                    ))}
                  </select>
                  {chevronSvg}
                </div>
              </div>

              {/* Storage Unit */}
              <div>
                <label className={labelClass}>Storage Unit <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select value={form.storageUnit}
                    onChange={(e) => handleChange("storageUnit", e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
                    <option value="Unit A">Unit A</option>
                    <option value="Unit B">Unit B</option>
                    <option value="Unit C">Unit C</option>
                  </select>
                  {chevronSvg}
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* ══════════════════════════════════════════════
          BILL 
      ════════════════════════════════════════════ */}
      {showBill && savedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="font-bold text-slate-800 text-sm"> — Farmer Receipt — </span>
              </div>
              <button
                onClick={() => { setShowBill(false); }}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bill body (scrollable) */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div
                ref={billRef}
                className="border border-slate-200 rounded-xl p-6 bg-white"
              >
                <BillContent batch={savedBatch} printedAt={printedAt} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => printBill(billRef)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={() => { setShowBill(false); }}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}