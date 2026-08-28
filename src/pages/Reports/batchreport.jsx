import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-hot-toast";
import { Search, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export default function BatchReport() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPeriod, setFilterPeriod] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const headers = { Authorization: `Bearer ${token}` };
            const batchRes = await fetch(`${API_BASE}/api/batch/get`, { headers });
            const batchData = await batchRes.json();
            const predRes = await fetch(`${API_BASE}/api/predictions/history`, { headers });
            const predData = await predRes.json();

            if (batchRes.ok && predRes.ok) {
                const batches = batchData.batches || [];
                const predictions = predData.data || [];

                // Merge data by BatchId
                const merged = batches.map(b => {
                    const pred = predictions.find(p => p.batchId === b.BatchId);
                    return {
                        ...b,
                        netWeight: pred ? pred.batchWeight : "N/A",
                        sucroseLoss: pred ? pred.sucroseLoss : "N/A",
                        predictedLossPercent: pred ? pred.predictedLoss : "N/A"
                    };
                });

                setReportData(merged);
            } else {
                toast.error("Failed to fetch report data");
            }
        } catch (error) {
            toast.error("Error fetching report data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        let filtered = reportData.filter(item =>
            item.BatchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.FeildId?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const now = new Date();

        if (filterPeriod === "daily") {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.Date);
                return itemDate.toDateString() === now.toDateString();
            });
        } else if (filterPeriod === "weekly") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            filtered = filtered.filter(item => new Date(item.Date) >= oneWeekAgo);
        } else if (filterPeriod === "monthly") {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.Date);
                return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            });
        }

        return filtered;
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const tableData = getFilteredData().map(item => [
            item.BatchId,
            item.FeildId || "N/A",
            new Date(item.Date).toLocaleDateString(),
            item.Vatiety || "N/A",
            item.Unit || "N/A",
            item.netWeight !== "N/A" ? `${item.netWeight} T` : "N/A",
            item.sucroseLoss !== "N/A" ? `${item.sucroseLoss} T` : "N/A",
            item.predictedLossPercent !== "N/A" ? `${item.predictedLossPercent}%` : "N/A"
        ]);

        doc.text(`Batch Report - ${filterPeriod.toUpperCase()}`, 14, 15);

        autoTable(doc, {
            head: [["Batch ID", "Field ID", "Date", "Variety", "Unit", "Net Weight", "Sucrose Loss", "Loss %"]],
            body: tableData,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [34, 197, 94] }
        });

        doc.save(`batch-report-${filterPeriod}.pdf`);
        toast.success("PDF Downloaded!");
    };

    const filteredData = getFilteredData();

    return (
        <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
            <Sidebar activePage="Batch Report" />

            <main className="flex-1 overflow-y-auto p-7">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Batch Report</h1>
                        <p className="text-sm text-gray-500 mt-1">View and export detailed reports of all batches</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search by Batch or Field ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-green-500 shadow-sm"
                            />
                            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        </div>

                        <select
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 shadow-sm bg-white cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            <option value="daily">Today</option>
                            <option value="weekly">This Week</option>
                            <option value="monthly">This Month</option>
                        </select>

                        <button
                            onClick={exportPDF}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
                        >
                            <Download size={16} />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="py-4 px-5">Batch ID</th>
                                    <th className="py-4 px-5">Field ID</th>
                                    <th className="py-4 px-5">Date</th>
                                    <th className="py-4 px-5">Variety</th>
                                    <th className="py-4 px-5">Unit</th>
                                    <th className="py-4 px-5">Net Weight</th>
                                    <th className="py-4 px-5">Sucrose Loss</th>
                                    <th className="py-4 px-5">Loss (%)</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="py-10 text-center text-slate-500 font-medium">Loading report data...</td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-10 text-center text-slate-400">
                                            <FileText size={32} className="mx-auto mb-2 opacity-30" />
                                            No batches found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => (
                                        <tr key={item._id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-5 font-bold text-gray-800 whitespace-nowrap">
                                                {item.BatchId}
                                            </td>
                                            <td className="py-3 px-5 text-slate-600 whitespace-nowrap">
                                                {item.FeildId || "N/A"}
                                            </td>
                                            <td className="py-3 px-5 text-slate-600 whitespace-nowrap">
                                                {new Date(item.Date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-5 text-slate-600 whitespace-nowrap">
                                                {item.Vatiety || "N/A"}
                                            </td>
                                            <td className="py-3 px-5 whitespace-nowrap">
                                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md">
                                                    {item.Unit || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 font-bold text-gray-800 whitespace-nowrap">
                                                {item.netWeight !== "N/A" ? `${item.netWeight} T` : "N/A"}
                                            </td>
                                            <td className="py-3 px-5 font-bold text-gray-800 whitespace-nowrap">
                                                {item.sucroseLoss !== "N/A" ? `${item.sucroseLoss} T` : "N/A"}
                                            </td>
                                            <td className="py-3 px-5 font-bold text-red-500 whitespace-nowrap">
                                                {item.predictedLossPercent !== "N/A" ? `${item.predictedLossPercent}%` : "N/A"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
