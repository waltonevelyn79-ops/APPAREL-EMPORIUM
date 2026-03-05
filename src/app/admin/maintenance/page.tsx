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
                setLogs(prev => [...prev, '✅ Success:', data.output]);
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
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                        <Cpu className="w-5 h-5 text-indigo-500" />
                        Quick Fix Actions <span className="text-xs text-red-500 ml-2 font-normal italic">(Developer Only)</span>
                    </h2>

                    <div className="space-y-3">
                        <button onClick={() => runCommand('rebuild')} disabled={loading} className="w-full text-left p-3 hover:bg-gray-50 border rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-gray-700 group-hover:text-indigo-600"><Box className="w-5 h-5" /> Rebuild Application</span>
                            <span className="text-xs text-gray-400">npm run build</span>
                        </button>

                        <button onClick={() => runCommand('restart')} disabled={loading} className="w-full text-left p-3 hover:bg-gray-50 border rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-gray-700 group-hover:text-amber-600"><RefreshCw className="w-5 h-5" /> Restart Application</span>
                            <span className="text-xs text-gray-400">pm2 restart</span>
                        </button>

                        <button onClick={() => runCommand('db')} disabled={loading} className="w-full text-left p-3 hover:bg-gray-50 border rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-gray-700 group-hover:text-blue-600"><Database className="w-5 h-5" /> Update DB Schema</span>
                            <span className="text-xs text-gray-400">prisma db push</span>
                        </button>

                        <button onClick={() => runCommand('clear-cache')} disabled={loading} className="w-full text-left p-3 hover:bg-red-50 border border-red-100 rounded-lg transition flex items-center justify-between group disabled:opacity-50">
                            <span className="flex items-center gap-3 font-medium text-red-600 group-hover:text-red-700"><Trash2 className="w-5 h-5" /> Clear Build Cache</span>
                            <span className="text-xs text-red-400">rm -rf .next/cache</span>
                        </button>
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
                        logs.map((log, i) => (
                            <div key={i} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-slate-300'}>
                                <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                <span className="whitespace-pre-wrap">{log}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
