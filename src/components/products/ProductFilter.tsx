'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, Check, Loader2, X } from 'lucide-react';
import Link from 'next/link';

interface ProductFilterProps {
    categories: any[];
}

export default function ProductFilter({ categories }: ProductFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedFabrics, setSelectedFabrics] = useState<string[]>(searchParams.get('fabric')?.split(',') || []);
    const [selectedMOQs, setSelectedMOQs] = useState<string[]>(searchParams.get('moq')?.split(',') || []);

    const FABRIC_OPTIONS = ['Cotton', 'Polyester', 'Denim', 'Linen', 'Silk', 'Viscose', 'Jersey', 'Fleece'];
    const MOQ_OPTIONS = ['< 100', '100-500', '500-1000', '1000+'];

    // Autocomplete logic
    useEffect(() => {
        if (search.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(search)}`);
                const data = await res.json();
                if (data.success) setSuggestions(data.products);
            } catch (e) { } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (search) params.set('q', search); else params.delete('q');
        if (selectedCategory) params.set('category', selectedCategory); else params.delete('category');
        if (selectedFabrics.length) params.set('fabric', selectedFabrics.join(',')); else params.delete('fabric');
        if (selectedMOQs.length) params.set('moq', selectedMOQs.join(',')); else params.delete('moq');

        params.set('page', '1'); // Reset pagination on filter
        router.push(`/products?${params.toString()}`);
    };

    const toggleFilter = (list: string[], setList: (v: string[]) => void, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const clearAll = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedFabrics([]);
        setSelectedMOQs([]);
        router.push('/products');
    };

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Filters</h3>
                <button onClick={clearAll} className="text-xs font-bold text-primary hover:text-secondary uppercase tracking-wider transition-colors">Clear All</button>
            </div>

            {/* Smart Search with Autocomplete */}
            <div className="relative group" ref={dropdownRef}>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Smart Sourcing Search</label>
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                        placeholder="Search fabrics, items, SKU..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-primary focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium shadow-sm"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    {isSearching && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-1">
                        <div className="p-2 space-y-1">
                            {suggestions.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/products/${p.slug}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    <div className="w-10 h-10 rounded border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0 bg-white">
                                        <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{p.name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{p.category?.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                            <button
                                onClick={() => { applyFilters(); setShowSuggestions(false); }}
                                className="text-xs font-bold text-primary hover:text-secondary uppercase tracking-widest"
                            >
                                See all matching items
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Category selection (Radio) */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Manufacturer Category</label>
                <div className="space-y-3">
                    <button
                        onClick={() => { setSelectedCategory(''); applyFilters(); }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedCategory === '' ? 'bg-primary/5 border-primary text-primary font-bold' : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'}`}
                    >
                        <span>All Categories</span>
                        {selectedCategory === '' && <Check size={16} />}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.slug); applyFilters(); }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedCategory === cat.slug ? 'bg-primary/5 border-primary text-primary font-bold' : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            <span className="truncate pr-2">{cat.name}</span>
                            {selectedCategory === cat.slug && <Check size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fabric (Multi-select) */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Fabric Type</label>
                <div className="flex flex-wrap gap-2">
                    {FABRIC_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            onClick={() => { toggleFilter(selectedFabrics, setSelectedFabrics, opt); setTimeout(applyFilters, 10); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedFabrics.includes(opt) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* MOQ (Checkboxes) */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">MOQ Requirements (PCS)</label>
                <div className="space-y-3 px-1">
                    {MOQ_OPTIONS.map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedMOQs.includes(opt)}
                                onChange={() => { toggleFilter(selectedMOQs, setSelectedMOQs, opt); setTimeout(applyFilters, 10); }}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                            />
                            <span className={`text-sm font-medium ${selectedMOQs.includes(opt) ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price/Budget Alert (Bonus) */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
                    <h4 className="text-sm font-bold text-primary mb-1">Custom Sourcing?</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">If you don't find what you need, our team can source it for you from our partner factories.</p>
                    <Link href="/contact" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        Send custom inquiry <ChevronDown size={12} className="-rotate-90" />
                    </Link>
                </div>
            </div>

        </div>
    );
}

