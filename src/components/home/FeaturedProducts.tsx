'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, MessageSquare, PlusCircle } from 'lucide-react';
import { extractFeaturedImage } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    images: string;
    priceRange?: string;
    category?: { name: string; slug: string };
}

// Fallback 3D sample products matching the user's mockup exactly
const MOCKUP_3D_PRODUCTS: Product[] = [
    {
        id: '3d-prod-1',
        name: 'Pique Polo',
        slug: 'classic-pique-polo',
        description: 'Premium combed cotton pique knit polo shirt with ribbed collar.',
        images: JSON.stringify(['/images/3d/knit_polo.jpg']),
        category: { name: 'Knitwear', slug: 'knitwear' }
    },
    {
        id: '3d-prod-2',
        name: 'Classic T-shirt',
        slug: 'classic-t-shirt',
        description: 'Ultra-soft 100% organic ring-spun cotton crewneck t-shirt.',
        images: JSON.stringify(['/images/3d/white_tshirt.jpg']),
        category: { name: 'Knitwear', slug: 'knitwear' }
    },
    {
        id: '3d-prod-3',
        name: 'Denim Jacket',
        slug: 'denim-jacket',
        description: 'Heavyweight 12.5 oz authentic indigo selvedge denim trucker jacket.',
        images: JSON.stringify(['/images/3d/denim_jacket.jpg']),
        category: { name: 'Woven', slug: 'woven' }
    },
    {
        id: '3d-prod-4',
        name: 'Leather Boots',
        slug: 'leather-boots',
        description: 'Full-grain oiled pull-up leather utility boots with Goodyear welt.',
        images: JSON.stringify(['/images/3d/leather_boots.jpg']),
        category: { name: 'Accessories', slug: 'accessories' }
    }
];

export default function FeaturedProducts({ headings }: { headings?: { featured_products_eyebrow?: string; featured_products_heading?: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products?featured=true')
            .then(res => res.json())
            .then(data => {
                if (data.products && data.products.length >= 4) {
                    setProducts(data.products.slice(0, 8));
                } else if (data.products && data.products.length > 0) {
                    // Combine with mockup products to fill out the 3D grid
                    const combined = [...data.products];
                    for (const mp of MOCKUP_3D_PRODUCTS) {
                        if (!combined.some(p => p.slug === mp.slug)) {
                            combined.push(mp);
                        }
                    }
                    setProducts(combined.slice(0, 8));
                } else {
                    setProducts(MOCKUP_3D_PRODUCTS);
                }
            })
            .catch(() => setProducts(MOCKUP_3D_PRODUCTS))
            .finally(() => setLoading(false));
    }, []);

    const displayList = products.length > 0 ? products : MOCKUP_3D_PRODUCTS;

    return (
        <section className="py-20 sm:py-24 bg-[#FAF7F2] dark:bg-[#0B0F19] transition-colors duration-500 border-t border-slate-200/60 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Section Title matching mockup */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-primary dark:text-blue-400 border border-blue-500/20 mb-3 shadow-xs">
                        <Sparkles size={12} />
                        {headings?.featured_products_eyebrow || 'Export Sourcing Showcase'}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-heading">
                        {headings?.featured_products_heading || 'Featured Products'}
                    </h2>
                </div>

                {/* 3D Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {displayList.map((product, idx) => {
                        const imgUrl = extractFeaturedImage(product.images);
                        const productNumber = String(idx + 1).padStart(2, '0');

                        return (
                            <div
                                key={product.id || idx}
                                className="group flex flex-col p-4 rounded-3xl transition-all duration-400 
                                bg-white dark:bg-[#161E2E] 
                                border border-[#EBE4D8] dark:border-white/5 
                                shadow-sm hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)]
                                hover:-translate-y-2 hover:border-primary/40 dark:hover:border-blue-400/30"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Recessed 3D Product Canvas */}
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-3 bg-[#F1ECE1] dark:bg-[#101623] border border-[#E5DEC8] dark:border-white/[0.03] transition-colors"
                                >
                                    <Image
                                        src={imgUrl}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-108 group-hover:-translate-y-1 drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
                                        unoptimized
                                    />
                                </Link>

                                {/* Product Info */}
                                <div className="space-y-1 mb-5 flex-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 block">
                                        Product {productNumber}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                                        <Link href={`/products/${product.slug}`}>
                                            {product.name}
                                        </Link>
                                    </h3>
                                </div>

                                {/* Dual 3D Buttons */}
                                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                    <Link
                                        href={`/request-quote?product=${encodeURIComponent(product.name)}`}
                                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all duration-200 active:scale-95 shadow-sm
                                        bg-[#2D2A26] hover:bg-black text-white
                                        dark:bg-[#94A3B8] dark:hover:bg-white dark:text-slate-900"
                                    >
                                        Add to Quote
                                    </Link>

                                    <Link
                                        href={`/contact?subject=Inquiry%20about%20${encodeURIComponent(product.name)}`}
                                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all duration-200 active:scale-95
                                        bg-white hover:bg-[#F6F2EB] text-[#2D2A26] border border-[#DCD5C9]
                                        dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700/70"
                                    >
                                        Contact Supplier
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View Full Catalog Link */}
                <div className="text-center mt-12 sm:mt-16">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95
                        bg-slate-900 hover:bg-blue-600 text-white
                        dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
                    >
                        <span>Explore Complete Export Catalog</span>
                        <span>&rarr;</span>
                    </Link>
                </div>

            </div>
        </section>
    );
}
