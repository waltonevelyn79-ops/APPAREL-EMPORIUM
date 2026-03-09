'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedProductsProps {
    categoryId: string;
    excludeProductId: string;
}

export default function RelatedProducts({ categoryId, excludeProductId }: RelatedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await fetch(`/api/products?category_id=${categoryId}&limit=5`);
                const data = await res.json();
                if (data.success) {
                    setProducts(data.products.filter((p: Product) => p.id !== excludeProductId));
                }
            } catch (err) {
                console.error("Failed to load related products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [categoryId, excludeProductId]);

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        </div>
    );

    if (products.length === 0) return null;

    return (
        <section className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-white">Related Products</h2>
                <div className="hidden sm:flex gap-2">
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

