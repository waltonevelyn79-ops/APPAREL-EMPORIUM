'use client';

import React, { useState } from 'react';
import { X, Mail, ArrowRight, Package, Truck, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { extractProductImages } from '@/lib/utils';

interface QuickViewModalProps {
    product: any;
    onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
    const [currentImage, setCurrentImage] = useState(0);

    // Parse data
    const images = extractProductImages(product.images);

    let specs: any = {};
    try {
        specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications || {};
    } catch (e) { }

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in slide-in-from-bottom-4 duration-300 h-full max-h-[90vh] md:h-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-black/50 hover:bg-red-500 hover:text-white rounded-full transition-all backdrop-blur shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* Left: Gallery (Carousel style for modal) */}
                <div className="w-full md:w-1/2 relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center group overflow-hidden">
                    <img
                        src={images[currentImage]}
                        alt={product.name}
                        className="w-full h-full object-contain aspect-square p-8"
                    />

                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-4 p-2 bg-white/80 dark:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextImage} className="absolute right-4 p-2 bg-white/80 dark:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <ChevronRight size={20} />
                            </button>
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                                {images.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImage ? 'w-6 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-600'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    <div className="mb-4">
                        <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            {product.category?.name || 'In Stock'}
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed line-clamp-3">{product.shortDescription}</p>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Minimum Order</span>
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-primary" />
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{specs['MOQ'] || '500 Pcs'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Est. Lead Time</span>
                            <div className="flex items-center gap-2">
                                <Truck size={16} className="text-primary" />
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{specs['Lead Time'] || '45-60 Days'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Full Spec List (Condensed) */}
                    <div className="space-y-3 mb-10">
                        {Object.entries(specs).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 font-medium">{k}</span>
                                <span className="text-gray-900 dark:text-gray-200 font-bold">{v as string}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <Link
                            href={`/products/${product.slug}`}
                            onClick={onClose}
                            className="bg-primary hover:bg-secondary text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group"
                        >
                            View All Specifications <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href={`/contact?product=${encodeURIComponent(product.name)}`}
                            onClick={onClose}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <Mail size={18} /> Request Bulk Quote
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

