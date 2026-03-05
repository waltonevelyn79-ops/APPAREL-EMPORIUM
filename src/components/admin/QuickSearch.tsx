'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Command, Search, FileText, Settings, ShoppingBag, X } from 'lucide-react';

const ADMIN_PAGES = [
    { name: 'Dashboard', url: '/admin', icon: <Command className="w-4 h-4" /> },
    { name: 'Settings', url: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
    { name: 'User Management', url: '/admin/users', icon: <Settings className="w-4 h-4" /> },
    { name: 'Products', url: '/admin/products', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Categories', url: '/admin/categories', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Custom Forms', url: '/admin/forms', icon: <FileText className="w-4 h-4" /> },
    { name: 'Performance Dashboard', url: '/admin/performance', icon: <Command className="w-4 h-4" /> }
];

export default function QuickSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Mocking products/blogs search since we are entirely client side for this demo modal
    // In production we'd debounce a fetch to `/api/search`
    const filteredPages = ADMIN_PAGES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

    // Total results
    const results = [...filteredPages];

    useEffect(() => {
        const toggleSearch = () => setIsOpen(prev => !prev);
        const closeModals = () => setIsOpen(false);

        window.addEventListener('admin-quick-search-toggle', toggleSearch);
        window.addEventListener('admin-close-modals', closeModals);

        return () => {
            window.removeEventListener('admin-quick-search-toggle', toggleSearch);
            window.removeEventListener('admin-close-modals', closeModals);
        };
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelectedIdx(0);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIdx]) {
            e.preventDefault();
            router.push(results[selectedIdx].url);
            setIsOpen(false);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-10 duration-200">
                <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products, blog posts, or admin pages..."
                        className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white text-lg placeholder-gray-400"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md text-xs font-bold font-mono">
                        ESC
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((res, idx) => (
                                <button
                                    key={res.url}
                                    onClick={() => { router.push(res.url); setIsOpen(false); }}
                                    onMouseEnter={() => setSelectedIdx(idx)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl transition-colors ${selectedIdx === idx ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <span className={selectedIdx === idx ? 'text-white/80' : 'text-gray-400'}>{res.icon}</span>
                                    <span className="font-medium">{res.name}</span>
                                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${selectedIdx === idx ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        Admin Page
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No matching results found for "{query}".
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
