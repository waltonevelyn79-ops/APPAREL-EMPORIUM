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
                <div className="mb-2">
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 transition-colors hover:text-primary leading-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono tracking-tighter">
                        SKU: {product.slug.split('-').slice(-2, -1)[0].toUpperCase()}
                    </p>
                </div>

                {product.priceDisplay && product.priceRange && (
                    <div className="mb-4">
                        <span className="text-xl font-black text-primary dark:text-blue-400">
                            {product.priceRange}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Min. order: {product.minOrder || '500 pieces'}
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-6 flex-grow leading-relaxed">
                    {product.shortDescription}
                </p>

                {/* Specs highlight grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800">
                        <span className="block text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">MOQ</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white truncate" title={specs['MOQ'] || '500 Pcs'}>
                            {specs['MOQ'] || '500 Pcs'}
                        </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800">
                        <span className="block text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Fabric</span>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white truncate" title={specs['Fabric'] || 'Cotton Mix'}>
                            {specs['Fabric'] || 'Cotton Mix'}
                        </span>
                    </div>
                </div>

                {/* Main Action Component */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link href={`/products/${product.slug}`} className="text-sm font-bold text-primary dark:text-gray-300 flex items-center group-hover:text-secondary transition-all">
                        View Item <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href={`/contact?product=${encodeURIComponent(product.name)}`}
                        className="p-2 bg-gray-50 hover:bg-primary hover:text-white text-gray-400 rounded-lg transition-all"
                    >
                        <ShoppingCart size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

