import { useState } from "react";
import { RefreshCw, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

export default function LogNewBatch() {
  const [form, setForm] = useState({
    batchId: "",
    harvestDate: "",
    fieldId: "",
    caneVariety: "",
    sugarcaneWeightWithVehicle: "",
    vehicleWeight: "",
    actualSugarcaneWeight: "",
    caneAge: "",
    note: "",
    storageUnit: "Unit A",
  });

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = () => {
    console.log(form);
    
  };

  const inputClass =
    "w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 placeholder-slate-300 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition";

  const labelClass = "block text-[10px] font-bold tracking-widest text-slate-400 mb-1.5 uppercase";

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Log New Batch" />

      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 m-0">Log New Batch</h1>
            <p className="text-xs text-gray-500 mt-1">
              Record feild havest date and sucrose measurements
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              onClick={() => {
                handleSubmit();
                toast.success("Batch logged successfully!");
                
              }}
              className="bg-green-900 hover:bg-green-800 text-white font-bold text-mid px-14 py-4 rounded-xl transition cursor-pointer"
            >
              💾 Save Batch
            </button>
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
                <label className={labelClass}>Batch ID</label>
                <input
                  type="text"
                  placeholder="B-2024-149"
                  value={form.batchId}
                  onChange={(e) => handleChange("batchId", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Field ID */}
              <div>
                <label className={labelClass}>Field ID</label>
                <input
                  type="text"
                  placeholder="B-2024-149"
                  value={form.fieldId}
                  onChange={(e) => handleChange("fieldId", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Sugarcane Weight With Vehicle */}
              <div>
                <label className={labelClass}>Sugarcane Weight With Vehicle (Tonnes)</label>
                <input
                  type="number"
                  placeholder="B-2024-149"
                  value={form.sugarcaneWeightWithVehicle}
                  onChange={(e) => handleChange("sugarcaneWeightWithVehicle", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Actual Sugarcane Weight */}
              <div>
                <label className={labelClass}>Actual Sugarcane Weight (Tonnes)</label>
                <input
                  type="number"
                  placeholder="B-2024-149"
                  value={form.actualSugarcaneWeight}
                  onChange={(e) => handleChange("actualSugarcaneWeight", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Note */}
              <div>
                <label className={labelClass}>Note</label>
                <textarea
                  rows={3}
                  placeholder="B-2024-149"
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  className={`${inputClass} resize-y min-h-[80px]`}
                />
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-5">

              {/* Harvest Date */}
              <div>
                <label className={labelClass}>Harvest Date</label>
                <div className="relative">
                  <input
                    type="date"
                    placeholder="02/17/2026"
                    value={form.harvestDate}
                    onChange={(e) => handleChange("harvestDate", e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              {/* Cane Variety */}
              <div>
                <label className={labelClass}>Cane Variety</label>
                <input
                  type="text"
                  placeholder="SL 96328"
                  value={form.caneVariety}
                  onChange={(e) => handleChange("caneVariety", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Vehicle Weight */}
              <div>
                <label className={labelClass}>Vehicle Weight (Tonnes)</label>
                <input
                  type="number"
                  placeholder="25"
                  value={form.vehicleWeight}
                  onChange={(e) => handleChange("vehicleWeight", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Cane Age */}
              <div>
                <label className={labelClass}>Cane Age (Months)</label>
                <input
                  type="number"
                  placeholder="B-2024-149"
                  value={form.caneAge}
                  onChange={(e) => handleChange("caneAge", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Storage Unit */}
              <div>
                <label className={labelClass}>Storage Unit</label>
                <div className="relative">
                  <select
                    value={form.storageUnit}
                    onChange={(e) => handleChange("storageUnit", e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="Unit A">Unit A</option>
                    <option value="Unit B">Unit B</option>
                    <option value="Unit C">Unit C</option>
                  </select>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2"
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}