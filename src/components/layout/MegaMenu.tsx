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
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8"
        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8";

    return (
        <div className="w-full bg-white/95 dark:bg-[#0B0F19]/98 backdrop-blur-2xl text-slate-800 dark:text-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border-t border-slate-200 dark:border-white/10 border-b border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2 duration-300 z-50 overflow-hidden max-h-[calc(100vh-90px)] overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">
                <div className={gridClass}>
                    {columns.map((col, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col space-y-6 bg-slate-50/80 dark:bg-white/[0.02] hover:bg-slate-100/80 dark:hover:bg-white/[0.04] p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300 shadow-sm group/card"
                        >
                            <h3 className="font-black text-primary uppercase tracking-[0.16em] text-sm border-b border-slate-200 dark:border-white/10 pb-3 flex items-center justify-between">
                                <span className="group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">{col.title}</span>
                                <span className="w-2 h-2 rounded-full bg-primary/40 group-hover/card:bg-primary transition-all"></span>
                            </h3>

                            <div className="space-y-6 flex-1">
                                {col.sections.map((section, sIdx) => (
                                    <div key={sIdx} className="space-y-2.5">
                                        {section.header && (
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                                {section.header}
                                            </h4>
                                        )}
                                        <ul className="space-y-1.5 pl-1.5">
                                            {section.links.map((link, lIdx) => (
                                                <li key={lIdx}>
                                                    <Link
                                                        href={link.url}
                                                        className="text-slate-700 dark:text-gray-200 hover:text-primary dark:hover:text-white hover:translate-x-1.5 transition-all duration-200 text-sm font-medium flex items-center group/link py-0.5"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-gray-500 mr-2.5 group-hover/link:bg-primary group-hover/link:scale-125 transition-all"></span>
                                                        <span className="group-hover/link:text-primary dark:group-hover/link:text-white transition-colors">{link.label}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Department Quick Link */}
                            <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors tracking-wide uppercase"
                                >
                                    <span>Browse All</span>
                                    <ArrowRight size={12} className="group-hover/card:translate-x-1 transition-transform text-primary" />
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
