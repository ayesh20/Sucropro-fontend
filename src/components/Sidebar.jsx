import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── SVG nav icons ── */
const DashGridIcon = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#fff" : "#64748b"} strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const PlusNavIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ClipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2h-2" />
    <rect x="9" y="1" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const CalcIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h8M8 14h4" />
    <rect x="14" y="13" width="4" height="4" rx="0.5" fill="#f87171" stroke="none" />
  </svg>
);
const ZapNavIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const CircleNav = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" fill="#94a3b8" stroke="none" />
  </svg>
);
const BoxNav = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);
const DocNav = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);
const BatchReportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="8" y1="9" x2="10" y2="9" />
  </svg>
);
const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="7 17 10 12 13 15 16 10 19 14" />
  </svg>
);
const UserMgmtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

/* ── Section title icons ── */
const SucroseLabel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2C8 6 7 11 9 17" />
    <path d="M12 2c4 4 5 9 3 15" />
    <path d="M9 17c2-1 5-1 7 1" />
    <circle cx="12" cy="21" r="1.5" fill="#a855f7" stroke="none" />
  </svg>
);
const PredLabel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
    <circle cx="12" cy="10" r="7" />
    <path d="M9 21h6" />
    <path d="M12 17v4" />
    <path d="M9.5 8.5C9.5 7 10.6 6 12 6" stroke="#86efac" />
  </svg>
);
const StorLabel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9h18v2a9 9 0 01-18 0V9z" />
    <path d="M8 9V7a4 4 0 018 0v2" />
    <line x1="12" y1="14" x2="12" y2="18" />
  </svg>
);
const RepLabel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 9v12M15 9v12" />
  </svg>
);
const AuthLabel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="#f59e0b" stroke="none" />
  </svg>
);

/* ── Logo ── */
const LankaLogo = () => (
  <div className="w-10 h-10 rounded-lg border border-white/20 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
    <img src="/images/logo.jpg" alt="Lanka Sugar Logo" className="w-full h-full object-cover" />
  </div>
);

/* ── Section label ── */
const SectionLabel = ({ text, icon, color }) => (
  <div className="flex items-center gap-1.5 px-[18px] pt-[13px] pb-[5px] text-[10px] font-extrabold tracking-[1.4px]"
    style={{ color }}>
    {icon} {text}
  </div>
);

/* ── Nav item ── */
const NavItem = ({ icon, label, active = false, badge = null, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between cursor-pointer transition-colors duration-150 text-[13px]
      ${active
        ? "bg-green-900 rounded-lg mx-[7px] my-[1px] px-[11px] py-2 text-white font-semibold"
        : "mx-0 my-[1px] px-[18px] py-[7px] text-slate-400 font-normal hover:text-slate-200"
      }`}
  >
    <span className="flex items-center gap-2.5">
      <span className="flex items-center flex-shrink-0">{icon}</span>
      {label}
    </span>
    {badge != null && (
      <span className="w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {badge}
      </span>
    )}
  </div>
);

/* ── Get initials from full name ── */
const getInitials = (name = "") =>
  name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "AD";

/* ─── SIDEBAR ───────────────────────────────────────── */
export default function Sidebar({ activePage = "Dashboard", onLogout }) {
  const navigate = useNavigate();
  const is = (label) => activePage === label;

  /* ── Read logged-in user from localStorage ── */
  const adminData = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminData")) || {};
    } catch {
      return {};
    }
  })();

  const userName = adminData.Name || adminData.name || "Admin User";
  const userRole = adminData.role || "Admin";
  const initials = getInitials(userName);

  /* ── Logout handler ── */
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminData");
    navigate("/");
    if (onLogout) onLogout();
  };

  return (
    <aside className="w-[242px] min-w-[242px] flex flex-col h-screen overflow-y-auto flex-shrink-0"
      style={{ background: "#0e5a46", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <LankaLogo />
        <div>
          <div className="text-[19px] font-black text-white leading-tight tracking-tight">SucroPro</div>
          <div className="text-[11px] mt-0.5">
            <span className="text-green-400 font-bold">v1.0</span>
            <span className="text-green-300 font-medium"> &nbsp;Admin</span>
          </div>
        </div>
      </div>

      {/* OVERVIEW */}
      <SectionLabel text="OVERVIEW" color="#64748b" />
      <NavItem icon={<DashGridIcon active={is("Dashboard")} />} label="Dashboard"
        active={is("Dashboard")} onClick={() => navigate("/dashboard")} />

      {/* SUCROSE */}
      <SectionLabel text="SUCROSE" icon={<SucroseLabel />} color="#a855f7" />
      <NavItem icon={<PlusNavIcon />} label="Log New Batch"
        active={is("Log New Batch")} onClick={() => navigate("/new-batch")} />
      <NavItem icon={<ClipIcon />} label="Submit Weight"
        active={is("Log New Weight")} onClick={() => navigate("/new-weight")} />
      <NavItem icon={<ClipIcon />} label="All Batches"
        active={is("All Batches")} onClick={() => navigate("/batch-list")} />
      <NavItem icon={<CalcIcon />} label="Sucrose Calculation"
        active={is("Sucrose Calculation")} onClick={() => navigate("/calculation")} />
      <NavItem icon={<DocNav />} label="Registered Batches"
        active={is("Registered Batches")} onClick={() => navigate("/registered-batches")} />

      {/* PREDICTIONS */}
      <SectionLabel text="PREDICTIONS" icon={<PredLabel />} color="#22c55e" />
      <NavItem icon={<ZapNavIcon />} label="Run Prediction"
        active={is("Run Prediction")} onClick={() => navigate("/run-prediction")} />
      <NavItem icon={<CircleNav />} label="Prediction History"
        active={is("Prediction History")} onClick={() => navigate("/prediction-history")} />

      {/* STORAGE */}
      <SectionLabel text="STORAGE" icon={<StorLabel />} color="#f59e0b" />
      <NavItem icon={<BoxNav />} label="Storage Records"
        active={is("Storage Records")} onClick={() => navigate("/storage-records")} />
      <NavItem icon={<DocNav />} label="Loss Monitoring"
        active={is("Loss Monitoring")} onClick={() => navigate("/loss-monitoring")} />

      {/* REPORTS */}
      <SectionLabel text="REPORTS" icon={<RepLabel />} color="#ef4444" />
      <NavItem icon={<BatchReportIcon />} label="Batch Report"
        active={is("Batch Report")} onClick={() => navigate("/batch-report")} />
      <NavItem icon={<ChartIcon />} label="Charts & Graphs"
        active={is("Charts & Graphs")} onClick={() => navigate("/charts-graphs")} />

      {/* AUTH */}
      <SectionLabel text="AUTH" icon={<AuthLabel />} color="#f59e0b" />
      <NavItem icon={<UserMgmtIcon />} label="User Management"
        active={is("User Management")} onClick={() => navigate("/user-management")} />

      <div className="flex-1" />

      {/* ── User section — dynamic from localStorage ── */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5 mb-2.5">
          {/* Avatar with initials */}
          <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0 border border-green-600">
            {initials}
          </div>
          <div className="min-w-0">
            {/* Name — truncate if too long */}
            <div className="text-[13px] font-bold text-white truncate" title={userName}>
              {userName}
            </div>
            {/* Role */}
            <div className="text-[11px] font-semibold text-green-400 truncate" title={userRole}>
              {userRole}
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-400 text-[12.5px] cursor-pointer hover:text-slate-200 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </div>
      </div>

    </aside>
  );
}