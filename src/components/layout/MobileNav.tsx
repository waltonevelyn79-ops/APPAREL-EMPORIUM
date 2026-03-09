'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, ChevronRight } from 'lucide-react';

type MenuItem = {
    id: string;
    label: string;
    url: string;
    target: string;
    isMegaMenu: boolean;
    megaMenuData: string | null;
    children?: MenuItem[];
};

interface MobileNavProps {
    menus: MenuItem[];
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileNav({ menus, isOpen, onClose }: MobileNavProps) {
    const pathname = usePathname();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const renderMegaMenuItems = (dataStr: string | null) => {
        if (!dataStr) return null;
        try {
            const columns = JSON.parse(dataStr);
            return columns.map((col: any, idx: number) => (
                <div key={idx} className="mb-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{col.title}</h5>
                    <ul className="space-y-3">
                        {col.links.map((link: any, lIdx: number) => (
                            <li key={lIdx}>
                                <Link
                                    href={link.url}
                                    onClick={onClose}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors block py-1"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ));
        } catch { return null; }
    };

    const renderItem = (item: MenuItem, depth = 0) => {
        const isExpanded = expandedIds.has(item.id);
        const hasChildren = item.children && item.children.length > 0;
        const hasMegaMenu = item.isMegaMenu && item.megaMenuData;
        const isActive = pathname === item.url || (pathname.startsWith(item.url) && item.url !== '/');

        return (
            <div key={item.id} className="w-full">
                <div className={`flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800 transition-colors ${isActive ? 'text-primary border-primary/20' : 'text-gray-900 dark:text-white hover:text-primary'}`}>
                    <Link
                        href={item.url}
                        target={item.target}
                        onClick={() => { if (!hasChildren && !hasMegaMenu) onClose(); }}
                        className={`font-semibold text-lg flex-1 ${depth > 0 ? 'text-base font-medium text-gray-700 dark:text-gray-300' : ''}`}
                    >
                        {item.label}
                    </Link>

                    {(hasChildren || hasMegaMenu) && (
                        <button
                            onClick={(e) => toggleExpand(e, item.id)}
                            className="p-2 ml-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-500 hover:text-primary transition"
                        >
                            <ChevronRight size={20} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    )}
                </div>

                {isExpanded && hasChildren && !hasMegaMenu && (
                    <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 mt-2 mb-4 space-y-1 animate-in slide-in-from-top-4 duration-200">
                        {item.children!.map((child) => renderItem(child, depth + 1))}
                    </div>
                )}

                {isExpanded && hasMegaMenu && (
                    <div className="pl-2 mt-4 space-y-6 animate-in slide-in-from-top-4 duration-200 fade-in">
                        {renderMegaMenuItems(item.megaMenuData)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Slider Sheet */}
            <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-dark-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-gray-800 overflow-hidden">

                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
                    <span className="font-extrabold text-xl tracking-tight text-primary">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-red-500 hover:rotate-90 transition-all duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    {menus.map((item) => renderItem(item, 0))}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg space-y-4">
                    <Link
                        href="/contact"
                        onClick={onClose}
                        className="block w-full text-center bg-primary text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
                    >
                        Get a Quote
                    </Link>
                </div>
            </div>
        </div>
    );
}

