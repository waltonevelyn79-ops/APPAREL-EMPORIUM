'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { FileCode, Plus, Search, Filter, MoreVertical, Edit, Trash2, Globe, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PagesManagementPage() {
    const { role } = usePermission();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking pages for now as we don't have a model for static pages yet
        // In a real scenario, this would fetch from a 'Page' model
        setPages([
            { id: '1', title: 'Privacy Policy', slug: 'privacy-policy', status: 'Published', lastModified: '2024-03-01' },
            { id: '2', title: 'Terms of Service', slug: 'terms-and-conditions', status: 'Published', lastModified: '2024-03-02' },
            { id: '3', title: 'Shipping Policy', slug: 'shipping-policy', status: 'Draft', lastModified: '2024-03-05' },
        ]);
        setLoading(false);
    }, []);

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-12 text-center font-bold text-red-500">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black font-heading flex items-center gap-3">
                        <FileCode className="text-primary" /> Static Page Manager
                    </h1>
                    <p className="text-gray-500 font-medium">Create and manage non-product static pages.</p>
                </div>
                <button className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
                    <Plus size={18} /> Create New Page
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text" placeholder="Search pages..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-transparent focus:border-primary rounded-xl text-sm font-bold transition-all outline-none"
                        />
                    </div>
                    <button className="p-3 bg-gray-50 dark:bg-dark-bg text-gray-400 rounded-xl hover:text-primary transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-bg/50">
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Page Title</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Slug</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Last Modified</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{page.title}</div>
                                    </td>
                                    <td className="px-8 py-6 font-mono text-xs text-gray-500">/{page.slug}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${page.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500">{page.lastModified}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"><Edit size={16} /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 p-8 rounded-3xl flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg">
                    <Globe size={30} />
                </div>
                <div>
                    <h4 className="text-xl font-bold font-heading mb-1 text-primary">SEO Tip: Static Pages</h4>
                    <p className="text-sm text-primary/80 leading-relaxed font-medium">Static pages like your Privacy Policy and About page are crawled by search engines. Ensure they follow your brand's voice and include relevant keywords to improve your domain authority.</p>
                </div>
            </div>
        </div>
    );
}
