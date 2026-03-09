'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, RefreshCw, Box, Database, Trash2, ShieldAlert, Cpu, CheckCircle2, Terminal } from 'lucide-react';

export default function MaintenancePage() {
    const { data: session } = useSession();
    const isDeveloper = (session?.user as any)?.role === 'DEVELOPER';

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [versionInfo, setVersionInfo] = useState<{
        currentVersion: string;
        latestVersion: string;
        updateAvailable: boolean;
        changelog: string;
    } | null>(null);

    const checkUpdates = async () => {
        setLoading(true);
        setLogs(prev => [...prev, 'Checking for updates...']);
        try {
            const res = await fetch('/api/update'); // GET
            if (res.ok) {
                const data = await res.json();
                setVersionInfo(data);
                setLogs(prev => [...prev, `Current Version: ${data.currentVersion}`, `Latest Version: ${data.latestVersion}`]);
                if (data.updateAvailable) {
                    setLogs(prev => [...prev, 'Update is available!']);
                } else {
                    setLogs(prev => [...prev, 'System is up to date.']);
                }
            } else {
                setLogs(prev => [...prev, `Failed to fetch updates.`]);
            }
        } catch (error) {
            setLogs(prev => [...prev, `Error checking updates: ${String(error)}`]);
        }
        setLoading(false);
    }

    const runCommand = async (action: string) => {
        if (!confirm('Are you sure you want to run this command? This might disrupt active users.')) return;

        setLoading(true);
        setLogs(prev => [...prev, `Running predefined command [${action}]...`]);

        try {
            const res = await fetch(`/api/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();

            if (res.ok) {
                setLogs(prev => [...prev, '✅ Success:', data.message || 'Action completed']);
            } else {
                setLogs(prev => [...prev, '❌ Error:', data.error || data.message, data.details || '']);
            }
        } catch (error) {
            setLogs(prev => [...prev, `❌ Exception: ${String(error)}`]);
        }
        setLoading(false);
    };

    if (session && !isDeveloper) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2" />
                    <h1 className="text-xl font-bold">Access Denied: DEVELOPER role required.</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="w-8 h-8" />
                    System Maintenance & Updates
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Update System */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                        Application Updates
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Current Version</span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {versionInfo?.currentVersion || 'v1.0.0'}
                            </span>
                        </div>

                        <button
                            onClick={checkUpdates}
                            disabled={loading}
                            className="w-full bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Check for Updates
                        </button>

                        {versionInfo?.updateAvailable && (
                            <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg">
                                <h3 className="text-green-800 font-bold mb-2 flex items-center gap-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Update v{versionInfo.latestVersion} Available!
                                </h3>

                                <div className="text-sm text-gray-700 bg-white p-3 rounded border my-2 h-32 overflow-y-auto font-mono whitespace-pre-wrap">
                                    {versionInfo.changelog}
                                </div>

                                <button
                                    onClick={() => runCommand('full')}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 mt-4"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Update Now (Auto-Deploy)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Fixes */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b dark:border-gray-800 pb-4">
                        <Cpu className="w-5 h-5 text-indigo-500" />
                        Quick Fix Actions <span className="text-xs text-red-500 ml-2 font-normal italic">(Developer Only)</span>
                    </h2>

                    <div className="space-y-3">
                        <button onClick={() => runCommand('rebuild')} disabled={loading} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border dark:border-gray-700 rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600"><Box className="w-5 h-5" /> Rebuild Application</span>
                            <span className="text-xs text-gray-400">npm run build</span>
                        </button>

                        <button onClick={() => runCommand('restart')} disabled={loading} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border dark:border-gray-700 rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600"><RefreshCw className="w-5 h-5" /> Restart Application</span>
                            <span className="text-xs text-gray-400">pm2 restart</span>
                        </button>

                        <button onClick={() => runCommand('db')} disabled={loading} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border dark:border-gray-700 rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600"><Database className="w-5 h-5" /> Update DB Schema</span>
                            <span className="text-xs text-gray-400">prisma db push</span>
                        </button>

                        <button onClick={() => runCommand('clear-cache')} disabled={loading} className="w-full text-left p-3 hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-red-600 group-hover:text-red-700"><Trash2 className="w-5 h-5" /> Clear Build Cache</span>
                            <span className="text-xs text-red-400">rm -rf .next/cache</span>
                        </button>
                    </div>
                </div>

                {/* Performance & Technical Systems */}
                <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Cpu className="w-48 h-48 text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <span className="p-2 bg-primary/20 rounded-lg"><RefreshCw className="w-6 h-6 text-primary animate-spin-slow" /></span>
                                Speed & Performance Optimizer
                            </h2>
                            <p className="text-gray-400 mt-2 max-w-2xl font-medium">Trigger systemic optimizations for image processing, database indexing, and static asset delivery to ensure peak responsiveness.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-blue-400" /> Database Tuning
                                </h3>
                                <p className="text-xs text-gray-400 mb-6 leading-relaxed">Defragment indexes, vacuum dead rows, and optimize query plan cache for faster data retrieval.</p>
                                <button onClick={() => runCommand('db-optimize')} disabled={loading} className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl border border-blue-500/30 font-bold text-xs uppercase transition-all">
                                    Run DB Vacuum
                                </button>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-green-400/50 transition-all">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <Box className="w-5 h-5 text-green-400" /> Media & Images
                                </h3>
                                <p className="text-xs text-gray-400 mb-6 leading-relaxed">Purge optimized image cache and re-process product thumbnails for modern AVIF/WebP formats.</p>
                                <button onClick={() => runCommand('media-optimize')} disabled={loading} className="w-full py-2.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white rounded-xl border border-green-500/30 font-bold text-xs uppercase transition-all">
                                    Optimize Media
                                </button>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-amber-400/50 transition-all">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-amber-400" /> Cache Warp
                                </h3>
                                <p className="text-xs text-gray-400 mb-6 leading-relaxed">Invaliding all static paths and rebuilding global ISR cache for immediate content deployment.</p>
                                <button onClick={() => runCommand('revalidate-full')} disabled={loading} className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white rounded-xl border border-amber-500/30 font-bold text-xs uppercase transition-all">
                                    Force Revalidate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terminal Log */}
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col h-80">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center text-slate-400">
                    <Terminal className="w-4 h-4 mr-2" />
                    <span className="text-xs font-mono">System Console Log</span>
                </div>
                <div className="p-4 overflow-y-auto space-y-1 font-mono text-sm flex-1">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic">No output yet. Run an action to see logs.</div>
                    ) : (
                        logs.map((log, i) => {
                            const logEntry = String(log || '');
                            const isError = logEntry.includes('❌') || logEntry.toLowerCase().includes('error');
                            const isSuccess = logEntry.includes('✅') || logEntry.toLowerCase().includes('success');

                            return (
                                <div key={i} className={isError ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-slate-300'}>
                                    <span className="text-slate-600 mr-2 text-[10px]">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="whitespace-pre-wrap">{logEntry}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

