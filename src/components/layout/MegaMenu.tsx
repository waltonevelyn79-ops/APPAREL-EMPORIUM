'use client';

import React from 'react';
import Link from 'next/link';

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

    return (
        <div className="w-full bg-[#0F172A] text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-white/5 animate-in slide-in-from-top-1 duration-500 z-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-10 py-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
                    {columns.map((col, idx) => (
                        <div key={idx} className="flex flex-col space-y-10">
                            <h3 className="font-black text-primary uppercase tracking-[0.25em] text-[12px] border-b border-white/10 pb-5">
                                {col.title}
                            </h3>

                            <div className="space-y-10">
                                {col.sections.map((section, sIdx) => (
                                    <div key={sIdx} className="space-y-5">
                                        {section.header && (
                                            <h4 className="font-extrabold text-gray-200 uppercase tracking-tighter text-[11px] opacity-60">
                                                {section.header}
                                            </h4>
                                        )}
                                        <ul className="space-y-3.5">
                                            {section.links.map((link, lIdx) => (
                                                <li key={lIdx}>
                                                    <Link
                                                        href={link.url}
                                                        className="text-gray-400 hover:text-white transition-all text-[13px] font-bold flex items-center group"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/20 mr-3 group-hover:bg-primary group-hover:scale-125 transition-all"></span>
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aesthetic Detail */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50"></div>
        </div>
    );
}

