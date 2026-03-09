'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
    Edit2, Trash2, CheckCircle2, XCircle, Search,
    MoreVertical, Copy, Download, Trash,
    CheckCircle, ChevronLeft, ChevronRight, Loader2,
    Filter, LayoutGrid, List, AlertCircle
} from 'lucide-react';
import { extractFeaturedImage } from '@/lib/utils';

interface ProductManagementTableProps {
    categories: any[];
}

export default function ProductManagementTable({ categories }: ProductManagementTableProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}&include_all=true`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
                setTotal(data.total);
            }
        } catch (e) {
            console.error("Fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchProducts, search ? 400 : 0);
        return () => clearTimeout(timer);
    }, [page, search]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(products.map(p => p.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(i => i !== id));
    };

    const performBulkAction = async (action: string, value: any = null) => {
        if (selectedIds.length === 0) return;
        if (action === 'DELETE' && !confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

        setActionLoading(action);
        try {
            const res = await fetch('/api/admin/products/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, action, value })
            });

            if ((await res.json()).success) {
                fetchProducts();
                setSelectedIds([]);
            }
        } catch (e) {
            alert('Bulk action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const duplicateProduct = async (id: string) => {
        if (!confirm('Duplicate this product?')) return;
        setActionLoading(`dup-${id}`);
        try {
            const res = await fetch('/api/admin/products/duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if ((await res.json()).success) fetchProducts();
        } finally {
            setActionLoading(null);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const res = await fetch('/api/admin/products/export');
            const data = await res.json();
            if (data.success) {
                const ws = XLSX.utils.json_to_sheet(data.data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Products Export");
                XLSX.writeFile(wb, `ApparelEmporium_Products_${new Date().toISOString().split('T')[0]}.xlsx`);
            }
        } catch (e) {
            alert('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const deleteOne = async (id: string) => {
        if (!confirm('Delete this product permanently?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if ((await res.json()).success) fetchProducts();
        } catch (e) {
            alert('Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Find products by name, slug, fabric..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white text-sm"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>

                    <button
                        onClick={exportToExcel}
                        disabled={isExporting}
                        className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-xl transition-all border border-gray-100 dark:border-gray-700 flex items-center gap-2 text-sm font-bold disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={18} />} <span className="hidden sm:inline">Export To Cloud (Excel)</span>
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-right-4 duration-300">
                            <span className="text-xs font-black px-3 text-gray-500 uppercase tracking-tighter">{selectedIds.length} Selections</span>
                            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

                            <button
                                onClick={() => performBulkAction('STATUS', true)}
                                disabled={!!actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            >
                                <CheckCircle size={18} />
                            </button>

                            <button
                                onClick={() => performBulkAction('DELETE')}
                                disabled={!!actionLoading}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash size={18} />
                            </button>

                            <select
                                onChange={(e) => { if (e.target.value) { performBulkAction('CATEGORY', e.target.value); e.target.value = ""; } }}
                                className="bg-transparent border-none text-[10px] font-bold text-primary uppercase focus:ring-0 pr-6"
                            >
                                <option value="">Move To Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <Link href="/executive-portal-aelbd/products/new" className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm ml-auto">
                        <LayoutGrid size={18} /> Add New Entry
                    </Link>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                )}

                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-md">
                            <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">
                                <th className="p-5 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={selectedIds.length > 0 && selectedIds.length === products.length}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="p-5 w-20">Media</th>
                                <th className="p-5">Product Definition</th>
                                <th className="p-5">Classification</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Growth</th>
                                <th className="p-5 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {products.map((product) => {
                                const img = extractFeaturedImage(product.images);

                                return (
                                    <tr key={product.id} className={`group hover:bg-primary/5 transition-all ${selectedIds.includes(product.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="p-5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(product.id)}
                                                onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </td>
                                        <td className="p-5">
                                            <div className="w-12 h-14 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 dark:text-white text-sm tracking-tight mb-0.5 group-hover:text-primary transition-colors">{product.name}</span>
                                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">SKU: {product.slug.split('-').pop()?.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-md text-[10px] font-bold text-gray-500">
                                                {product.category?.name || 'Unmapped'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-xs">
                                            {product.isActive ? (
                                                <div className="flex items-center gap-1.5 text-green-500 font-bold uppercase tracking-wider text-[9px]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" /> Live
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Offline
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {product.isFeatured ? (
                                                <span className="bg-yellow-100/50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">Featured</span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Standard</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-1 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => duplicateProduct(product.id)}
                                                    disabled={actionLoading === `dup-${product.id}`}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Duplicate Product"
                                                >
                                                    {actionLoading === `dup-${product.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                                <Link
                                                    href={`/executive-portal-aelbd/products/${product.id}/edit`}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit Item"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteOne(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {products.length === 0 && !loading && (
                        <div className="p-20 text-center flex flex-col items-center">
                            <AlertCircle className="w-16 h-16 text-gray-200 mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No High Quality Samples Found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mb-8">Change your refined search or click at the top to manufacture some new data entries.</p>
                            <button onClick={() => { setSearch(''); setPage(1); }} className="text-primary font-bold hover:underline">Clear Refinements</button>
                        </div>
                    )}
                </div>

                {/* Rich Pagination */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Index Entry {Math.min((page - 1) * limit + 1, total)}-{Math.min((page - 1) * limit + limit, total)} per {total} Total Units
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 hover:bg-white dark:hover:bg-dark-surface rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 disabled:opacity-30 shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-700 p-1">
                            {Array.from({ length: Math.ceil(total / limit) }).slice(Math.max(0, page - 3), Math.min(Math.ceil(total / limit), page + 2)).map((_, i) => {
                                const p = Math.max(1, page - 2) + i; // Close enough logic for demo
                                const realPage = products.length > 0 ? (total > limit ? i + 1 : 1) : 1; // Simplify for UI

                                // Proper dynamic page logic
                                const totalPages = Math.ceil(total / limit);
                                let pagesToShow = [];
                                if (totalPages <= 5) {
                                    for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
                                } else {
                                    if (page <= 3) pagesToShow = [1, 2, 3, 4, 5];
                                    else if (page >= totalPages - 2) pagesToShow = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                                    else pagesToShow = [page - 2, page - 1, page, page + 1, page + 2];
                                }

                                return pagesToShow.map(pNum => (
                                    <button
                                        key={pNum}
                                        onClick={() => setPage(pNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === pNum ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400'}`}
                                    >
                                        {pNum}
                                    </button>
                                )).filter((_, idx, self) => self.indexOf(_) === idx); // Dedupe
                            })}
                        </div>

                        <button
                            disabled={page >= Math.ceil(total / limit)}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 hover:bg-white dark:hover:bg-dark-surface rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 disabled:opacity-30 shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

