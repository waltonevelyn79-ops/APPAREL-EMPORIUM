'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle2, Clock, Plus, Edit2, Trash2, Globe, Eye, EyeOff, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface DeliveryItem {
    id: string;
    title: string;
    description: string;
    category: string;
    buyer: string;
    buyerCountry: string;
    quantity: string;
    status: 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED';
    imageUrl?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
}

const CATEGORIES = ['Knitwear', 'Woven', 'Activewear', 'Kidswear', 'Denim', 'Sweater', 'Home Textile', 'Outerwear', 'Footwear'];
const COUNTRIES = ['Sweden', 'Canada', 'Australia', 'UAE', 'United Kingdom', 'Germany', 'USA', 'France', 'Japan', 'South Korea', 'Netherlands', 'Spain', 'Italy', 'Denmark', 'Norway', 'Finland'];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    IN_PRODUCTION: { label: 'In Production', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
    SHIPPED: { label: 'Shipped', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
    DELIVERED: { label: 'Delivered', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/30' },
    COMPLETED: { label: 'Completed', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
};

function getCountryFlag(country: string): string {
    const flags: Record<string, string> = {
        'Sweden': '🇸🇪', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'UAE': '🇦🇪',
        'United Kingdom': '🇬🇧', 'Germany': '🇩🇪', 'USA': '🇺🇸', 'France': '🇫🇷',
        'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Netherlands': '🇳🇱', 'Spain': '🇪🇸',
        'Italy': '🇮🇹', 'Denmark': '🇩🇰', 'Norway': '🇳🇴', 'Finland': '🇫🇮',
    };
    return flags[country] || '🌍';
}

export default function DeliveriesAdminPage() {
    const [items, setItems] = useState<DeliveryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DeliveryItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Knitwear',
        buyer: '',
        buyerCountry: 'Germany',
        quantity: '',
        status: 'DELIVERED',
        imageUrl: '',
        isActive: true,
        sortOrder: 0,
    });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/delivery-feed?all=true');
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (e) {
            console.error('Failed to load deliveries', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openAddModal = () => {
        setEditingItem(null);
        setForm({
            title: '',
            description: '',
            category: 'Knitwear',
            buyer: '',
            buyerCountry: 'Germany',
            quantity: '',
            status: 'DELIVERED',
            imageUrl: '',
            isActive: true,
            sortOrder: items.length,
        });
        setErrorMsg('');
        setModalOpen(true);
    };

    const openEditModal = (item: DeliveryItem) => {
        setEditingItem(item);
        setForm({
            title: item.title,
            description: item.description || '',
            category: item.category,
            buyer: item.buyer || '',
            buyerCountry: item.buyerCountry,
            quantity: item.quantity,
            status: item.status,
            imageUrl: item.imageUrl || '',
            isActive: item.isActive,
            sortOrder: item.sortOrder || 0,
        });
        setErrorMsg('');
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            const url = editingItem
                ? `/api/delivery-feed/${editingItem.id}`
                : '/api/delivery-feed';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok || (data.success === false)) {
                throw new Error(data.error || 'Failed to save record');
            }

            setModalOpen(false);
            fetchItems();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this delivery update?')) return;
        try {
            const res = await fetch(`/api/delivery-feed/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setItems(prev => prev.filter(i => i.id !== id));
            }
        } catch (e) {
            alert('Failed to delete');
        }
    };

    const handleToggleActive = async (item: DeliveryItem) => {
        try {
            const res = await fetch(`/api/delivery-feed/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !item.isActive }),
            });
            if (res.ok) {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
            }
        } catch (e) {
            alert('Failed to toggle status');
        }
    };

    const filteredItems = items.filter(item => {
        if (filterStatus === 'ALL') return true;
        return item.status === filterStatus;
    });

    const inProdCount = items.filter(i => i.status === 'IN_PRODUCTION').length;
    const shippedCount = items.filter(i => i.status === 'SHIPPED').length;
    const deliveredCount = items.filter(i => i.status === 'DELIVERED' || i.status === 'COMPLETED').length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-heading">
                        Recent Deliveries &amp; Production Feed
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">
                        Manage the live shipments &amp; production updates displayed in the ticker on the homepage.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                >
                    <Plus size={18} />
                    Add Delivery Update
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-xs font-bold uppercase text-gray-400">Total Feed Items</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{items.length}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-xs font-bold uppercase text-amber-500">In Production</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">{inProdCount}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-xs font-bold uppercase text-blue-500">Shipped</p>
                    <p className="text-2xl font-black text-blue-500 mt-1">{shippedCount}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-xs font-bold uppercase text-green-500">Delivered</p>
                    <p className="text-2xl font-black text-green-500 mt-1">{deliveredCount}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap border-b border-gray-200 dark:border-gray-800 pb-4">
                {['ALL', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((st) => (
                    <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === st
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        {st.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* List Table */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500">Loading delivery updates...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-16 text-center">
                        <Truck size={40} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No delivery updates found</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">Click the button below to add your first live order or delivery record.</p>
                        <button onClick={openAddModal} className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                            + Add First Update
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                    <th className="p-5">Product &amp; Image</th>
                                    <th className="p-5">Category</th>
                                    <th className="p-5">Buyer &amp; Destination</th>
                                    <th className="p-5">Quantity</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-center">Live Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                                {filteredItems.map((item) => {
                                    const st = statusConfig[item.status] || statusConfig.COMPLETED;
                                    return (
                                        <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700 relative">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <ImageIcon size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{item.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">{item.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg leading-none">{getCountryFlag(item.buyerCountry)}</span>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-xs">{item.buyerCountry}</p>
                                                        <p className="text-[11px] text-gray-400">{item.buyer}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 font-bold text-gray-900 dark:text-white tabular-nums">
                                                {item.quantity}
                                            </td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.bg} ${st.color}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <button
                                                    onClick={() => handleToggleActive(item)}
                                                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${item.isActive
                                                        ? 'text-green-600 bg-green-50 dark:bg-green-950/40 hover:bg-green-100'
                                                        : 'text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                                                        }`}
                                                    title={item.isActive ? 'Active (Click to hide)' : 'Inactive (Click to show)'}
                                                >
                                                    {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Edit Update"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Dialog */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark-surface max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white font-heading">
                                {editingItem ? 'Edit Delivery Update' : 'New Live Delivery Record'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label-form">Update Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Organic Cotton T-Shirts — 50,000 pcs"
                                    className="input-form"
                                />
                            </div>

                            <div>
                                <label className="label-form">Description</label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief order details, certification notes, or delivery specifics..."
                                    className="input-form"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-form">Category *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="input-form"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="label-form">Status *</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="input-form"
                                    >
                                        <option value="IN_PRODUCTION">In Production</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-form">Buyer Country *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.buyerCountry}
                                        onChange={(e) => setForm({ ...form, buyerCountry: e.target.value })}
                                        placeholder="e.g. Germany, Sweden, USA"
                                        className="input-form"
                                    />
                                </div>

                                <div>
                                    <label className="label-form">Quantity *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        placeholder="e.g. 50,000 pcs"
                                        className="input-form"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label-form">Buyer / Brand Name</label>
                                <input
                                    type="text"
                                    value={form.buyer}
                                    onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                                    placeholder="e.g. Nordic Retail Group (Optional)"
                                    className="input-form"
                                />
                            </div>

                            <div>
                                <label className="label-form">Photo / Image URL</label>
                                <input
                                    type="url"
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    placeholder="https://images.unsplash.com/... or uploaded photo link"
                                    className="input-form"
                                />
                                {form.imageUrl && (
                                    <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100">
                                        <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Display in live ticker on homepage
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm flex items-center gap-2"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    {editingItem ? 'Update Record' : 'Create Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
