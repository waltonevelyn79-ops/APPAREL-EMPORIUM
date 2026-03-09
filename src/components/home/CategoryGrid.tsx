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
    "men's fashion": { gradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]', icon: <Shirt size={56} className="text-white/90" /> },
    "women's fashion": { gradient: 'from-[#4C0519] via-[#881337] to-[#BE123C]', icon: <ShoppingBag size={56} className="text-white/90" /> },
    "children's fashion": { gradient: 'from-[#064E3B] via-[#065F46] to-[#0D9488]', icon: <Baby size={56} className="text-white/90" /> },
    "home textiles": { gradient: 'from-[#713F12] via-[#854D0E] to-[#A16207]', icon: <Home size={56} className="text-white/90" /> },
    "footwear & accessories": { gradient: 'from-[#2E1065] via-[#4C1D95] to-[#6D28D9]', icon: <Star size={56} className="text-white/90" /> },
};

function getCategoryStyle(name: string) {
    const key = name.toLowerCase();
    for (const [pattern, style] of Object.entries(categoryStyles)) {
        if (key.includes(pattern.split(' ')[0])) return style;
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
        <section className="py-24 bg-white dark:bg-dark-bg transition-colors duration-300 border-t border-gray-100 dark:border-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">
                        {headings?.category_grid_eyebrow || 'Premium Collections'}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white font-heading tracking-tighter">
                        {headings?.category_grid_heading || 'Shop By'} <span className="text-primary">{headings?.category_grid_heading ? '' : 'Category'}</span>
                    </h2>
                    <div className="w-20 h-1.5 bg-secondary mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {categories.map((cat, idx) => {
                        const style = getCategoryStyle(cat.name);
                        const hasImage = cat.image && cat.image.trim() !== '' && !cat.image.includes('placeholder');

                        return (
                            <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 block border border-gray-100 dark:border-gray-800"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                {hasImage ? (
                                    <Image
                                        src={cat.image!}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                                        unoptimized
                                    />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700`}>
                                        <div className="relative">
                                            {/* Decorative glow */}
                                            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse" />
                                            <div className="relative p-8 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
                                                {style.icon}
                                            </div>
                                        </div>

                                        {/* Abstract geometric patterns */}
                                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                                        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-black transition-all duration-500" />

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-white font-black text-xl md:text-2xl font-heading mb-2 drop-shadow-lg uppercase tracking-tight">
                                        {cat.name}
                                    </h3>

                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{cat._count?.products || 0} Products</span>
                                        <div className="w-8 h-1 bg-primary rounded-full" />
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-center mt-20">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-4 bg-gray-50 dark:bg-dark-surface hover:bg-primary text-gray-900 dark:text-white hover:text-white px-10 py-5 rounded-full font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-primary/20 group"
                    >
                        Explore All Collections
                        <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
