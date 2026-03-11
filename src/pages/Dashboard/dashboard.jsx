import { useState, useEffect } from "react";
import { RefreshCw, Droplets, PenLine, FlaskConical, Box } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Sidebar from "../../components/Sidebar";

/* ─── DATA ─────────────────────────────────────────── */
const weeklyData = [
  { day: "Mon", v: 62 }, { day: "Tue", v: 74 }, { day: "wed", v: 78 },
  { day: "Thu", v: 70 }, { day: "Fri", v: 88 }, { day: "Sat", v: 80 }, { day: "Sun", v: 84 },
];

const storageUnits = [
  { name: "Unit A", pct: 56 },
  { name: "Unit B", pct: 56 },
  { name: "Unit C", pct: 56 },
];

const systemStatuses = [
  { label: "Sucrose Calculation",  status: "Online",  bg: "bg-green-100",  text: "text-green-700" },
  { label: "Storage Monitor",      status: "Online",  bg: "bg-green-100",  text: "text-green-700" },
  { label: "ML Prediction Model",  status: "Running", bg: "bg-yellow-100", text: "text-yellow-700" },
  { label: "Database Sync",        status: "Working", bg: "bg-amber-100",  text: "text-amber-600" },
];

const batchCards = [
  { iconEl: <Droplets size={17} color="#60a5fa" />, iconBg: "bg-blue-100",   val: "17.4",  label: "BRIX VALUE",  sub: "Concentration of dissolved solids" },
  { iconEl: <PenLine  size={17} color="#34d399" />, iconBg: "bg-green-100",  val: "16.8°", label: "POL VALUE",   sub: "Sucrose polarimetry" },
  { iconEl: <FlaskConical size={17} color="#94a3b8" />, iconBg: "bg-slate-100", val: "2.3%",  label: "PURIETY",    sub: "Pol value / Brix value" },
  { iconEl: <Box size={17} color="#b45309" />,      iconBg: "bg-amber-100",  val: "7.3",   label: "RANDEMENT",  sub: "Extractable suger yield" },
];


export default function Dashboard() {
  const [time, setTime]       = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
          .replace("AM", "A.M").replace("PM", "P.M")
      );
      setDateStr(
        now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleNavigate = (page) => {
    console.log("Navigate to:", page);
    
  };

  const handleLogout = () => {
    console.log("Logout");
    
  };

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar
        activePage="Dashboard"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 m-0">Dashboard Overview</h1>
            <p className="text-xs text-gray-500 mt-1">
              Lanka Suger Company (Pvt) Ltd - Pelwatta Factory &nbsp; {dateStr}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <span className="text-xs font-bold text-gray-900">{time}</span>
          </div>
        </div>

        {/* ── Hero banner ── */}
        <div className="relative rounded-2xl p-7 mb-6 overflow-hidden min-h-[115px]"
          style={{ background: "linear-gradient(120deg, #14532d 0%, #166534 55%, #15803d 100%)" }}>
          <div className="relative z-10">
            <p className="text-[9px] tracking-[2px] text-green-300 font-bold mb-1.5 uppercase">
              System Status - Active
            </p>
            <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
              Sucrose Productivity Monitor
            </h2>
            <p className="text-green-300 text-[13px] m-0">
              Good morning, Ayesh. Here's today factory overview.
            </p>
          </div>
          {/* Live badge */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 block"
              style={{ boxShadow: "0 0 6px #4ade80" }} />
            <span className="text-white text-sm font-semibold">Live</span>
          </div>
        </div>

        {/* ── Previous Batch Details ── */}
        <h3 className="text-sm font-bold text-gray-900 mb-3">Previous Batch Details</h3>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {batchCards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center mb-2`}>
                {c.iconEl}
              </div>
              <div className="text-2xl font-extrabold text-gray-900 leading-none">{c.val}</div>
              <div className="text-[9px] font-bold tracking-widest text-slate-400 mt-1 mb-0.5 uppercase">{c.label}</div>
              <div className="text-[10px] text-slate-300 mb-2">{c.sub}</div>
              <span className="inline-block bg-green-100 text-green-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                + 1.3 vs previous batch
              </span>
            </div>
          ))}
        </div>

        {/* ── Bottom row ── */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 310px" }}>

          {/* Chart card */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Weekly Rendement Trend</h4>
            <ResponsiveContainer width="100%" height={118}>
              <BarChart data={weeklyData} barSize={400} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={{ borderRadius: 7, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11 }}
                />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((_, idx) => (
                    <Cell key={idx} fill="#29A379" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Storage units */}
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Storage Units</p>
              {storageUnits.map((u, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">🏭</span>
                  <span className="text-xs text-slate-600 w-12">{u.name}</span>
                  <span className="text-[11px] text-slate-400 w-80">{u.pct}%</span>
                  <div className="flex-1 bg-slate-200 rounded h-1.5">
                    <div
                      className="h-full rounded"
                      style={{ width: `${u.pct}%`, background: "#29A379" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status card */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4">System Status</h4>
            <div className="flex flex-col gap-3.5">
              {systemStatuses.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 block flex-shrink-0" />
                    <span className="text-[12.5px] text-slate-600">{s.label}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}