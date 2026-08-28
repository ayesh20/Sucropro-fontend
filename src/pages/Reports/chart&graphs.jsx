import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import RefreshButton from "../../components/RefreshButton";
import { toast } from "react-hot-toast";
import { RefreshCw, TrendingUp, TrendingDown, Package, Activity, Thermometer, Droplets, BarChart2 } from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, Area, AreaChart, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const COLORS = {
    green: "#22c55e",
    lime: "#a3e635",
    red: "#f87171",
    blue: "#60a5fa",
    purple: "#a78bfa",
    amber: "#fbbf24",
    teal: "#2dd4bf",
    dark: "#0e5a46"
};

const UNIT_COLORS = { "Unit A": "#22c55e", "Unit B": "#22c55e", "Unit C": "#22c55e" };

function SectionTitle({ title, subtitle, icon: Icon }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl" style={{ background: "rgba(34,197,94,0.12)" }}>
                <Icon size={18} color="#22c55e" />
            </div>
            <div>
                <h2 className="text-[15px] font-extrabold text-gray-800 m-0 leading-tight">{title}</h2>
                <p className="text-[11px] text-slate-400 m-0">{subtitle}</p>
            </div>
        </div>
    );
}

function KpiCard({ label, value, unit, icon: Icon, color, trend }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl" style={{ background: `${color}18` }}>
                    <Icon size={18} style={{ color }} />
                </div>
                {trend !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <div className="text-2xl font-black text-gray-900">{value}<span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span></div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</div>
            </div>
        </div>
    );
}

const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
            <p className="font-bold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
            ))}
        </div>
    );
};

const CustomLineTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const date = payload[0]?.payload?.date;
    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
            <p className="font-bold text-gray-700 mb-1">{label} {date && <span className="text-slate-400 font-normal">({date})</span>}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {Number(p.value).toFixed(2)}</p>
            ))}
        </div>
    );
};

