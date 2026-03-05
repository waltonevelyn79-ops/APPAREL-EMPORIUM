'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    _count?: {
        products: number;
    }
}

export default function CategoryGrid() {
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

    if (loading) return null; // Or a skeleton
    if (categories.length === 0) return null;

    return (
        <section className="py-20 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Collections</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-heading">
                        Shop By Category
                    </h2>
                    <div className="w-24 h-1 bg-secondary mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {categories.map((cat, idx) => (
                        <Link
                            key={cat.id}
                            href={`/products?category=${cat.slug}`}
                            className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white dark:bg-dark-surface shadow-md hover:shadow-xl transition-all duration-300 block"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <Image
                                src={cat.image || '/placeholder-category.jpg'}
                                alt={cat.name}
                                fill
                                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                unoptimized
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:opacity-90 transition-opacity duration-300" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-xl md:text-2xl font-heading transform group-hover:-translate-y-2 transition-transform duration-300 inline-block">
                                    {cat.name}
                                </h3>

                                <div className="flex items-center justify-between mt-2 overflow-hidden h-0 group-hover:h-6 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                                    <p className="text-gray-300 text-sm font-medium">
                                        {cat._count?.products || 0} Products
                                    </p>
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/products"
                        className="inline-flex items-center text-primary font-bold text-lg group hover:text-black dark:hover:text-white transition-colors"
                    >
                        View All Collections
                        <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
