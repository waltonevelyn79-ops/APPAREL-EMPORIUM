'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type MegaMenuLink = {
    label: string;
    url: string;
};

type MegaMenuSection = {
    header?: string;
    links: MegaMenuLink[];
};

type MegaMenuColumn = {
    title: string;
    sections: MegaMenuSection[];
};

interface MegaMenuProps {
    data: string | null;
    isVisible: boolean;
}

export default function MegaMenu({ data, isVisible }: MegaMenuProps) {
    if (!isVisible || !data) return null;

    let columns: MegaMenuColumn[] = [];
    try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
            columns = parsed.map(col => ({
                title: col.title,
                sections: col.sections || [{ header: '', links: col.links || [] }]
            }));
        }
    } catch (e) {
        console.error("MegaMenu Parse Error", e);
        return null;
    }

    if (columns.length === 0) return null;

    const gridClass = columns.length === 4
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6"
        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6";

    return (
        <div className="w-full bg-white/95 dark:bg-[#0B0F19]/98 backdrop-blur-2xl text-slate-800 dark:text-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-t border-slate-200 dark:border-slate-800 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 z-50 overflow-hidden max-h-[calc(100vh-90px)] overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7 lg:py-8">
                <div className={gridClass}>
                    {columns.map((col, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col space-y-4 bg-slate-50/90 dark:bg-[#111827] hover:bg-slate-100/90 dark:hover:bg-[#162032] p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-primary/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] group/card"
                        >
                            {/* Pillar Header */}
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                                <h3 className="font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider text-sm sm:text-base flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
                                    <span className="group-hover/card:text-blue-600 dark:group-hover/card:text-blue-300 transition-colors">{col.title}</span>
                                </h3>
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    Division
                                </span>
                            </div>

                            {/* Subcategories (Men's, Women's, Children's) */}
                            <div className="space-y-3.5 flex-1">
                                {col.sections.map((section, sIdx) => (
                                    <div
                                        key={sIdx}
                                        className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-primary/40 dark:hover:border-blue-400/40 transition-all duration-200 space-y-2 shadow-xs"
                                    >
                                        {section.header && (
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700/50">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 dark:bg-blue-400"></span>
                                                    {section.header}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                    {section.links.length} items
                                                </span>
                                            </h4>
                                        )}
                                        <ul className="space-y-0.5">
                                            {section.links.map((link, lIdx) => (
                                                <li key={lIdx}>
                                                    <Link
                                                        href={link.url}
                                                        className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 px-2 py-1 rounded-lg transition-all text-xs sm:text-[13px] font-medium flex items-center group/link justify-between"
                                                    >
                                                        <span className="flex items-center">
                                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500 mr-2 group-hover/link:bg-primary transition-all"></span>
                                                            <span className="group-hover/link:translate-x-0.5 transition-transform">{link.label}</span>
                                                        </span>
                                                        <ArrowRight size={11} className="opacity-0 group-hover/link:opacity-100 text-primary dark:text-blue-400 transition-opacity shrink-0 ml-1" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Department Quick Link */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                <Link
                                    href="/products"
                                    className="w-full inline-flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors tracking-wide uppercase py-1"
                                >
                                    <span>Browse All {col.title}</span>
                                    <ArrowRight size={13} className="group-hover/card:translate-x-1 transition-transform text-primary dark:text-blue-400" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aesthetic Gradient Divider */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        </div>
    );
}