export default function ChartsGraphs() {
    const [dailyBatches, setDailyBatches] = useState([]);
    const [storagePerf, setStoragePerf] = useState([]);
    const [kpi, setKpi] = useState(null);
    const [rendement, setRendement] = useState([]);
    const [loading, setLoading] = useState({ daily: true, storage: true, kpi: true, rendement: true });
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const token = () => localStorage.getItem("authToken");
    const headers = () => ({ Authorization: `Bearer ${token()}` });

    const fetchAll = useCallback(async () => {
        setLoading({ daily: true, storage: true, kpi: true, rendement: true });
        try {
            const [dailyRes, storageRes, kpiRes, rendRes] = await Promise.all([
                fetch(`${API_BASE}/api/charts/daily-batches`, { headers: headers() }),
                fetch(`${API_BASE}/api/charts/storage-performance`, { headers: headers() }),
                fetch(`${API_BASE}/api/charts/kpi-summary`, { headers: headers() }),
                fetch(`${API_BASE}/api/charts/rendement-trend`, { headers: headers() }),
            ]);

            if (dailyRes.ok) { const d = await dailyRes.json(); setDailyBatches(d.data || []); }
            else toast.error("Failed to load daily batches");

            if (storageRes.ok) { const d = await storageRes.json(); setStoragePerf(d.data || []); }
            else toast.error("Failed to load storage performance");

            if (kpiRes.ok) { const d = await kpiRes.json(); setKpi(d.data); }


            if (rendRes.ok) { const d = await rendRes.json(); setRendement(d.data || []); }


            setLastRefresh(new Date());
        } catch (err) {
            toast.error("Network error loading chart data");
        } finally {
            setLoading({ daily: false, storage: false, kpi: false, rendement: false });
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Last 7 days slice for daily chart
    const dailySlice = dailyBatches.slice(-7);

    // Last 7 rendement entries slice for Section 4
    const rendementSlice = rendement.slice(-10);
    console.log("rendementSlice:", rendementSlice);                      // ← add this
    console.log("rendementSlice dates:", rendementSlice.map(r => r.date)); // ← add this

    // Storage performance chart data — aggregated totals across all 3 units
    // Used Tons = Storage Tons − Loss Tons (i.e. batch weight minus sucrose lost)
    const storageAggData = (() => {
        const totals = storagePerf.reduce((acc, u) => ({
            storageTons: acc.storageTons + (u.totalBatchWeight || 0),
            lossTons: acc.lossTons + Math.abs(u.totalSucroseLost || 0),
        }), { storageTons: 0, lossTons: 0 });
        const usedTons = totals.storageTons - totals.lossTons;
        return [
            { category: "Storage Tons", value: parseFloat(totals.storageTons.toFixed(2)), fill: "url(#storageGrad)" },
            { category: "Used Tons", value: parseFloat(usedTons.toFixed(2)), fill: "url(#usedGrad)" },
            { category: "Loss Tons", value: parseFloat(totals.lossTons.toFixed(2)), fill: "url(#lossGrad)" },
        ];
    })();

    const radarData = storagePerf.map(u => ({
        unit: u.unit,
        "Batches": u.totalBatches || 0,
        "Avg Loss %": parseFloat((u.avgLossPercent || 0).toFixed(2)),
        "Entry Ren.": parseFloat((u.avgEntryRendement || 0).toFixed(2)),
        "Pred. Ren.": parseFloat((u.avgPredictedRendement || 0).toFixed(2)),
        "Humidity": parseFloat((u.avgHumidity || 0).toFixed(1)),
    }));

    // Radar needs a single array of metrics
    const radarMetrics = ["Batches", "Avg Loss %", "Entry Ren.", "Pred. Ren.", "Humidity"];

    const anyLoading = Object.values(loading).some(Boolean);

    return (
        <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
            <Sidebar activePage="Charts & Graphs" />

            <main className="flex-1 overflow-y-auto p-7">
                {/* Header */}
                <div className="flex justify-between items-start mb-7">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Charts &amp; Graphs</h1>
                        <p className="text-sm text-gray-400 mt-1">Visual analytics for sucrose research data</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </span>
                        <RefreshButton
                            onClick={fetchAll}
                            disabled={anyLoading}
                        />
                    </div>
                </div>

                {/* ── Grid of 4 sections ── */}
                <div className="grid grid-cols-2 gap-6">

                    {/* ─ Section 1: Daily Registered Batches ─ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <SectionTitle
                            title="Daily Registered Batches"
                            subtitle="Batches registered per day (last 7 days)"
                            icon={Package}
                        />
                        {loading.daily ? (
                            <div className="flex items-center justify-center h-52 text-slate-400 text-sm animate-pulse">Loading chart data...</div>
                        ) : dailySlice.length === 0 ? (
                            <div className="flex items-center justify-center h-52 text-slate-300 text-sm">No batch data available</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={dailySlice} barSize={18} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#16a34a" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(34,197,94,0.06)" }} />
                                    <Bar dataKey="count" fill="url(#barGrad)" name="Batches" radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* ─ Section 2: Storage Units Performance ─ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <SectionTitle
                            title="Storage Units Performance"
                            subtitle="Total tons (Storage / Used / Loss) combined across Unit A + B + C"
                            icon={BarChart2}
                        />
                        {loading.storage ? (
                            <div className="flex items-center justify-center h-52 text-slate-400 text-sm animate-pulse">Loading chart data...</div>
                        ) : storageAggData.every(d => d.value === 0) ? (
                            <div className="flex items-center justify-center h-52 text-slate-300 text-sm">No storage data available</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={storageAggData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }} barCategoryGap="35%">
                                    <defs>
                                        <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" />
                                        </linearGradient>
                                        <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                        <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#374151", fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit=" T" />
                                    <Tooltip
                                        content={({ active, payload, label }) => active && payload?.length ? (
                                            <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
                                                <p className="font-bold text-gray-700 mb-1">{label}</p>
                                                <p style={{ color: payload[0]?.fill?.includes('storage') ? '#22c55e' : payload[0]?.fill?.includes('used') ? '#60a5fa' : '#f87171' }} className="font-semibold">
                                                    {payload[0]?.value} T
                                                </p>
                                            </div>
                                        ) : null}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {storageAggData.map((entry) => (
                                            <Cell key={entry.category} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {/* Mini unit stat pills */}
                        {!loading.storage && storagePerf.length > 0 && (
                            <div className="flex gap-2 mt-4">
                                {storagePerf.map(u => (
                                    <div key={u.unit} className="flex-1 rounded-xl p-3 text-center" style={{ background: `${UNIT_COLORS[u.unit]}18` }}>
                                        <div className="text-[11px] font-black" style={{ color: UNIT_COLORS[u.unit] }}>{u.unit}</div>
                                        <div className="text-lg font-black text-gray-800">{u.totalBatches}</div>
                                        <div className="text-[9px] text-slate-400">batches</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─ Section 3: Admin KPI Overview ─ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <SectionTitle
                            title="System Overview"
                            subtitle="Key performance indicators across the entire platform"
                            icon={Activity}
                        />
                        {loading.kpi ? (
                            <div className="flex items-center justify-center h-52 text-slate-400 text-sm animate-pulse">Loading KPI data...</div>
                        ) : !kpi ? (
                            <div className="flex items-center justify-center h-52 text-slate-300 text-sm">No KPI data available</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <KpiCard label="Total Batches Registered" value={kpi.totalBatches} unit="" icon={Package} color={COLORS.green} />
                                    <KpiCard label="Total Predictions Run" value={kpi.totalPredictions} unit="" icon={Activity} color={COLORS.blue} />
                                    <KpiCard label="Avg Sucrose Loss" value={kpi.avgLossPercent} unit="%" icon={TrendingDown} color={COLORS.red} />
                                    <KpiCard label="Total Sucrose Lost" value={kpi.totalSucroseLost} unit="T" icon={TrendingDown} color={COLORS.amber} />
                                </div>

                                {/* 7-day trend sparkline */}
                                {kpi.weekTrend && kpi.weekTrend.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">7-Day Batch Registration Trend</p>
                                        <ResponsiveContainer width="100%" height={65}>
                                            <AreaChart data={kpi.weekTrend} margin={{ top: 2, right: 4, left: -30, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                                <YAxis hide allowDecimals={false} />
                                                <Tooltip content={<CustomBarTooltip />} cursor={false} />
                                                <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fill="url(#areaGrad)" name="Batches" dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                            </>
                        )}
                    </div>

                    {/* ─ Section 4: Rendement Actual vs Predicted ─ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <SectionTitle
                            title="Rendement: Actual vs Predicted"
                            subtitle="Entry rendement vs ML predicted rendement (last 10 predictions)"
                            icon={TrendingUp}
                        />
                        {loading.rendement ? (
                            <div className="flex items-center justify-center h-52 text-slate-400 text-sm animate-pulse">Loading chart data...</div>
                        ) : rendementSlice.length === 0 ? (
                            <div className="flex items-center justify-center h-52 text-slate-300 text-sm">No prediction data available yet</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={rendementSlice} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#22c55e" />
                                                <stop offset="100%" stopColor="#16a34a" />
                                            </linearGradient>
                                            <linearGradient id="predGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#60a5fa" />
                                                <stop offset="100%" stopColor="#3b82f6" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} unit="" />
                                        <Tooltip content={<CustomLineTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                                        <Line type="monotone" dataKey="actualRendement" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }} name="Actual Ren." activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="predictedRendement" stroke="#60a5fa" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }} name="Predicted Ren." activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>

                                {/* Accuracy summary */}
                                {rendementSlice.length > 0 && (() => {
                                    const avgDiff = rendementSlice.reduce((s, r) => s + Math.abs(r.actualRendement - r.predictedRendement), 0) / rendementSlice.length;
                                    const accurate = rendementSlice.filter(r => Math.abs(r.actualRendement - r.predictedRendement) < 1).length;
                                    return (
                                        <div className="flex gap-3 mt-4">
                                            <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Predictions &lt;1% Error</p>
                                                <p className="text-xl font-black text-blue-700">{accurate}<span className="text-xs ml-1 font-semibold text-blue-400">/ {rendementSlice.length}</span></p>
                                            </div>
                                            <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Model Accuracy</p>
                                                <p className="text-xl font-black text-amber-700">{((accurate / rendementSlice.length) * 100).toFixed(0)}<span className="text-xs ml-1 font-semibold text-amber-400">%</span></p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}