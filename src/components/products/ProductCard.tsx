'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { ArrowRight, Eye, ShoppingCart, Columns2, Check } from 'lucide-react';
import { useAddToCompare } from '@/hooks/useAddToCompare';
import { extractFeaturedImage } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
    const { addToCompare, isInCompare } = useAddToCompare();
    const isComparing = isInCompare(product.id);

    // Parse specifications safely
    let specs: any = {};
    try {
        if (typeof product.specifications === 'string') {
            specs = JSON.parse(product.specifications);
        } else {
            specs = product.specifications;
        }
    } catch (e) {
        console.error('Failed to parse specs', e);
    }

    // Handle images
    const mainImage = extractFeaturedImage(product.images);

    return (
        <div className="group relative flex flex-col bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            {/* Image Frame */}
            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer">
                <Link
                    href={`/products/${product.slug}`}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                </Link>

                {/* Overlay with Quick View button */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
                        className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg"
                    >
                        <Eye size={18} /> Quick View
                    </button>

                    {/* Action buttons on left */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2 translate-x-[-20px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all delay-75">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCompare(product); }}
                            className={`p-3 rounded-full shadow-md transition-all ${isComparing ? 'bg-primary text-white scale-110 shadow-primary/40' : 'bg-white text-gray-900 hover:bg-primary hover:text-white'}`}
                            title={isComparing ? "In Comparison" : "Add to Comparison"}
                        >
                            {isComparing ? <Check size={18} /> : <Columns2 size={18} />}
                        </button>
                    </div>
                </div>

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/95 dark:bg-black/90 backdrop-blur-md text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter text-primary dark:text-gray-200 shadow-sm">
                        {product.category?.name || 'In Stock'}
                    </span>
                </div>
            </div>

            {/* Content ... remains similar ... */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-2 min-w-0">
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 transition-colors hover:text-primary leading-tight truncate">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-mono font-bold tracking-tight truncate">
                        SKU: {product.slug.split('-').slice(-2, -1)[0]?.toUpperCase() || product.slug.slice(0, 8).toUpperCase()}
                    </p>
                </div>

                {/* B2B Sourcing Tag (NO PUBLIC PRICES) */}
                <div className="mb-3 flex items-center justify-between min-w-0 gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md truncate">
                        B2B Sourcing & Export
                    </span>
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                        Custom Tech-Pack
                    </span>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-4 flex-grow leading-relaxed break-words">
                    {product.shortDescription || product.description}
                </p>

                {/* Specs highlight grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 min-w-0">
                        <span className="block text-[9px] text-gray-700 dark:text-gray-300 uppercase font-black tracking-widest mb-0.5">Min. Order</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white truncate" title={specs['MOQ'] || product.minOrder || '500 Pcs'}>
                            {specs['MOQ'] || product.minOrder || '500 Pcs'}
                        </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 min-w-0">
                        <span className="block text-[9px] text-gray-700 dark:text-gray-300 uppercase font-black tracking-widest mb-0.5">Fabric</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white truncate" title={specs['Fabric'] || 'Custom Combed Cotton'}>
                            {specs['Fabric'] || 'Custom Combed Cotton'}
                        </span>
                    </div>
                </div>

                {/* Main Action Component: Details & Request Quote */}
                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 text-center py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Specs
                    </Link>
                    <Link
                        href={`/request-quote?product=${encodeURIComponent(product.name)}`}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all text-center flex items-center justify-center gap-1"
                    >
                        <span>Quote</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

