'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Columns2, Trash2, Package } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function CompareTray() {
    const pathname = usePathname();
    if (pathname?.startsWith('/executive-portal-aelbd')) return null;
    const [compareList, setCompareList] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const loadCompare = () => {
        try {
            const stored = localStorage.getItem('product_compare');
            if (stored) {
                const parsed = JSON.parse(stored);
                setCompareList(parsed);
                if (parsed.length > 0) setIsOpen(true);
            }
        } catch (e) { }
    };

    useEffect(() => {
        loadCompare();
        // Listen for custom "compare_updated" events
        window.addEventListener('compare_updated', loadCompare);
        return () => window.removeEventListener('compare_updated', loadCompare);
    }, []);

    const removeFromCompare = (id: string) => {
        const updated = compareList.filter(p => p.id !== id);
        localStorage.setItem('product_compare', JSON.stringify(updated));
        setCompareList(updated);
        window.dispatchEvent(new Event('compare_updated'));
        if (updated.length === 0) setIsOpen(false);
    };

    const clearAll = () => {
        localStorage.removeItem('product_compare');
        setCompareList([]);
        setIsOpen(false);
        window.dispatchEvent(new Event('compare_updated'));
    };

    if (compareList.length === 0) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-[150] transition-transform duration-500 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="bg-white dark:bg-dark-surface rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-x border-t border-gray-100 dark:border-gray-800 p-4 md:p-6 overflow-hidden">

                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Columns2 className="text-primary w-4 h-4" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Product Comparison Tray</span>
                            <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">{compareList.length}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={clearAll} className="text-[10px] font-black uppercase tracking-tighter text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
                            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 flex gap-3 overflow-x-auto pb-2 custom-scrollbar w-full">
                            {compareList.map((item) => {
                                let img = '/images/placeholder-product.svg';
                                try {
                                    const parsed = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                                    if (Array.isArray(parsed)) img = parsed[0];
                                } catch (e) { }

                                return (
                                    <div key={item.id} className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2 group overflow-hidden">
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => removeFromCompare(item.id)}
                                            className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}

                            {compareList.length < 4 && (
                                <div className="w-20 md:w-24 shrink-0 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                                    <Package className="text-gray-300 w-8 h-8" />
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
                            <Link
                                href="/compare"
                                className="bg-primary hover:bg-secondary text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                            >
                                Compare Now <ArrowRight size={18} />
                            </Link>
                            <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">Compare technical specs side by side</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

