'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Activity, Search, Filter, Download, ArrowRight, Server, Shield, Database, Settings, LogIn, FileEdit, Plus, Trash, Users, Package, ClipboardList } from 'lucide-react';

interface ActivityLog {
    id: string;
    action: string;
    entity: string | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: { name: string; email: string; avatar: string | null } | null;
}

export default function ActivityLogPage() {
    const { role } = usePermission();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [action, setAction] = useState('ALL');
    const [entity, setEntity] = useState('ALL');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 25;

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, [action, entity, page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
            if (action !== 'ALL') params.append('action', action);
            if (entity !== 'ALL') params.append('entity', entity);

            const res = await fetch(`/api/activity-log?${params.toString()}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs);
                setTotal(data.total);
            }
        } catch (e) { console.error(e) } finally { setLoading(false) }
    };

    const exportCsv = () => {
        if (!logs.length) return;
        const csvRows = [];
        csvRows.push(['Date', 'Time', 'User', 'Email', 'Action', 'Entity', 'Details', 'IP Address']);

        logs.forEach(log => {
            const date = new Date(log.createdAt);
            csvRows.push([
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                log.user?.name || 'System',
                log.user?.email || 'N/A',
                log.action,
                log.entity || '',
                log.details ? log.details.replace(/,/g, ' ') : '', // sanitize commas
                log.ipAddress || ''
            ].join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getActionBadge = (a: string) => {
        switch (a) {
            case 'CREATE': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider"><Plus size={10} className="inline mr-1 -mt-0.5" />CREATE</span>;
            case 'UPDATE': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider"><FileEdit size={10} className="inline mr-1 -mt-0.5" />UPDATE</span>;
            case 'DELETE': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider"><Trash size={10} className="inline mr-1 -mt-0.5" />DELETE</span>;
            case 'LOGIN': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider"><LogIn size={10} className="inline mr-1 -mt-0.5" />LOGIN</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider">{a}</span>;
        }
    };

    const getEntityIcon = (e: string | null) => {
        if (!e) return <Server size={14} />;
        e = e.toLowerCase();
        if (e.includes('user')) return <Users size={14} />;
        if (e.includes('product')) return <Package size={14} />;
        if (e.includes('setting')) return <Settings size={14} />;
        if (e.includes('rfq')) return <ClipboardList size={14} />;
        return <Database size={14} />;
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-3 font-heading">
                        <Shield className="text-primary w-8 h-8" /> Audit Logs
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time immutable ledger of system mutations and access controls.</p>
                </div>
                <button
                    onClick={exportCsv}
                    className="mt-4 md:mt-0 px-6 py-2.5 border border-gray-300 dark:border-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 text-sm"
                >
                    <Download size={16} /> Export CSV Ledger
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <Filter size={16} /> Filtering Engine:
                </div>
                <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }} className="border rounded p-2 text-sm bg-white dark:bg-dark-surface dark:border-gray-700 outline-none w-40">
                    <option value="ALL">All Actions</option>
                    <option value="LOGIN">Logins</option>
                    <option value="CREATE">Creations (POST)</option>
                    <option value="UPDATE">Mutations (PUT)</option>
                    <option value="DELETE">Deletions (DEL)</option>
                </select>
                <select value={entity} onChange={e => { setEntity(e.target.value); setPage(1); }} className="border rounded p-2 text-sm bg-white dark:bg-dark-surface dark:border-gray-700 outline-none w-48">
                    <option value="ALL">Target Entities (All)</option>
                    <option value="User">User Model</option>
                    <option value="Product">Product Model</option>
                    <option value="SiteSetting">Configuration (Settings)</option>
                    <option value="RFQ">RFQ Records</option>
                    <option value="BlogPost">Content (Blogs)</option>
                </select>
                {loading && <div className="ml-auto flex items-center gap-2 text-xs text-primary font-bold"><Activity size={12} className="animate-spin" /> Syncing Ledger...</div>}
            </div>

            {/* Log Table */}
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden font-mono text-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-dark-bg text-xs tracking-widest uppercase text-gray-500 font-sans border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="p-4 w-40">Timestamp</th>
                            <th className="p-4 w-56">Actor</th>
                            <th className="p-4 w-32">Vector</th>
                            <th className="p-4 w-40">Entity Form</th>
                            <th className="p-4">Fingerprint / Payload</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 text-gray-500 text-xs">
                                    <div className="font-bold text-gray-700 dark:text-gray-300">{new Date(log.createdAt).toLocaleDateString()}</div>
                                    <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="p-4">
                                    {log.user ? (
                                        <div className="flex items-center gap-3">
                                            <img src={log.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user.name}`} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white" alt="Avatar" />
                                            <div className="font-sans leading-tight">
                                                <div className="font-bold text-gray-900 dark:text-white truncate">{log.user.name}</div>
                                                <div className="text-[10px] text-gray-400 truncate w-32">{log.user.email}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-500 italic font-sans"><Server size={14} /> System Process</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {/* Workaround for inline SVG imports avoiding missing variables not available in scope */}
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold tracking-widest uppercase
                                        ${log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    log.action === 'LOGIN' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-200 text-gray-700'}`
                                    }>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {log.entity ? (
                                        <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
                                            {/* Static fallback server icon representing entity type generically instead of dynamic map lookup for brevity */}
                                            <Database size={14} className="text-gray-400" /> {log.entity}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 break-words line-clamp-2" title={log.details || ''}>
                                        {log.details || 'No payload details recorded.'}
                                    </div>
                                    {log.ipAddress && <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><span className="text-primary">•</span> IP: {log.ipAddress}</div>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500 font-sans">No audit logs found matching criteria.</div>
                )}
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="flex justify-between items-center mt-6">
                    <span className="text-sm font-bold text-gray-500">Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} records</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg bg-white dark:bg-dark-surface font-bold disabled:opacity-50">Prev</button>
                        <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="px-4 py-2 border rounded-lg bg-white dark:bg-dark-surface font-bold disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

