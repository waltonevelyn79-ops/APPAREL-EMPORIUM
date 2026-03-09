'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowLeft, Package, Trash2, Columns2, Mail } from 'lucide-react';

export default function ComparePage() {
    const [compareList, setCompareList] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('product_compare');
        if (stored) setCompareList(JSON.parse(stored));
    }, []);

    const remove = (id: string) => {
        const updated = compareList.filter(p => p.id !== id);
        localStorage.setItem('product_compare', JSON.stringify(updated));
        setCompareList(updated);
        window.dispatchEvent(new Event('compare_updated'));
    };

    if (compareList.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-dark-bg transition-colors">
                <div className="w-24 h-24 bg-white dark:bg-dark-surface rounded-[2rem] shadow-xl flex items-center justify-center mb-10 text-gray-200">
                    <Columns2 size={48} />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">No comparison data</h1>
                <p className="text-gray-500 max-w-sm mx-auto mb-10 text-lg">Add some products to your compare list to see a technical breakdown side-by-side.</p>
                <Link href="/products" className="bg-primary text-white font-black px-12 py-5 rounded-2xl shadow-2xl hover:bg-secondary transition-all transform hover:-translate-y-1">
                    Return to Catalog
                </Link>
            </div>
        );
    }

    // Extract all unique spec keys
    const allSpecKeys = Array.from(new Set(
        compareList.flatMap(p => {
            try {
                const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications || {};
                return Object.keys(specs);
            } catch (e) { return []; }
        })
    ));

    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen py-20 transition-colors">
            <div className="container mx-auto px-4">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <Link href="/products" className="text-sm font-bold text-primary hover:text-secondary flex items-center gap-2 mb-4 group lowercase tracking-tighter">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to sourcing
                        </Link>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter font-heading">Technical Comparison</h1>
                    </div>
                    <div className="bg-white dark:bg-dark-surface px-6 py-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Samples</span>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                        <span className="text-2xl font-black text-primary">{compareList.length}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-gray-800">
                                    <th className="p-10 w-64 bg-gray-50/50 dark:bg-gray-800/30">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Specifications</p>
                                    </th>
                                    {compareList.map(p => {
                                        let img = '/images/placeholder-product.svg';
                                        try {
                                            const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                                            if (Array.isArray(imgs)) img = imgs[0];
                                        } catch (e) { }

                                        return (
                                            <th key={p.id} className="p-10 min-w-[300px] border-l border-gray-50 dark:border-gray-800 group relative">
                                                <button
                                                    onClick={() => remove(p.id)}
                                                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm"
                                                >
                                                    <X size={16} />
                                                </button>

                                                <div className="mb-8 overflow-hidden rounded-[2rem] border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-inner">
                                                    <img src={img} alt="" className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700" />
                                                </div>

                                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">{p.name}</h3>
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest opacity-80 mb-6">{p.category?.name || 'Production Sample'}</p>

                                                <Link
                                                    href={`/contact?product=${encodeURIComponent(p.name)}`}
                                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg"
                                                >
                                                    <Mail size={18} /> Inquiry
                                                </Link>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-50/30 dark:bg-gray-800/20 font-black text-[11px] uppercase tracking-widest text-gray-400">
                                    <td className="p-8 border-b border-gray-50 dark:border-gray-800">Identity</td>
                                    {compareList.map(p => <td key={p.id} className="p-8 border-l border-b border-gray-50 dark:border-gray-800" />)}
                                </tr>
                                <tr>
                                    <td className="p-8 font-bold text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-gray-800">Slug Reference</td>
                                    {compareList.map(p => (
                                        <td key={p.id} className="p-8 border-l border-b border-gray-50 dark:border-gray-800 font-mono text-xs text-gray-400">
                                            {p.slug.toUpperCase()}
                                        </td>
                                    ))}
                                </tr>

                                {allSpecKeys.map(key => (
                                    <tr key={key} className="group transition-colors hover:bg-primary/5">
                                        <td className="p-8 font-bold text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/10">
                                            {key}
                                        </td>
                                        {compareList.map(p => {
                                            let val = '-';
                                            try {
                                                const specs = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications || {};
                                                val = specs[key] || '-';
                                            } catch (e) { }
                                            return (
                                                <td key={p.id} className="p-8 border-l border-b border-gray-50 dark:border-gray-800 group-hover:border-primary/20 transition-colors">
                                                    <span className={`font-bold text-sm ${val === '-' ? 'text-gray-300' : 'text-gray-900 dark:text-white'}`}>{val}</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.2em] mb-4">Manufacturer technical evaluation report compiled by APPAREL EMPORIUM.</p>
                    <button onClick={() => window.print()} className="bg-white dark:bg-dark-surface px-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:shadow-lg transition-all">
                        Generate PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
}

