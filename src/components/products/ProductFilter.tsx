'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilter({ categories }: { categories: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [search, setSearch] = useState(searchParams.get('q') || '');

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (search) params.set('q', search);

        router.push(`/products?${params.toString()}`);
    };

    // Trigger search when typing stops (debounce)
    useEffect(() => {
        const delay = setTimeout(() => {
            handleFilter();
        }, 500);
        return () => clearTimeout(delay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, selectedCategory]);

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
            <h3 className="text-lg font-bold mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                Filters
            </h3>

            {/* Search */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Search
                </label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none"
                />
            </div>

            {/* Categories */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Categories
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedCategory === ''}
                            onChange={() => setSelectedCategory('')}
                        />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">All Categories</span>
                    </label>
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={selectedCategory === cat.slug}
                                onChange={() => setSelectedCategory(cat.slug)}
                            />
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
