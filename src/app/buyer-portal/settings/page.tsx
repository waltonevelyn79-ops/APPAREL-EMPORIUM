'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, Phone, MapPin, Building2, Globe, Save, ClipboardList, Package, Camera, Info } from 'lucide-react';

export default function BuyerSettingsPage() {
    const { data: session, update } = useSession();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '+880 1234 567 890',
        company: 'Global Retailers Ltd.',
        address: '12-A Blue Tower, Manhattan, NY',
        country: 'USA',
        website: 'https://globalretailers.com',
        buyerType: 'Wholesaler'
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API delay
        setTimeout(() => {
            setSaving(false);
            alert("Settings updated successfully!");
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black font-heading mb-2">Buyer Profile & Settings</h1>
                    <p className="text-gray-500 font-medium">Keep your sourcing details updated to receive accurate quotations.</p>
                </div>
                <button
                    onClick={handleSave} disabled={saving}
                    className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
                >
                    {saving ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : <Save size={18} />}
                    {saving ? 'Processing...' : 'Save Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Profile Card Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer">
                            <img
                                src={session?.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name}`}
                                alt="Avatar"
                                className="w-full h-full rounded-full bg-gray-50 border-4 border-white dark:border-dark-surface shadow-lg group-hover:brightness-75 transition-all"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold font-heading">{form.name}</h4>
                        <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6 mt-1">{form.buyerType}</p>

                        <div className="flex bg-gray-50 dark:bg-dark-bg p-4 rounded-2xl items-center gap-4 text-left border border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Building2 size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Business Entity</p>
                                <p className="text-xs font-bold truncate text-gray-900 dark:text-gray-200">{form.company}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/30">
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-2">
                            <Info size={16} /> Verification Status
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium">Your buyer account is currently in "Draft" status. Complete your business verification to unlock direct factory chat features.</p>
                    </div>
                </div>

                {/* Form Area */}
                <div className="lg:col-span-2 space-y-8 bg-white dark:bg-dark-surface p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Personal Identity</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-surface rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-surface rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Corporate Details</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                                    placeholder="Company Entity Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-surface rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                                    placeholder="Company Website" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-surface rounded-2xl text-sm font-bold transition-all outline-none font-mono"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Operational Sourcing Logistics</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                        placeholder="Main Delivery Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-surface rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="relative group">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <select
                                        value={form.buyerType} onChange={e => setForm({ ...form, buyerType: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary focus:bg-white dark:focus:bg-dark-surface rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
                                    >
                                        <option value="Wholesaler">Stockist / Wholesaler</option>
                                        <option value="Retailer">Independent Retailer</option>
                                        <option value="BrandOwner">Global Brand Owner</option>
                                        <option value="Agent">Sourcing Agent</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
