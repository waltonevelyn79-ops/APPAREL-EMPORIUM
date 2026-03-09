'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Star } from 'lucide-react';
import { extractFeaturedImage } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    featuredImage: string;
    images: string; // JSON string of image URLs or {url, alt} objects
    priceRange: string;
    category: { name: string, slug: string };
    _count?: { reviews: number };
}

export default function FeaturedProducts({ headings }: { headings?: { featured_products_eyebrow?: string; featured_products_heading?: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/products?featured=true')
            .then(res => res.json())
            .then(data => {
                if (data.products) setProducts(data.products);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === 'left' ? -cwd() : cwd();
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const cwd = () => {
        if (!scrollRef.current) return 300;
        return scrollRef.current.offsetWidth / 2; // Scroll half container width
    };

    if (loading || products.length === 0) return null;

    return (
        <section className="py-24 bg-white dark:bg-dark-bg transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

                <div className="flex justify-between items-end mb-12">
                    <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                        <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block flex items-center gap-2">
                            <Star size={16} className="fill-secondary" /> {headings?.featured_products_eyebrow || 'Premium Quality'}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-heading">
                            {headings?.featured_products_heading || 'Featured Products'}
                        </h2>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex gap-3">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-primary hover:border-primary dark:hover:border-primary transition-all hover:shadow-md"
                            aria-label="Previous Products"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-primary hover:border-primary dark:hover:border-primary transition-all hover:shadow-md"
                            aria-label="Next Products"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product, idx) => (
                        <div
                            key={product.id}
                            className="flex-none w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start group bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                <Link href={`/products/${product.slug}`}>
                                    <Image
                                        src={extractFeaturedImage(product.images)}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        unoptimized
                                    />
                                </Link>

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow">
                                        Featured
                                    </span>
                                </div>

                                {/* Quick Action Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-3">
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="bg-white hover:bg-primary hover:text-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <Link
                                        href={`/products?category=${product.category?.slug}`}
                                        className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-wider"
                                    >
                                        {product.category?.name || 'Uncategorized'}
                                    </Link>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight font-heading hover:text-primary transition-colors line-clamp-2 flex-1">
                                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                </h3>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="font-bold text-xl text-primary">
                                        {product.priceRange ? (product.priceRange.includes('$') ? product.priceRange : `$${product.priceRange}`) : '$0.00'}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-yellow-500 font-bold">
                                        <Star size={14} className="fill-yellow-500" />
                                        <span>4.9</span>
                                        <span className="text-gray-400 text-xs font-normal">({product._count?.reviews || 0})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

