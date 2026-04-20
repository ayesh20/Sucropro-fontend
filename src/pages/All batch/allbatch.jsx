import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import RefreshButton from "../../components/RefreshButton";
import Pagination from "../../components/Pagination";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const PAGE_SIZE = 5;

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function AllBatches() {
  const [batches, setBatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const [batchRes, renRes, weightRes] = await Promise.all([
        fetch(`${API_BASE}/api/batch/get`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/rendement/get-rendement`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/weight/get-all`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const batchData = await batchRes.json();
      const renData = await renRes.json();
      const weightData = await weightRes.json();

      if (!batchRes.ok) throw new Error(batchData.message);

      const batchList = batchData.batches || [];
      const renList = renData.data || [];
      const weightList = weightData.weights || [];

      // Merge backend rendements and weights into batches by BatchId
      const mergedBatches = batchList.map(b => {
        const ren = renList.find(r => r.BatchId === b.BatchId);
        const weight = weightList.find(w => w.BatchId === b.BatchId);
        return {
          ...b,
          Brix: ren ? ren.Brix : "—",
          Pol: ren ? ren.Pol : "—",
          ActualPol: ren ? ren.RealValue : "—",
          Ren: ren ? ren.Rendement : "—",
          Purity: ren ? ren.Purity : "—",
          Grade: ren ? ren.Grade : "—",
          NetWeight: weight && weight.NetWeight !== undefined ? weight.NetWeight : b.NetWeight || "—",
          VehicleNo: weight && weight.VehicleNo ? weight.VehicleNo : b.VehicleNo || "—"
        };
      });

      setBatches(mergedBatches);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter logic
  useEffect(() => {
    let result = [...batches];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.BatchId?.toLowerCase().includes(q) ||
          b.FeildId?.toLowerCase().includes(q) ||
          b.Vatiety?.toLowerCase().includes(q)
      );
    }

    // Time filter
    const now = new Date();
    if (timeFilter === "today") {
      result = result.filter((b) => {
        const d = new Date(b.Date);
        return d.toDateString() === now.toDateString();
      });
    } else if (timeFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      result = result.filter((b) => new Date(b.Date) >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      result = result.filter((b) => new Date(b.Date) >= monthAgo);
    }

    setFiltered(result);
    setPage(1);
  }, [search, timeFilter, batches]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this batch?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/batch/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Batch deleted");
      setBatches((prev) => prev.filter((b) => b._id !== id));
    } catch {
      toast.error("Failed to delete batch");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="All Batches" />

      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 m-0">All Batches</h1>
            <p className="text-xs text-gray-500 mt-1">
              {batches.length} total batches logged this system
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <RefreshButton onClick={fetchData} />
            <button
              onClick={() => toast("Export PDF coming soon")}
              className="bg-green-900 hover:bg-green-800 text-white font-bold text-sm px-8 py-3 rounded-xl transition"
            >
              Export pdf
            </button>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* Search + filter row */}
          <div className="flex gap-3 mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search batch, field..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition w-56"
              />
            </div>

            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-green-700 transition cursor-pointer"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#94a3b8" strokeWidth="2"
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm">Loading batches…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No batches found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Batch ID", "Date", "Field", "Variety", "Weight (T)", "Unit", "vehicle-No", "Brix*", "Pol%", "AcPol%", "Ren", "Purity", "Grade", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase pb-3 pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((batch) => (
                  <tr key={batch._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{batch.BatchId}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatDate(batch.Date)}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.FeildId}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Vatiety}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.NetWeight}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Unit}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.VehicleNo}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Brix}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Pol}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.ActualPol}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Ren}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Purity}</td>
                    <td className="py-3 pr-4 text-slate-600">{batch.Grade}</td>

                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(batch._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                        title="Delete batch"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination footer */}
          {!loading && filtered.length > 0 && (
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={filtered.length}
            />
          )}
        </div>

      </main>
    </div>
  );
}