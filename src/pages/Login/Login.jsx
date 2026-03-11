import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState('');

    const navigate  = useNavigate();
    const API_URL   = import.meta.env.VITE_BACKEND_URL + "/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            toast.error('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/admin/login`, {
                email,
                password,
            });

            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('adminData', JSON.stringify(response.data.user));
                toast.success(response.data.message || 'Login successful!');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                setError('Login failed. Please try again.');
                toast.error('Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response) {
                const msg = err.response.data.message || 'Login failed';
                setError(msg);
                toast.error(msg);
                if (err.response.status === 404) toast.error('User not found');
                else if (err.response.status === 403) toast.error('Incorrect password');
            } else if (err.request) {
                const msg = 'Unable to connect to server. Please check your connection.';
                setError(msg); toast.error(msg);
            } else {
                const msg = 'An unexpected error occurred. Please try again.';
                setError(msg); toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: "#f0fdf4" }}>

            {/* ── Left panel (branding) ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
                style={{ background: "linear-gradient(150deg, #14532d 0%, #166534 55%, #15803d 100%)" }}
            >
                {/* decorative circles */}
                <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
                    style={{ background: "#4ade80" }} />
                <div className="absolute bottom-10 -right-16 w-64 h-64 rounded-full opacity-10"
                    style={{ background: "#4ade80" }} />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full opacity-5"
                    style={{ background: "#fff" }} />

                {/* Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-white/20">
                        <img src="/images/logo.jpg" alt="Lanka Sugar"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div>
                        <div className="text-white font-black text-2xl tracking-tight">SucroPro</div>
                        <div className="text-green-300 text-xs font-medium">v1.0 &nbsp;Admin Panel</div>
                    </div>
                </div>

                {/* Center text */}
                <div className="relative z-10">
                    <div className="text-[10px] tracking-[2px] text-green-300 font-bold mb-3 uppercase">
                        System Status — Active
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight mb-4">
                        Sucrose<br />Productivity<br />Monitor
                    </h2>
                    <p className="text-green-300 text-sm leading-relaxed max-w-xs">
                        Lanka Sugar Company (Pvt) Ltd — Pelwatta Factory.<br />
                        Monitor, predict and manage sucrose production in real time.
                    </p>

                    
                </div>

                {/* Bottom */}
                <div className="relative z-10 text-green-400 text-xs">
                    © 2026 Lanka Sugar Company (Pvt) Ltd
                </div>
            </div>

            {/* ── Right panel (form) ── */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-green-900 flex items-center justify-center overflow-hidden">
                            <img src="/images/logo.jpg" alt="Lanka Sugar"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <div>
                            <div className="font-black text-xl text-gray-900 tracking-tight">SucroPro</div>
                            <div className="text-green-600 text-xs font-medium">v1.0 Admin Panel</div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                                Welcome Admin
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Enter your credentials to access the dashboard
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">

                            {/* Email */}
                            <div>
                                <label htmlFor="email"
                                    className="block text-[10px] font-extrabold tracking-[1.4px] text-slate-400 uppercase mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="admin@lankassugar.lk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-slate-300 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition disabled:opacity-60"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password"
                                        className="block text-[10px] font-extrabold tracking-[1.4px] text-slate-400 uppercase">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => toast.info('Forgot password feature coming soon!')}
                                        className="text-xs text-green-700 hover:text-green-900 font-semibold transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder-slate-300 outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                                style={{ background: "linear-gradient(120deg, #14532d 0%, #15803d 100%)" }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login to Dashboard'
                                )}
                            </button>

                        </div>

                        {/* Footer note */}
                        <p className="text-center text-xs text-slate-400 mt-6">
                            Lanka Sugar Company (Pvt) Ltd 
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}