'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Bell, Check, Trash2, Mail, FileText, AlertCircle, MessageSquare, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsAdmin() {
    const { role } = usePermission();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        fetchNotifications();
    }, [typeFilter, page]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
            if (typeFilter !== 'ALL') params.append('type', typeFilter);

            const res = await fetch(`/api/notifications?${params.toString()}`);
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setTotal(data.total || 0);
            }
        } catch (e) { console.error(e) } finally { setLoading(false) }
    };

    const markAsRead = async (id: string, isRead: boolean) => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isRead })
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead } : n));
        } catch (e) { }
    };

    const deleteNotification = async (id: string) => {
        if (!confirm("Permanently delete alert record?")) return;
        try {
            await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
            setNotifications(notifications.filter(n => n.id !== id));
            setTotal(Math.max(0, total - 1));
        } catch (e) { }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'INQUIRY': return <MessageSquare size={18} className="text-blue-500" />;
            case 'RFQ': return <FileText size={18} className="text-purple-500" />;
            case 'SYSTEM': return <AlertCircle size={18} className="text-red-500" />;
            default: return <Bell size={18} className="text-gray-500" />;
        }
    };

    if (role === 'VIEWER') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-3 font-heading text-gray-900 dark:text-white">
                        <Bell className="text-primary w-8 h-8" /> Alert Center Hub
                    </h1>
                    <p className="text-gray-500 text-sm">Full chronological history of system warnings and inbound hooks.</p>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="mt-4 md:mt-0 p-2.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-xl"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">

                {/* Header Actions */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {['ALL', 'INQUIRY', 'RFQ', 'SYSTEM'].map(t => (
                            <button
                                key={t}
                                onClick={() => { setTypeFilter(t); setPage(1); }}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${typeFilter === t ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t === 'ALL' ? 'All Alerts' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List View */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 && !loading ? (
                        <div className="p-20 text-center text-gray-400">
                            <Bell className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                            <p className="font-bold text-lg text-gray-500">Inbox Zero</p>
                            <p className="text-sm mt-1">No alerts matching current filters.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.map(n => (
                                <li key={n.id} className={`p-5 flex gap-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!n.isRead ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>

                                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${!n.isRead ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 dark:bg-gray-800 border-transparent'}`}>
                                        {getIcon(n.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 mb-1">
                                            <h4 className={`text-base font-bold ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{n.title}</h4>
                                            <span className="text-xs text-gray-400 font-mono flex items-center gap-2 shrink-0">
                                                {new Date(n.createdAt).toLocaleString()}
                                                {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse inline-block"></span>}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-4xl">{n.message}</p>
                                    </div>

                                    <div className="shrink-0 flex flex-col gap-2 items-end justify-center px-4">
                                        <button
                                            onClick={() => markAsRead(n.id, !n.isRead)}
                                            className={`p-2 rounded-lg transition-colors border ${n.isRead ? 'text-gray-400 border-transparent hover:text-blue-500 hover:bg-blue-50' : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100 font-bold'}`}
                                            title={n.isRead ? "Mark as unread" : "Acknowledge Alert"}
                                        >
                                            <CheckCircle2 size={18} className={!n.isRead ? 'animate-bounce' : ''} />
                                        </button>
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                                            title="Delete permanently"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {total > limit && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-between items-center z-10">
                        <span className="text-sm font-bold text-gray-500">Record {(page - 1) * limit + 1} &rarr; {Math.min(page * limit, total)} of {total}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-5 py-2 border rounded-lg bg-white dark:bg-dark-surface font-bold text-sm shadow-sm disabled:opacity-50 hover:bg-gray-50 transition">Previous</button>
                            <button onClick={() => setPage(page + 1)} disabled={page * limit >= total} className="px-5 py-2 border rounded-lg bg-white dark:bg-dark-surface font-bold text-sm shadow-sm disabled:opacity-50 hover:bg-gray-50 transition">Next Page</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

