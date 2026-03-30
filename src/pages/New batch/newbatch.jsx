import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function LogNewBatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    batchId: "",
    harvestDate: "",
    fieldId: "",
    caneVariety: "",
    sugarcaneWeightWithVehicle: "",
    vehicleWeight: "",
    actualSugarcaneWeight: "",
    caneAge: "",
    vehicleNo: "",
    storageUnit: "Unit A",
  });

  const handleChange = (key, value) => setForm((p) => {
    const updatedForm = { ...p, [key]: value };

    if (key === "sugarcaneWeightWithVehicle" || key === "vehicleWeight") {
      const withVehicle = parseFloat(updatedForm.sugarcaneWeightWithVehicle);
      const vehicle = parseFloat(updatedForm.vehicleWeight);

      if (!isNaN(withVehicle) && !isNaN(vehicle)) {
        updatedForm.actualSugarcaneWeight = parseFloat((withVehicle - vehicle).toFixed(2)).toString();
      }
    }

    return updatedForm;
  });

  const handleSubmit = async () => {
    // Basic validation
    const required = ["batchId", "harvestDate", "fieldId", "caneVariety", "sugarcaneWeightWithVehicle", "vehicleWeight", "actualSugarcaneWeight", "caneAge"];
    for (const key of required) {
      if (!form[key]) {
        toast.error(`Please fill in all required fields`);
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
        Vatiety: form.caneVariety,
        Weightwithvehicle: parseFloat(form.sugarcaneWeightWithVehicle),
        VehicleWeight: parseFloat(form.vehicleWeight),
        NetWeight: parseFloat(form.actualSugarcaneWeight),
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
      navigate("/batch-list");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 placeholder-slate-300 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition";
  const labelClass =
    "block text-[10px] font-bold tracking-widest text-slate-400 mb-1.5 uppercase";

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Log New Batch" />

      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 m-0">Log New Batch</h1>
            <p className="text-xs text-gray-500 mt-1">
              Record field harvest date and sucrose measurements
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
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-900 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-mid px-14 py-4 rounded-xl transition cursor-pointer"
            >
              {loading ? "Saving…" : "💾 Save Batch"}
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
                <label className={labelClass}>Batch ID <span className="text-red-400">*</span></label>
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
                <label className={labelClass}>Field ID <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="A-12"
                  value={form.fieldId}
                  onChange={(e) => handleChange("fieldId", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Sugarcane Weight With Vehicle */}
              <div>
                <label className={labelClass}>Sugarcane Weight With Vehicle (Tonnes) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="35"
                  value={form.sugarcaneWeightWithVehicle}
                  onChange={(e) => handleChange("sugarcaneWeightWithVehicle", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Actual Sugarcane Weight */}
              <div>
                <label className={labelClass}>Actual Sugarcane Weight / Net Weight (Tonnes) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="24.5"
                  value={form.actualSugarcaneWeight}
                  onChange={(e) => handleChange("actualSugarcaneWeight", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Vehicle Number */}
              <div>
                <label className={labelClass}>Vehicle Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="ABX-1243"
                  value={form.vehicleNo}
                  onChange={(e) => handleChange("vehicleNo", e.target.value)}
                  className={inputClass}
                />
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-5">

              {/* Harvest Date */}
              <div>
                <label className={labelClass}>Harvest Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.harvestDate}
                  onChange={(e) => handleChange("harvestDate", e.target.value)}
                  className={`${inputClass} pr-10`}
                />
              </div>

              {/* Cane Variety */}
              <div>
                <label className={labelClass}>Cane Variety <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.caneVariety}
                    onChange={(e) => handleChange("caneVariety", e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">Select Cane Variety</option>
                    <option value="SL 96 128">SL 96 128</option>
                    <option value="SL 83 06">SL 83 06</option>
                    <option value="SL 96 328">SL 96 328</option>
                    <option value="SL 88 116">SL 88 116</option>
                    <option value="SL 92 5588">SL 92 5588</option>
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

              {/* Vehicle Weight */}
              <div>
                <label className={labelClass}>Vehicle Weight (Tonnes) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="10.5"
                  value={form.vehicleWeight}
                  onChange={(e) => handleChange("vehicleWeight", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Cane Age */}
              <div>
                <label className={labelClass}>Cane Age (Months) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.caneAge}
                    onChange={(e) => handleChange("caneAge", e.target.value)}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">Select Cane Age</option>
                    <option value="6">6 Months</option>
                    <option value="7">7 Months</option>
                    <option value="8">8 Months</option>
                    <option value="9">9 Months</option>
                    <option value="10">10 Months</option>
                    <option value="11">11 Months</option>
                    <option value="12">12 Months</option>
                    <option value="13">13 Months</option>
                    <option value="14">14 Months</option>
                    <option value="15">15 Months</option>

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

              {/* Storage Unit */}
              <div>
                <label className={labelClass}>Storage Unit <span className="text-red-400">*</span></label>
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