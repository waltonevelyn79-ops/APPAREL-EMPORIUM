'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import QuickViewModal from './QuickViewModal';
import { XCircle, RefreshCw } from 'lucide-react';

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 dark:bg-dark-surface/50 rounded-3xl border-4 border-dashed border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
                    <XCircle size={48} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">No matching items found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
                    It seems we don't have exactly what you're looking for. Try adjusting your search filters or clearing your query.
                </p>
                <button
                    onClick={() => window.location.href = '/products'}
                    className="bg-primary hover:bg-secondary text-white font-bold px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={20} /> Reset All Sourcing Filters
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                    />
                ))}
            </div>

            {/* Global Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </>
    );
}

