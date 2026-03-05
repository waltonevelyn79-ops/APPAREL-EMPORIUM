'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type MegaMenuColumn = {
    title: string;
    image?: string;
    links: { label: string; url: string }[];
};

interface MegaMenuProps {
    data: string | null;
    isVisible: boolean;
}

export default function MegaMenu({ data, isVisible }: MegaMenuProps) {
    if (!isVisible || !data) return null;

    let columns: MegaMenuColumn[] = [];
    try {
        columns = JSON.parse(data);
    } catch (e) {
        return null;
    }

    if (columns.length === 0) return null;

    return (
        <div className="absolute left-0 top-full w-full bg-white dark:bg-dark-surface shadow-2xl border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300 z-50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-wrap md:flex-nowrap gap-8 lg:gap-12 justify-between">
                    {columns.map((col, idx) => (
                        <div key={idx} className="flex-1 min-w-[200px]">
                            {col.image && (
                                <div className="mb-4 relative w-full aspect-video rounded-lg overflow-hidden group">
                                    <Image
                                        src={col.image}
                                        alt={col.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                </div>
                            )}
                            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 flex justify-between items-center group cursor-pointer">
                                {col.title}
                            </h4>
                            <ul className="space-y-3">
                                {col.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link
                                            href={link.url}
                                            className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium flex items-center group whitespace-nowrap"
                                        >
                                            <span className="w-0 h-0.5 bg-primary group-hover:w-2 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
