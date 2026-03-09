'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Globe, FileText, CornerDownRight, Save, Link as LinkIcon, Lock, Activity, Eye, Trash2, Plus } from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

export default function SeoManagerPage() {
    const { role } = usePermission();
    const [activeTab, setActiveTab] = useState<'global' | 'pages' | 'robots' | 'redirects' | 'sitemap'>('global');
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Redirects
    const [redirects, setRedirects] = useState<any[]>([]);
    const [newRedirect, setNewRedirect] = useState({ source: '', target: '', code: 301 });

    const PAGES = ['home', 'products', 'about', 'contact', 'blog'];

    useEffect(() => {
        fetchSettings();
        if (activeTab === 'redirects') fetchRedirects();
    }, [activeTab]);

    const fetchSettings = async () => {
        const res = await fetch('/api/settings?group=seo');
        const data = await res.json();
        const map: Record<string, string> = {};
        if (data.settings) {
            data.settings.forEach((s: any) => map[s.key] = s.value);
        }
        setSettings(map);
    };

    const fetchRedirects = async () => {
        const res = await fetch('/api/settings?group=redirects');
        const data = await res.json();
        try {
            const arr = JSON.parse(data.settings?.find((s: any) => s.key === 'seo_redirects')?.value || '[]');
            setRedirects(arr);
        } catch { setRedirects([]); }
    };

    const updateSetting = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await Promise.all(
                Object.entries(settings).map(([k, v]) =>
                    fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: k, value: v, group: 'seo' })
                    })
                )
            );
            alert("SEO settings saved.");
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const saveRedirects = async (arr: any[]) => {
        setRedirects(arr);
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'seo_redirects', value: JSON.stringify(arr), group: 'redirects' })
        });
    };

    const addRedirect = async () => {
        if (!newRedirect.source || !newRedirect.target) return;
        const arr = [...redirects, { id: Date.now().toString(), ...newRedirect, hits: 0, active: true }];
        await saveRedirects(arr);
        setNewRedirect({ source: '', target: '', code: 301 });
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3 font-heading">
                        <Globe className="text-primary w-8 h-8" /> SEO & Performance Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Control metadata, crawlers, edge redirects, and open graph schemas.</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="mt-4 md:mt-0 px-6 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition flex items-center gap-2"
                >
                    {saving ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : <Save size={18} />}
                    Save All SEO Changes
                </button>
            </div>

            <div className="flex overflow-x-auto gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl mb-8 border border-gray-200 dark:border-gray-800">
                {[
                    { id: 'global', icon: Globe, label: 'Global Defaults' },
                    { id: 'pages', icon: FileText, label: 'Per-Page Meta' },
                    { id: 'robots', icon: Lock, label: 'Robots.txt' },
                    { id: 'redirects', icon: CornerDownRight, label: '301 Redirects' },
                    { id: 'sitemap', icon: LinkIcon, label: 'Sitemap XML' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                        ${activeTab === tab.id
                                ? 'bg-white dark:bg-dark-surface shadow-sm text-primary'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">

                {/* GLOBAL SEO TAB */}
                {activeTab === 'global' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-800 dark:text-blue-300 mb-8">
                            These settings act as the ultimate fallback. If a specific page does not have custom SEO metadata, Next.js will inject these default params.
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default Meta Title Template</label>
                            <input
                                type="text"
                                value={settings['seo_default_title'] || ''}
                                onChange={e => updateSetting('seo_default_title', e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-dark-bg focus:ring-primary focus:border-primary outline-none"
                                placeholder="%s | Premium Garments Production"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default Meta Description</label>
                            <textarea
                                value={settings['seo_default_description'] || ''}
                                onChange={e => updateSetting('seo_default_description', e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-dark-bg focus:ring-primary focus:border-primary outline-none"
                                rows={3}
                            ></textarea>
                            <span className="text-xs text-gray-400 mt-1 block">Optimal length: 150-160 characters.</span>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Default OpenGraph Schema Banner (OG:Image)</label>
                            <ImagePicker value={settings['seo_default_og_image'] || ''} onChange={url => updateSetting('seo_default_og_image', url)} />
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-8 space-y-6">
                            <h3 className="font-bold text-lg font-heading">Webmaster Verification</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Site Verification Content Code</label>
                                <input type="text" value={settings['seo_google_verify'] || ''} onChange={e => updateSetting('seo_google_verify', e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono bg-gray-50 dark:bg-dark-bg text-sm focus:ring-primary focus:border-primary outline-none" placeholder="e.g. dBw5CvX_w..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bing Webmaster Content Code</label>
                                <input type="text" value={settings['seo_bing_verify'] || ''} onChange={e => updateSetting('seo_bing_verify', e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono bg-gray-50 dark:bg-dark-bg text-sm focus:ring-primary focus:border-primary outline-none" placeholder="e.g. 5A1C..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* PAGES SEO TAB */}
                {activeTab === 'pages' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl mb-6 text-sm text-yellow-800 dark:text-yellow-600 font-medium">
                            Override index definitions for statically routed structural pages. Product and Blog SEO are driven via their respective CMS builders.
                        </div>

                        {PAGES.map(page => (
                            <details key={page} className="group border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-dark-bg overflow-hidden cursor-pointer">
                                <summary className="px-6 py-4 font-bold uppercase tracking-wider text-sm hover:bg-gray-100 dark:hover:bg-gray-800 outline-none list-none flex justify-between items-center group-open:border-b border-gray-200 dark:border-gray-800">
                                    <span>/{page === 'home' ? '' : page} Route</span>
                                    <div className="text-gray-400 group-open:rotate-180 transition-transform"><CornerDownRight size={18} /></div>
                                </summary>
                                <div className="p-6 bg-white dark:bg-dark-surface grid grid-cols-1 md:grid-cols-2 gap-6 cursor-default">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Meta Title</label>
                                        <input type="text" value={settings[`seo_page_${page}_title`] || ''} onChange={e => updateSetting(`seo_page_${page}_title`, e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-primary focus:border-primary outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Meta Description</label>
                                        <textarea value={settings[`seo_page_${page}_desc`] || ''} onChange={e => updateSetting(`seo_page_${page}_desc`, e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-primary focus:border-primary outline-none" rows={2}></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">Canonical URL override</label>
                                        <input type="text" value={settings[`seo_page_${page}_canonical`] || ''} onChange={e => updateSetting(`seo_page_${page}_canonical`, e.target.value)} className="w-full border rounded p-2 text-sm font-mono focus:ring-primary focus:border-primary outline-none" placeholder={`https://domain.com/${page === 'home' ? '' : page}`} />
                                    </div>
                                    <div className="flex gap-6 items-center pt-5">
                                        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                            <input type="checkbox" checked={settings[`seo_page_${page}_noindex`] === 'true'} onChange={e => updateSetting(`seo_page_${page}_noindex`, e.target.checked.toString())} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary" />
                                            No-Index
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                            <input type="checkbox" checked={settings[`seo_page_${page}_nofollow`] === 'true'} onChange={e => updateSetting(`seo_page_${page}_nofollow`, e.target.checked.toString())} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary" />
                                            No-Follow
                                        </label>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                )}

                {/* ROBOTS.TXT TAB */}
                {activeTab === 'robots' && (
                    <div className="max-w-3xl">
                        <h3 className="font-bold mb-2">Custom Robots.txt rules</h3>
                        <p className="text-sm text-gray-500 mb-4">Leave entirely blank to use Next.js's standard safe auto-generation.</p>
                        <textarea
                            value={settings['seo_custom_robots'] || ''}
                            onChange={e => updateSetting('seo_custom_robots', e.target.value)}
                            className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-xl focus:ring-2 focus:ring-primary border-transparent outline-none"
                            placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                        ></textarea>
                    </div>
                )}

                {/* REDIRECTS TAB */}
                {activeTab === 'redirects' && (
                    <div>
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl mb-8">
                            <h3 className="font-bold text-sm mb-4">Bind New Intercept Map</h3>
                            <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Old Source URl Path</label>
                                    <input type="text" value={newRedirect.source} onChange={e => setNewRedirect({ ...newRedirect, source: e.target.value })} className="w-full border rounded p-2 text-sm font-mono focus:ring-primary outline-none" placeholder="/old-products.php" />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">New Target URL</label>
                                    <input type="text" value={newRedirect.target} onChange={e => setNewRedirect({ ...newRedirect, target: e.target.value })} className="w-full border rounded p-2 text-sm font-mono focus:ring-primary outline-none" placeholder="/products" />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Code</label>
                                    <select value={newRedirect.code} onChange={e => setNewRedirect({ ...newRedirect, code: Number(e.target.value) })} className="w-full border rounded p-2 text-sm outline-none">
                                        <option value={301}>301 Perm</option>
                                        <option value={302}>302 Temp</option>
                                    </select>
                                </div>
                                <button onClick={addRedirect} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded hover:bg-primary transition h-[38px]"><Plus size={18} /></button>
                            </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left font-mono text-sm">
                                <thead className="bg-gray-50 dark:bg-dark-bg text-xs tracking-wider uppercase text-gray-500 font-sans">
                                    <tr>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800">Map Route</th>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800">Code</th>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800">Traffic</th>
                                        <th className="p-4 border-b border-gray-200 dark:border-gray-800 text-right">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redirects.map((r, idx) => (
                                        <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4 break-all block"><span className="text-red-500">{r.source}</span> <ArrowIcon /> <span className="text-green-500">{r.target}</span></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold font-sans ${r.code === 301 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.code}</span>
                                            </td>
                                            <td className="p-4"><div className="flex items-center gap-1 text-gray-400 capitalize font-sans"><Activity size={12} /> {r.hits || 0} hits</div></td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => saveRedirects(redirects.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {redirects.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-sans">No route intercepts defined.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SITEMAP TAB */}
                {activeTab === 'sitemap' && (
                    <div className="text-center py-10 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-green-100/50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><LinkIcon size={40} /></div>
                        <h3 className="text-2xl font-bold mb-2">Dynamic XML Sitemap Active</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">Your Next.js sitemap.xml is automatically wired to the Prisma database. It crawls all published products, live categories, active blog posts, and dynamic layouts without any manual rebuilds.</p>
                        <a href="/sitemap.xml" target="_blank" className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">
                            <Eye size={18} /> View Live sitemap.xml
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
}

const ArrowIcon = () => <span className="text-gray-300 mx-2">→</span>;

