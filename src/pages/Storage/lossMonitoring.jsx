import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw, Sparkles, BrainCircuit } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const UNITS = ["Unit A", "Unit B", "Unit C"];


const DONUT_COLORS = ["#22c55e", "#a3e635", "#f87171"];

//= (ownDonutValue / sumOfAllDonutValues) * 100


function ProgressBar({ label, displayPct, barFillPct, color }) {
  const fill = Math.min(Math.max(barFillPct, 0), 100);
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1.5">
      <span className="w-[140px] shrink-0">{label}</span>
      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${fill}%`, background: color }}
        />
      </div>
      <span className="w-14 text-right font-semibold text-slate-700">
        {displayPct}
      </span>
    </div>
  );
}

function makeCustomLabel(displayValues) {
  return function CustomLabel({
    cx, cy, midAngle, innerRadius, outerRadius, index,
  }) {
    const displayVal = displayValues[index];
    if (displayVal == null || displayVal < 0.1) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="700"
      >
        {displayVal.toFixed(2)}%
      </text>
    );
  };
}

export default function LossMonitoring() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiInsightId, setAiInsightId] = useState(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [clearingInsight, setClearingInsight] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchLatestInsight();
  }, []);

  const fetchLatestInsight = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/insights/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const fetchedId = data.data._id;
        if (sessionStorage.getItem("hiddenInsightId") !== fetchedId) {
          setAiInsight(data.data.content);
          setAiInsightId(fetchedId);
        }
      }
    } catch (err) {
      console.error("Error fetching latest insight", err);
    }
  };

  const handleGenerateInsight = async () => {
    if (!summaryData) {
      toast.error("No data available to generate insights.");
      return;
    }
    setGeneratingInsight(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/insights/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ summaryData })
      });
      const data = await res.json();
      if (res.ok) {
        setAiInsight(data.data.content);
        setAiInsightId(data.data._id);
        sessionStorage.removeItem("hiddenInsightId");
        toast.success(" Insights generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate insights");
      }
    } catch (err) {
      toast.error("Error generating insights");
    } finally {
      setGeneratingInsight(false);
    }
  };

  const handleClearInsight = () => {
    setAiInsight(null);
    if (aiInsightId) {
      sessionStorage.setItem("hiddenInsightId", aiInsightId);
    }
    toast.success(" Insights cleared successfully!");
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/predictions/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSummaryData(data.compartmentSummary);
      } else {
        toast.error(data.message || "Failed to load summary");
      }
    } catch (err) {
      toast.error("Error fetching loss summary");
    } finally {
      setLoading(false);
    }
  };


  const unitData = UNITS.map((unitName) => {
    const record = summaryData?.find((d) => d._id === unitName);

    // Raw ton values from DB
    const storageTons = record?.totalBatchWeight || 0;
    const lostTons = record?.totalSucroseLost || 0;


    let storageDonut = 0;
    let usedDonut = 0;
    let lossDonut = 0;

    if (storageTons > 0) {
      // Math.abs() because the DB stores sucrose loss as a negative number (e.g. -0.2964).
      // With it:    lossDonut =  2.5  → usedDonut = 100- 2.5    =  97.5 → barFill 48.75% 
      lossDonut = Math.round((Math.abs(lostTons) / storageTons) * 1000) / 10;
      usedDonut = Math.round((100 - lossDonut) * 10) / 10;
      storageDonut = 100;
    }

    const hasData = storageTons > 0;

    const pieData = hasData
      ? [
        { name: "Storage", value: storageDonut },
        { name: "Used", value: usedDonut },
        { name: "Loss", value: lossDonut },
      ]
      : [{ name: "No Data", value: 1 }];

    const totalScale = storageDonut + usedDonut + lossDonut || 200;
    const storageBarFill = (storageDonut / totalScale) * 100;
    const usedBarFill = (usedDonut / totalScale) * 100;
    const lossBarFill = (lossDonut / totalScale) * 100;


    const customLabel = hasData
      ? makeCustomLabel([storageBarFill, usedBarFill, lossBarFill])
      : false;

    return {
      unitName,
      pieData,
      hasData,
      storageBarFill,
      usedBarFill,
      lossBarFill,
      customLabel,
    };
  });

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="Loss Monitoring" />

      <main className="flex-1 overflow-y-auto p-7">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 m-0">
              Loss Monitoring
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Automated sucrose productivity calculation engine
            </p>
          </div>
          <div className="flex gap-3">

            <button
              onClick={fetchSummary}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-2 rounded-lg hover:border-green-500 hover:text-green-700 transition-colors shadow-sm"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        </div>

        {/* White card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-base font-bold text-gray-800 mb-8">
            Weekly Storage Units Loss monitoring
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 font-medium">
              Loading weekly data...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {unitData.map(({
                unitName,
                pieData,
                hasData,
                storageBarFill,
                usedBarFill,
                lossBarFill,
                customLabel,
              }) => (
                <div key={unitName} className="flex flex-col items-center">

                  {/* ── Donut Chart ── */}
                  <div className="w-full" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={105}
                          paddingAngle={hasData ? 0.5 : 0}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          labelLine={false}
                          label={customLabel}
                        >
                          {hasData ? (
                            pieData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={DONUT_COLORS[index]}
                                stroke="none"
                              />
                            ))
                          ) : (
                            <Cell fill="#e2e8f0" stroke="none" />
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            fontSize: 12,
                          }}
                          formatter={(value, name) => [
                            // Tooltip shows the proportional % (barFill values)
                            `${((value / (pieData.reduce((s, d) => s + d.value, 0) || 200)) * 100).toFixed(2)}%`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Progress Bars */}
                  <div className="w-full mt-4 px-2">
                    <ProgressBar
                      label="Week Storage Tons(%)"
                      displayPct={hasData ? `${storageBarFill.toFixed(2)}%` : "0.0%"}
                      barFillPct={storageBarFill}
                      color="#22c55e"
                    />
                    <ProgressBar
                      label="Week Used Tons(%)"
                      displayPct={hasData ? `${usedBarFill.toFixed(2)}%` : "0.0%"}
                      barFillPct={usedBarFill}
                      color="#a3e635"
                    />
                    <ProgressBar
                      label="Week Loss Tons(%)"
                      displayPct={hasData ? `${lossBarFill.toFixed(2)}%` : "0.0%"}
                      barFillPct={lossBarFill}
                      color="#f87171"
                    />
                  </div>

                  {/* Unit label */}
                  <p className="mt-5 text-sm font-extrabold text-gray-800 tracking-wide">
                    {unitName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights Card */}
        <div className="flex justify-end gap-4 items-start mb-2 py-8 px-2">
          <button
            onClick={handleGenerateInsight}
            disabled={generatingInsight}
            className="flex items-center gap-1.5 text-xs font-semibold text-white border border-transparent bg-green-800 px-4 py-2 rounded-lg hover:bg-green-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} className={generatingInsight ? "animate-pulse" : ""} />
            {generatingInsight ? "Analyzing..." : "Generate Insights"}
          </button>
          <button
            onClick={handleClearInsight}
            disabled={clearingInsight}
            className="flex items-center gap-1.5 text-xs font-semibold text-white border border-transparent bg-green-800 px-4 py-2 rounded-lg hover:bg-green-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >

            {clearingInsight ? "Clearing..." : "Clear Insights"}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8  border-t-4 border-green-500">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-2 bg-green-100 rounded-lg">
              <BrainCircuit className="text-green-800 " size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 m-0">
              Strategic Insights
            </h2>
          </div>

          {generatingInsight ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ) : aiInsight ? (
            <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-indigo-900 prose-strong:text-indigo-700">
              <ReactMarkdown>{aiInsight}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Sparkles size={40} className="mb-4 opacity-20" />
              <p>No insights generated yet. Click the button above to analyze your weekly data.</p>
            </div>
          )}
        </div>


      </main>
    </div>
  );
}
