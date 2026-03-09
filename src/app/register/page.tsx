'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('Network error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md bg-white p-12 rounded-3xl shadow-2xl text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black font-heading mb-4">Registration Complete</h2>
                    <p className="text-gray-500 mb-8 font-medium">Your buyer account has been successfully initialised. Redirecting to login portal...</p>
                    <Link href="/login" className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                        Click here if not redirected <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Visual Side */}
                <div className="hidden lg:block space-y-8">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                        <ShoppingBag size={14} /> Official Buyer Portal
                    </div>
                    <h1 className="text-6xl font-black font-heading leading-tight tracking-tighter">Join the<br /><span className="text-primary italic">Global Textile</span> Network.</h1>
                    <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">Gain immediate access to verified Bangladeshi garment manufacturers, manage your RFQs, and track your global sourcing operations in one unified executive dashboard.</p>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Active RFQs</p>
                            <p className="text-3xl font-black font-heading">12.4K+</p>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Global Buyers</p>
                            <p className="text-3xl font-black font-heading">5,200+</p>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="bg-gray-50 dark:bg-dark-surface p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black font-heading mb-2">Create Buyer Account</h2>
                        <p className="text-gray-500 font-medium">Register your business profile to start sourcing.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-8 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Full Identity Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Joe Sourcing Admin"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-5 py-4 bg-white dark:bg-dark-bg border border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Corporate Email Address</label>
                            <input
                                required
                                type="email"
                                placeholder="admin@global-retail.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-5 py-4 bg-white dark:bg-dark-bg border border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Password</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-5 py-4 bg-white dark:bg-dark-bg border border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Confirm Identity</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    className="w-full px-5 py-4 bg-white dark:bg-dark-bg border border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Initialise Membership <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-gray-500 font-bold">
                            Already associated? <Link href="/login" className="text-primary hover:underline">Sign In Here.</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
