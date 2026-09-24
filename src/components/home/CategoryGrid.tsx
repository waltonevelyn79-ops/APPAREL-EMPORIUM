'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shirt, ShoppingBag, Baby, Home, Star, Tag, Layers } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    _count?: {
        products: number;
    }
}

// Map category names to gradient colors and icons for when no image is available
const categoryStyles: Record<string, { gradient: string; icon: React.ReactNode }> = {
    "knitwear": { gradient: 'from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB]', icon: <Shirt size={56} className="text-white/95" /> },
    "woven": { gradient: 'from-[#0F2942] via-[#0F4C81] to-[#1E3A8A]', icon: <Layers size={56} className="text-white/95" /> },
    "sweater": { gradient: 'from-[#3E2723] via-[#4E342E] to-[#5D4037]', icon: <ShoppingBag size={56} className="text-white/95" /> },
    "accessories": { gradient: 'from-[#2E1065] via-[#4C1D95] to-[#6D28D9]', icon: <Star size={56} className="text-white/95" /> },
    "men's fashion": { gradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]', icon: <Shirt size={56} className="text-white/90" /> },
    "women's fashion": { gradient: 'from-[#4C0519] via-[#881337] to-[#BE123C]', icon: <ShoppingBag size={56} className="text-white/90" /> },
    "children's fashion": { gradient: 'from-[#064E3B] via-[#065F46] to-[#0D9488]', icon: <Baby size={56} className="text-white/90" /> },
};

function getCategoryStyle(name: string) {
    const key = name.toLowerCase();
    for (const [pattern, style] of Object.entries(categoryStyles)) {
        if (key.includes(pattern)) return style;
    }
    return { gradient: 'from-gray-900 via-gray-800 to-gray-700', icon: <Layers size={56} className="text-white/90" /> };
}

export default function CategoryGrid({ headings }: { headings?: { category_grid_eyebrow?: string; category_grid_heading?: string } }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data.slice(0, 8)); // Top 8
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-24 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-12">
                    <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full" />
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-heading mb-12">
                        {headings?.category_grid_heading || 'Shop By Category'}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-[2rem] bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-16 md:py-20 bg-white dark:bg-dark-bg transition-colors duration-300 border-t border-gray-100 dark:border-gray-900" id="capabilities">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">
                        {headings?.category_grid_eyebrow || 'Apparel Sourcing & Manufacturing Lines'}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white font-heading tracking-tight">
                        {headings?.category_grid_heading || 'Our Manufacturing Capabilities'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-3 max-w-2xl mx-auto">
                        Explore our core garment sourcing and manufacturing capabilities across circular knit, woven, and denim factories in Bangladesh.
                    </p>
                    <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((cat, idx) => {
                        const style = getCategoryStyle(cat.name);
                        const hasImage = cat.image && cat.image.trim() !== '' && !cat.image.includes('placeholder');

                        return (
                            <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block border border-gray-100 dark:border-gray-800"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {hasImage ? (
                                    <Image
                                        src={cat.image!}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        unoptimized
                                    />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500`}>
                                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                                            {style.icon}
                                        </div>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black transition-all duration-300" />

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col items-start">
                                    <h3 className="text-white font-bold text-base sm:text-lg font-heading mb-1 drop-shadow-md">
                                        {cat.name}
                                    </h3>

                                    <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
                                        <span>Explore Capabilities</span>
                                        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform text-primary" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-3 bg-gray-900 dark:bg-dark-surface hover:bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md group"
                    >
                        View Full Manufacturing Catalog
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
