'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { MessageSquare, Plus, Edit2, Trash2, Calendar, MousePointerClick, Clock, ArrowDownToLine, EyeOff, Save, X } from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

interface Popup {
    id: string;
    name: string;
    content: string;
    image: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    trigger: string;
    triggerValue: string | null;
    displayPages: string | null;
    showOnce: boolean;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
}

export default function PopupAdminPage() {
    const { role } = usePermission();
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const initialFormState: Partial<Popup> = {
        name: '', content: '', image: '', ctaText: '', ctaLink: '',
        trigger: 'load', triggerValue: '', displayPages: 'ALL',
        showOnce: false, isActive: true, startDate: '', endDate: ''
    };

    const [formData, setFormData] = useState<Partial<Popup>>(initialFormState);

    useEffect(() => { fetchPopups(); }, []);

    const fetchPopups = async () => {
        try {
            const res = await fetch('/api/popups?admin=true');
            const data = await res.json();
            if (data.popups) setPopups(data.popups);
        } catch (e) { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = formData.id ? 'PUT' : 'POST';
            const payload = { ...formData };
            if (!payload.startDate) payload.startDate = null; else payload.startDate = new Date(payload.startDate).toISOString();
            if (!payload.endDate) payload.endDate = null; else payload.endDate = new Date(payload.endDate).toISOString();

            const res = await fetch('/api/popups', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                if (method === 'POST') setPopups([data.popup, ...popups]);
                else setPopups(popups.map(p => p.id === data.popup.id ? data.popup : p));
                setModalOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/popups?id=${id}`, { method: 'DELETE' });
        setPopups(popups.filter(p => p.id !== id));
    };

    const openEdit = (p: Popup) => {
        setFormData({
            ...p,
            startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
            endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : ''
        });
        setModalOpen(true);
    };

    const getTriggerIcon = (t: string) => {
        if (t === 'delay') return <Clock size={14} />;
        if (t === 'exit') return <ArrowDownToLine size={14} className="rotate-180" />;
        if (t === 'scroll') return <ArrowDownToLine size={14} />;
        return <MousePointerClick size={14} />; // load
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">

            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-3 font-heading">
                        <MessageSquare className="text-primary w-8 h-8" /> Popup Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Control site-wide promotional overlays and exit-intent banners.</p>
                </div>
                <button
                    onClick={() => { setFormData(initialFormState); setModalOpen(true); }}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition flex items-center gap-2"
                >
                    <Plus size={18} /> Add New Popup
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left font-sans text-sm">
                    <thead className="bg-gray-50 dark:bg-dark-bg text-xs tracking-wider uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4 border-b border-gray-100 dark:border-gray-800">Campaign Name</th>
                            <th className="p-4 border-b border-gray-100 dark:border-gray-800">Trigger Type</th>
                            <th className="p-4 border-b border-gray-100 dark:border-gray-800">Date Range</th>
                            <th className="p-4 border-b border-gray-100 dark:border-gray-800">Status</th>
                            <th className="p-4 border-b border-gray-100 dark:border-gray-800 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {popups.map(p => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">
                                    {p.name}
                                    <div className="text-xs font-normal text-gray-400 mt-1 flex items-center gap-1"><MousePointerClick size={10} /> Shown on: {p.displayPages}</div>
                                </td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded w-fit">
                                        {getTriggerIcon(p.trigger)}
                                        {p.trigger} {p.triggerValue ? `(${p.triggerValue})` : ''}
                                    </span>
                                </td>
                                <td className="p-4 text-xs font-mono text-gray-500">
                                    {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'Always'} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'Forever'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEdit(p)} className="p-2 text-primary hover:bg-primary/10 rounded transition"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {popups.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500 font-bold border-t border-gray-100 dark:border-gray-800">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        No popup campaigns exist yet.
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 overflow-hidden">

                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
                            <h2 className="text-xl font-bold font-heading">{formData.id ? 'Edit Campaign' : 'New Popup Campaign'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Campaign Name (Internal)</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded p-3 text-sm focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Summer Sale Event 2026" />
                                </div>
                                <div className="col-span-2 md:col-span-1 flex items-center pt-5">
                                    <label className="flex items-center gap-3 font-bold cursor-pointer text-sm">
                                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded text-primary border-gray-300" />
                                        Campaign Currently Active Mode
                                    </label>
                                </div>
                            </div>

                            <div className="border border-primary/20 bg-primary/5 p-5 rounded-xl space-y-4">
                                <h3 className="font-bold text-primary flex items-center gap-2 text-sm"><Clock size={16} /> Targeting Engine</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 block mb-1">Trigger Event</label>
                                        <select value={formData.trigger} onChange={e => setFormData({ ...formData, trigger: e.target.value })} className="w-full border border-primary/20 bg-white dark:bg-dark-bg rounded p-2.5 text-sm outline-none">
                                            <option value="load">On Page Load immediately</option>
                                            <option value="delay">Time Delay (Seconds)</option>
                                            <option value="scroll">Scroll Percentage (%)</option>
                                            <option value="exit">Exit Intent (Mouse leaves viewport)</option>
                                        </select>
                                    </div>
                                    {(formData.trigger === 'delay' || formData.trigger === 'scroll') && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Value ({formData.trigger === 'delay' ? 'Seconds' : '%'})</label>
                                            <input type="number" value={formData.triggerValue || ''} onChange={e => setFormData({ ...formData, triggerValue: e.target.value })} className="w-full border border-primary/20 bg-white dark:bg-dark-bg rounded p-2.5 text-sm outline-none" placeholder={formData.trigger === 'delay' ? 'e.g. 5' : 'e.g. 50'} />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 block mb-1">Show on Pages</label>
                                        <select value={formData.displayPages || 'ALL'} onChange={e => setFormData({ ...formData, displayPages: e.target.value })} className="w-full border border-primary/20 bg-white dark:bg-dark-bg rounded p-2.5 text-sm outline-none">
                                            <option value="ALL">All Pages Global</option>
                                            <option value="/">Homepage Only</option>
                                            <option value="/products">Products Pages Only</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-5">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <input type="checkbox" checked={formData.showOnce} onChange={e => setFormData({ ...formData, showOnce: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                            Only show once per browser session
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2"><EyeOff size={14} /> Design Template</h3>
                                <label className="text-xs font-bold text-gray-500 block mb-1 mt-4">Heading / HTML Content</label>
                                <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full border rounded p-3 text-sm focus:ring-primary h-24 outline-none" placeholder="We are ISO certified..." />

                                <div className="mt-4">
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Banner Image (Optional)</label>
                                    <ImagePicker value={formData.image || ''} onChange={url => setFormData({ ...formData, image: url })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Button Text</label>
                                        <input type="text" value={formData.ctaText || ''} onChange={e => setFormData({ ...formData, ctaText: e.target.value })} className="w-full border rounded p-2 text-sm outline-none" placeholder="Get a Quote" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Button Link URL</label>
                                        <input type="text" value={formData.ctaLink || ''} onChange={e => setFormData({ ...formData, ctaLink: e.target.value })} className="w-full border rounded p-2 text-sm outline-none" placeholder="/request-quote" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1"><Calendar size={12} className="inline mr-1" /> Start Flight Date (Optional)</label>
                                    <input type="date" value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full border rounded p-2 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1"><Calendar size={12} className="inline mr-1" /> End Flight Date (Optional)</label>
                                    <input type="date" value={formData.endDate || ''} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full border rounded p-2 text-sm outline-none" />
                                </div>
                            </div>

                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-end gap-3 shrink-0">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition text-sm">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-2 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition text-sm flex items-center gap-2"
                            >
                                {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save size={16} />}
                                Save Campaign
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

