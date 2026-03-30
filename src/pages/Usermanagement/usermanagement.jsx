import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

/* ── avatar color pool ── */
const avatarColors = [
  "#14532d", "#0e7490", "#b45309", "#7c3aed", "#be123c",
  "#0369a1", "#047857", "#a16207",
];
const getColor    = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

/* ── role options ── */
const ROLES = ["Super Admin", "Field Manager", "Lab Technician", "Storage Manager"];

const inputClass =
  "w-full bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-slate-400 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition";
const labelClass =
  "block text-[10px] font-extrabold tracking-[1.4px] text-slate-500 uppercase mb-1.5";

export default function UserManagement() {
  const [users, setUsers]           = useState([]);
  const [fetchLoading, setFetch]    = useState(true);
  const [selectedUser, setSelected] = useState(null);
  const [loading, setLoading]       = useState(false);

  const [form, setForm] = useState({
    Name: "", email: "", role: "Field Manager", password: "",
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL + "/api";
  const token   = localStorage.getItem("authToken");
  const adminDataString = localStorage.getItem("adminData");
  const adminData = adminDataString ? JSON.parse(adminDataString) : null;
  const isSuperAdmin = adminData?.role === "Super Admin";
  const headers = { Authorization: `Bearer ${token}` };

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Fetch all users from DB ── */
  const fetchUsers = async () => {
    setFetch(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setFetch(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ── Select user to edit ── */
  const handleEdit = (user) => {
    setSelected(user);
    setForm({
      Name:     user.Name     || "",
      email:    user.email    || "",
      role:     user.role     || "Field Manager",
      password: "",
    });
  };

  /* ── Clear form ── */
  const resetForm = () => {
    setSelected(null);
    setForm({ Name: "", email: "", role: "Field Manager", password: "" });
  };

  /* ── Add new admin ── */
  const handleAdd = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can add new users");
      return;
    }
    if (!form.Name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/admin/register`,
        { Name: form.Name, email: form.email, password: form.password, role: form.role },
        { headers }
      );
      toast.success("Admin user added successfully!");
      resetForm();
      fetchUsers(); // refresh list from DB
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  /* ── Update user ── */
  const handleUpdate = async () => {
    if (!selectedUser) { toast.error("Select a user to update"); return; }
    if (!isSuperAdmin && selectedUser.role === "Super Admin") {
      toast.error("You cannot modify a Super Admin profile");
      return;
    }
    if (!isSuperAdmin && form.role === "Super Admin") {
      toast.error("You cannot assign the Super Admin role");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/admin/users/${selectedUser._id}`,
        { Name: form.Name, email: form.email, role: form.role,
          ...(form.password ? { password: form.password } : {}) },
        { headers }
      );
      toast.success("User updated successfully!");
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans bg-green-50 overflow-hidden">
      <Sidebar activePage="User Management" />

      <main className="flex-1 overflow-y-auto bg-green-50 p-7">

        {/* ── Top bar ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Admin users with system access</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            <RefreshCw size={12} className={fetchLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* ── Two column layout ── */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 420px" }}>

          {/* ── LEFT: User list ── */}
          <div className="flex flex-col gap-3">

            {/* Loading skeleton */}
            {fetchLoading && (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            )}

            {/* Empty state */}
            {!fetchLoading && users.length === 0 && (
              <div className="bg-white rounded-2xl px-5 py-10 text-center shadow-sm">
                <p className="text-slate-400 text-sm">No admin users found.</p>
                <p className="text-slate-300 text-xs mt-1">Add a new admin using the form.</p>
              </div>
            )}

            {/* User cards */}
            {!fetchLoading && users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleEdit(user)}
                className={`bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm border transition cursor-pointer
                  ${selectedUser?._id === user._id
                    ? "border-green-600"
                    : "border-transparent hover:border-green-200"}`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: getColor(user.Name) }}
                  >
                    {getInitials(user.Name)}
                  </div>
                  {/* Info */}
                  <div>
                    <div className="text-sm font-bold text-gray-900">{user.Name}</div>
                    <div className="text-xs text-slate-400">
                      {user.role} · {user.email}
                    </div>
                  </div>
                </div>

                {/* Edit icon */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                  className="w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* ── RIGHT: Add / Edit form ── */}
          <div className="bg-white rounded-2xl shadow-sm p-7">
            <h2 className="text-lg font-extrabold text-gray-900 mb-6">
              {selectedUser ? "Edit Admin User" : "Add New Admin User"}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">

              {/* Full Name */}
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.Name}
                  onChange={(e) => handleChange("Name", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="email@lankasugars.lk"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Role ── now saved properly ── */}
              <div>
                <label className={labelClass}>Role</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2"
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>
                  Password {selectedUser && <span className="normal-case font-normal text-slate-300">(leave blank to keep)</span>}
                </label>
                <input
                  type="password"
                  placeholder={selectedUser ? "Leave blank to keep" : "Temporary password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleAdd}
                disabled={loading || !!selectedUser || !isSuperAdmin}
                className="py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#14532d" }}
                title={!isSuperAdmin ? "Only Super Admins can add users" : ""}
              >
                {loading && !selectedUser ? "Adding..." : "Add user Admin"}
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading || !selectedUser || (!isSuperAdmin && (selectedUser?.role === "Super Admin" || form.role === "Super Admin"))}
                className="py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#14532d" }}
                title={(!isSuperAdmin && (selectedUser?.role === "Super Admin" || form.role === "Super Admin")) ? "Cannot modify or assign Super Admin role" : ""}
              >
                {loading && selectedUser ? "Updating..." : "Update User"}
              </button>
            </div>

            

            {/* Cancel edit */}
            {selectedUser && (
              <button
                onClick={resetForm}
                className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              >
                ✕ Cancel edit — Add new instead
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}