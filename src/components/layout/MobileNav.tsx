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
                <div key={idx} className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 space-y-3">
                    <h5 className="text-xs font-extrabold text-primary dark:text-blue-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(37,99,235,0.8)]"></span>
                            {col.title}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Pillar
                        </span>
                    </h5>
                    {col.sections && col.sections.length > 0 ? (
                        <div className="space-y-2.5">
                            {col.sections.map((sec: any, sIdx: number) => (
                                <div key={sIdx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                                    {sec.header && (
                                        <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide block pb-1 border-b border-slate-100 dark:border-slate-700/50">
                                            {sec.header}
                                        </span>
                                    )}
                                    <ul className="space-y-0.5 pt-0.5">
                                        {sec.links?.map((link: any, lIdx: number) => (
                                            <li key={lIdx}>
                                                <Link
                                                    href={link.url}
                                                    onClick={onClose}
                                                    className="text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded block transition-colors"
                                                >
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {col.links?.map((link: any, lIdx: number) => (
                                <li key={lIdx}>
                                    <Link
                                        href={link.url}
                                        onClick={onClose}
                                        className="text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 py-1 rounded block transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
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
                            aria-label={`Toggle ${item.label} submenu`}
                            className="p-2 ml-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:text-primary transition"
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
                aria-hidden="true"
            ></div>

            {/* Slider Sheet */}
            <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-dark-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-gray-800 overflow-hidden">

                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
                    <span className="font-extrabold text-xl tracking-tight text-primary">Menu</span>
                    <button
                        onClick={onClose}
                        aria-label="Close Menu"
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-700 dark:text-gray-300 hover:text-red-500 hover:rotate-90 transition-all duration-300"
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

