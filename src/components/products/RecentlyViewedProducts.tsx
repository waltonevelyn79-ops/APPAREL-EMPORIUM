'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { History, X } from 'lucide-react';

export default function RecentlyViewedProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            const recentIdsString = localStorage.getItem('recently_viewed');
            if (!recentIdsString) {
                setLoading(false);
                return;
            }

            try {
                const ids = JSON.parse(recentIdsString) as string[];
                if (ids.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch full product details for these IDs
                // We'll use our existing products API with a IDs filter if supported, 
                // or just fetch them individually if not many.
                // For now, let's assume we can pass comma separated IDs to our API
                const res = await fetch(`/api/products?ids=${ids.join(',')}`);
                const data = await res.json();
                if (data.success) {
                    // Sort to match the order of IDs (most recent first)
                    const sorted = data.products.sort((a: any, b: any) =>
                        ids.indexOf(a.id) - ids.indexOf(b.id)
                    );
                    setProducts(sorted);
                }
            } catch (err) {
                console.error("Failed to load recently viewed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    const clearHistory = () => {
        localStorage.removeItem('recently_viewed');
        setProducts([]);
    };

    if (loading || products.length === 0) return null;

    return (
        <section className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-16">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <History className="text-primary w-6 h-6" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed Items</h2>
                </div>
                <button
                    onClick={clearHistory}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                    <X size={14} /> Clear History
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

