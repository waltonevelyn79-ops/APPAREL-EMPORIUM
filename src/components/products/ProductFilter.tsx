'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, Check, Loader2, X, Filter, FolderTree, Tag } from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    parent?: { name: string };
    children?: CategoryItem[];
    _count?: { products: number };
}

interface ProductFilterProps {
    categories: CategoryItem[];
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
    const [selectedFabrics, setSelectedFabrics] = useState<string[]>(searchParams.get('fabric')?.split(',').filter(Boolean) || []);
    const [selectedMOQs, setSelectedMOQs] = useState<string[]>(searchParams.get('moq')?.split(',').filter(Boolean) || []);

    // Category tree & expansion states
    const [categorySearch, setCategorySearch] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

    const FABRIC_OPTIONS = ['Cotton', 'Polyester', 'Denim', 'Linen', 'Silk', 'Viscose', 'Jersey', 'Fleece'];
    const MOQ_OPTIONS = ['< 100', '100-500', '500-1000', '1000+'];

    // Sync from URL
    useEffect(() => {
        setSelectedCategory(searchParams.get('category') || '');
        setSelectedFabrics(searchParams.get('fabric')?.split(',').filter(Boolean) || []);
        setSelectedMOQs(searchParams.get('moq')?.split(',').filter(Boolean) || []);
        setSearch(searchParams.get('q') || '');
    }, [searchParams]);

