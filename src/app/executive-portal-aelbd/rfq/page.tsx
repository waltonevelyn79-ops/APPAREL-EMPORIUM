'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Kanban, Search, Calendar, ChevronRight, X, User, MapPin, Building, Phone, Save, Mail, Trash2 } from 'lucide-react';

type RFQStatus = 'NEW' | 'IN_REVIEW' | 'QUOTED' | 'ACCEPTED' | 'REJECTED';

interface RFQ {
    id: string;
    productName: string;
    buyerName: string;
    buyerEmail: string;
    buyerCompany: string | null;
    buyerPhone: string | null;
    buyerCountry: string | null;
    quantity: number;
    targetPrice: string | null;
    deliveryDate: string | null;
    shippingTo: string | null;
    specialRequirements: string | null;
    status: RFQStatus;
    adminNotes: string | null;
    quotedPrice: string | null;
    createdAt: string;
}

const COLUMNS: { id: RFQStatus; label: string; bg: string; text: string }[] = [
    { id: 'NEW', label: 'New Lead', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
    { id: 'IN_REVIEW', label: 'In Review', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600' },
    { id: 'QUOTED', label: 'Quoted', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600' },
    { id: 'ACCEPTED', label: 'Accepted', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600' },
    { id: 'REJECTED', label: 'Rejected', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600' }
];

export default function RFQAdminPage() {
    const { role } = usePermission();
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Edit Modal State
    const [editStatus, setEditStatus] = useState<RFQStatus>('NEW');
    const [adminNotes, setAdminNotes] = useState('');
    const [quotedPrice, setQuotedPrice] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRfqs();
    }, []);

    const fetchRfqs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rfq');
            const data = await res.json();
            if (data.rfqs) setRfqs(data.rfqs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateRfqStatus = async (id: string, newStatus: RFQStatus) => {
        setRfqs(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        try {
            await fetch('/api/rfq', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
        } catch (e) {
            fetchRfqs();
        }
    };

    const handleSaveRfq = async () => {
        if (!selectedRfq) return;
        setSaving(true);
        try {
            const res = await fetch('/api/rfq', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedRfq.id,
                    status: editStatus,
                    adminNotes,
                    quotedPrice
                })
            });
            const data = await res.json();
            if (data.success) {
                setRfqs(prev => prev.map(r => r.id === selectedRfq.id ? data.rfq : r));
                setSelectedRfq(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this RFQ?")) return;
        try {
            await fetch(`/api/rfq?id=${id}`, { method: 'DELETE' });
            setRfqs(prev => prev.filter(r => r.id !== id));
            setSelectedRfq(null);
        } catch (e) { }
    }

    const onDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = async (e: React.DragEvent, targetStatus: RFQStatus) => {
        e.preventDefault();
        if (draggedId) {
            await updateRfqStatus(draggedId, targetStatus);
            setDraggedId(null);
        }
    };

    const openModal = (rfq: RFQ) => {
        setSelectedRfq(rfq);
        setEditStatus(rfq.status);
        setAdminNotes(rfq.adminNotes || '');
        setQuotedPrice(rfq.quotedPrice || '');
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div></div>;
    }

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 h-full flex flex-col">

            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-3 font-heading">
                        <Kanban className="text-primary w-8 h-8" /> RFQ Pipeline
                    </h1>
                    <p className="text-gray-500 text-sm">Drag and drop leads through your sales funnel.</p>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-220px)] min-h-[600px]">
                {COLUMNS.map(col => {
                    const columnRfqs = rfqs.filter(r => r.status === col.id);

                    return (
                        <div
                            key={col.id}
                            className={`flex flex-col flex-none w-80 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors ${draggedId ? 'bg-gray-100/50 dark:bg-gray-800/50' : ''}`}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, col.id)}
                        >
                            <div className={`px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center rounded-t-2xl ${col.bg}`}>
                                <h3 className={`font-bold text-sm tracking-wider uppercase ${col.text}`}>{col.label}</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 ${col.text}`}>
                                    {columnRfqs.length}
                                </span>
                            </div>

                            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                                {columnRfqs.map(rfq => (
                                    <div
                                        key={rfq.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, rfq.id)}
                                        onClick={() => openModal(rfq)}
                                        className="bg-white dark:bg-dark-surface p-4 rounded-xl shadow border border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all hover:shadow-md group"
                                    >
                                        <div className="text-[10px] text-gray-400 font-mono mb-1 flex justify-between">
                                            <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
                                            <span>{rfq.quantity} pcs</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors">
                                            {rfq.productName || 'Custom Request'}
                                        </h4>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div className="flex items-center gap-1"><User size={12} /> <span className="truncate">{rfq.buyerName}</span></div>
                                            {rfq.buyerCompany && <div className="flex items-center gap-1"><Building size={12} /> <span className="truncate">{rfq.buyerCompany}</span></div>}
                                            {rfq.targetPrice && <div className="text-green-600 font-medium pt-1">Target: {rfq.targetPrice}</div>}
                                        </div>
                                    </div>
                                ))}
                                {columnRfqs.length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                                        Drop here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedRfq && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 overflow-hidden">

                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
                            <div>
                                <h2 className="text-xl font-bold font-heading">{selectedRfq.productName || 'Custom Request'}</h2>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedRfq.id}</p>
                            </div>
                            <button onClick={() => setSelectedRfq(null)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-red-100 hover:text-red-500 transition"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 custom-scrollbar">

                            <div className="md:col-span-1 space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Buyer Profile</h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex gap-2"><User size={16} className="text-gray-400 shrink-0" /> <span className="font-medium text-gray-800 dark:text-gray-200">{selectedRfq.buyerName}</span></li>
                                        <li className="flex gap-2"><Mail size={16} className="text-gray-400 shrink-0" /> <a href={`mailto:${selectedRfq.buyerEmail}`} className="text-primary hover:underline truncate">{selectedRfq.buyerEmail}</a></li>
                                        {selectedRfq.buyerPhone && <li className="flex gap-2"><Phone size={16} className="text-gray-400 shrink-0" /> <span>{selectedRfq.buyerPhone}</span></li>}
                                        {selectedRfq.buyerCompany && <li className="flex gap-2"><Building size={16} className="text-gray-400 shrink-0" /> <span>{selectedRfq.buyerCompany}</span></li>}
                                        {selectedRfq.buyerCountry && <li className="flex gap-2"><MapPin size={16} className="text-gray-400 shrink-0" /> <span>{selectedRfq.buyerCountry}</span></li>}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Logistics Targets</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Quantity Needs</span>
                                            <span className="font-bold text-lg">{selectedRfq.quantity}</span>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                            <span className="text-[10px] text-green-600 dark:text-green-400 uppercase block mb-1">Target Price</span>
                                            <span className="font-bold text-lg text-green-700 dark:text-green-300">{selectedRfq.targetPrice || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        {selectedRfq.deliveryDate && <p className="mb-1"><Calendar size={14} className="inline mr-1" /> Date: {new Date(selectedRfq.deliveryDate).toLocaleDateString()}</p>}
                                        {selectedRfq.shippingTo && <p>Port: {selectedRfq.shippingTo}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-6">

                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Buyer's Requirements</h3>
                                    <div className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-sm overflow-y-auto italic text-gray-700 dark:text-gray-300">
                                        {selectedRfq.specialRequirements || "No special requirements provided."}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5 block">Pipeline Stage</label>
                                        <select
                                            value={editStatus}
                                            onChange={e => setEditStatus(e.target.value as RFQStatus)}
                                            className="w-full px-3 py-2 border border-primary/20 bg-white dark:bg-dark-bg rounded-lg text-sm font-bold shadow-sm outline-none"
                                        >
                                            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5 block">Official Quoted Price</label>
                                        <input
                                            type="text"
                                            value={quotedPrice}
                                            onChange={e => setQuotedPrice(e.target.value)}
                                            className="w-full px-3 py-2 border border-primary/20 bg-white dark:bg-dark-bg rounded-lg text-sm shadow-sm outline-none"
                                            placeholder="e.g. $4.15 per unit"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5 block">Internal Admin Notes (Invisible to buyer)</label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={e => setAdminNotes(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-primary/20 bg-white dark:bg-dark-bg rounded-lg text-sm shadow-sm outline-none"
                                            placeholder="Write internal team notes here..."
                                        ></textarea>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-between gap-3 shrink-0">
                            <button
                                onClick={() => handleDelete(selectedRfq.id)}
                                className="px-4 py-2 border border-red-200 text-red-500 font-bold hover:bg-red-50 rounded-lg transition text-sm flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Drop Lead
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedRfq(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition text-sm">Cancel</button>
                                <button
                                    onClick={handleSaveRfq}
                                    disabled={saving}
                                    className="px-8 py-2 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition text-sm flex items-center gap-2"
                                >
                                    {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save size={16} />}
                                    Save Record
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