    // Build parent-child tree from categories list
    const { rootCategories, flatFilteredCategories, activeCategoryName } = useMemo(() => {
        const catMap = new Map<string, CategoryItem>();
        categories.forEach(c => catMap.set(c.id, { ...c, children: [] }));

        const roots: CategoryItem[] = [];
        categories.forEach(c => {
            if (c.parentId && catMap.has(c.parentId)) {
                catMap.get(c.parentId)!.children!.push(catMap.get(c.id)!);
            } else if (!c.parentId) {
                roots.push(catMap.get(c.id)!);
            }
        });

        // Filtered list if category search term is typed
        let filtered = categories;
        if (categorySearch.trim()) {
            const query = categorySearch.toLowerCase();
            filtered = categories.filter(c => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query));
        }

        const activeCat = categories.find(c => c.slug === selectedCategory);

        return {
            rootCategories: roots.length > 0 ? roots : categories,
            flatFilteredCategories: filtered,
            activeCategoryName: activeCat?.name || ''
        };
    }, [categories, categorySearch, selectedCategory]);

    // Autocomplete logic for global search
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

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyFilters = (newCategory?: string, newFabrics?: string[], newMOQs?: string[], newSearch?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        const cat = newCategory !== undefined ? newCategory : selectedCategory;
        const fab = newFabrics !== undefined ? newFabrics : selectedFabrics;
        const moq = newMOQs !== undefined ? newMOQs : selectedMOQs;
        const q = newSearch !== undefined ? newSearch : search;

        if (q) params.set('q', q); else params.delete('q');
        if (cat) params.set('category', cat); else params.delete('category');
        if (fab.length) params.set('fabric', fab.join(',')); else params.delete('fabric');
        if (moq.length) params.set('moq', moq.join(',')); else params.delete('moq');

        params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    };

    const handleCategorySelect = (slug: string) => {
        setSelectedCategory(slug);
        applyFilters(slug);
    };

    const toggleFilter = (list: string[], setList: (v: string[]) => void, item: string, type: 'fabric' | 'moq') => {
        let updated: string[];
        if (list.includes(item)) {
            updated = list.filter(i => i !== item);
        } else {
            updated = [...list, item];
        }
        setList(updated);
        if (type === 'fabric') applyFilters(undefined, updated);
        if (type === 'moq') applyFilters(undefined, undefined, updated);
    };

    const clearAll = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedFabrics([]);
        setSelectedMOQs([]);
        setCategorySearch('');
        router.push('/products');
    };

    const toggleParent = (id: string) => {
        setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Category display slicing (Amazon style)
    const displayedCategories = categorySearch.trim()
        ? flatFilteredCategories
        : isExpanded
            ? rootCategories
            : rootCategories.slice(0, 5);

    const hasActiveFilters = !!selectedCategory || selectedFabrics.length > 0 || selectedMOQs.length > 0 || !!search;

    return (
        <div className="bg-white dark:bg-dark-surface p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24 space-y-7 max-w-full overflow-hidden">
            {/* Header & Clear */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-primary" />
                    <h2 className="text-lg font-black font-heading text-gray-900 dark:text-white uppercase tracking-tight">Sourcing Filters</h2>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-xs font-black text-primary hover:underline uppercase tracking-wider transition-colors px-2 py-1 rounded"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Smart Search with Autocomplete */}
            <div className="relative group" ref={dropdownRef}>
                <label htmlFor="product-search-input" className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">
                    Smart Sourcing Search
                </label>
                <div className="relative">
                    <input
                        id="product-search-input"
                        type="text"
                        value={search}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters(undefined, undefined, undefined, search)}
                        placeholder="Search fabrics, items, SKU..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-primary focus:ring-2 focus:ring-primary outline-none transition-all text-gray-900 dark:text-white text-xs font-medium"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                    {isSearching && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            <Loader2 size={14} className="animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-1">
                        <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                            {suggestions.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/products/${p.slug}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    <div className="w-9 h-9 rounded border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0 bg-white">
                                        <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{p.name}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{p.category?.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                            <button
                                onClick={() => { applyFilters(undefined, undefined, undefined, search); setShowSuggestions(false); }}
                                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                            >
                                View all matching items
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Amazon-Style Smart Category Filter ────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                        Department &amp; Category
                    </label>
                    {selectedCategory && (
                        <button
                            onClick={() => handleCategorySelect('')}
                            className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                        >
                            <X size={10} /> Clear
                        </button>
                    )}
                </div>

                {/* Selected Active Category Badge */}
                {selectedCategory && (
                    <div className="flex items-center justify-between p-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-bold text-xs">
                        <span className="truncate flex items-center gap-1.5">
                            <Tag size={13} className="shrink-0" />
                            <span className="truncate">{activeCategoryName || selectedCategory}</span>
                        </span>
                        <button
                            onClick={() => handleCategorySelect('')}
                            className="hover:bg-primary/20 p-1 rounded-md transition-colors shrink-0"
                            title="Remove category filter"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}

                {/* In-category quick search if more than 6 categories exist */}
                {categories.length > 6 && (
                    <div className="relative">
                        <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Filter categories..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 text-[11px] text-gray-800 dark:text-gray-200 outline-none focus:border-primary"
                        />
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        {categorySearch && (
                            <button
                                onClick={() => setCategorySearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                )}

                {/* Categories List (Tree or Flat search results) */}
                <div className="space-y-1.5 pt-1">
                    {/* All Categories Option */}
                    {!categorySearch && (
                        <button
                            onClick={() => handleCategorySelect('')}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${selectedCategory === ''
                                ? 'bg-primary text-white font-bold shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span>All Categories</span>
                            {selectedCategory === '' && <Check size={14} />}
                        </button>
                    )}

                    {/* Category Items */}
                    {displayedCategories.map((cat) => {
                        const isSelected = selectedCategory === cat.slug;
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isParentExpanded = expandedParents[cat.id];

                        return (
                            <div key={cat.id} className="space-y-1">
                                <div className="flex items-center gap-1 group">
                                    <button
                                        onClick={() => handleCategorySelect(cat.slug)}
                                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${isSelected
                                            ? 'bg-primary text-white font-bold shadow-sm'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        {isSelected && <Check size={14} className="shrink-0" />}
                                    </button>

                                    {/* Expand Subcategories Toggle */}
                                    {hasChildren && (
                                        <button
                                            type="button"
                                            onClick={() => toggleParent(cat.id)}
                                            className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            title="Toggle subcategories"
                                        >
                                            {isParentExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                    )}
                                </div>

                                {/* Child Categories (Sub-tree) */}
                                {hasChildren && isParentExpanded && (
                                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 ml-3">
                                        {cat.children!.map((child) => (
                                            <button
                                                key={child.id}
                                                onClick={() => handleCategorySelect(child.slug)}
                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-all text-left ${selectedCategory === child.slug
                                                    ? 'bg-primary text-white font-bold shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="truncate">{child.name}</span>
                                                {selectedCategory === child.slug && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Show More / Show Less Toggle Button (Amazon Style) */}
                {!categorySearch && rootCategories.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full pt-2 flex items-center justify-center gap-1 text-xs font-bold text-primary hover:underline transition-colors"
                    >
                        <span>{isExpanded ? 'Show Fewer Categories' : `+ Show ${rootCategories.length - 5} More Categories`}</span>
                        <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* Fabric Type (Multi-select) */}
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">
                    Fabric Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {FABRIC_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            onClick={() => toggleFilter(selectedFabrics, setSelectedFabrics, opt, 'fabric')}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${selectedFabrics.includes(opt)
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* MOQ Requirements */}
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">
                    MOQ Requirements (PCS)
                </label>
                <div className="space-y-2 px-1">
                    {MOQ_OPTIONS.map(opt => (
                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedMOQs.includes(opt)}
                                onChange={() => toggleFilter(selectedMOQs, setSelectedMOQs, opt, 'moq')}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                            />
                            <span className={`text-xs font-semibold ${selectedMOQs.includes(opt) ? 'text-primary font-bold dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white'}`}>
                                {opt}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Custom Sourcing Callout */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20 space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Custom Sourcing?</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        Need custom tech-packs or fabrics not listed? Our Dhaka merchandising team can source directly.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1">
                        Send custom inquiry <ChevronRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
