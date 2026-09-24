'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

type MenuItem = {
    id: string;
    label: string;
    url: string;
    target: string;
    parentId?: string;
};

type CategoryItem = {
    id: string;
    name: string;
    slug: string;
};

export default function Footer() {
    const { settings } = useSettings();
    const pathname = usePathname();

    if (pathname?.startsWith('/executive-portal-aelbd')) return null;

    const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    // Fallbacks if menus fail to load
    const DEFAULT_LINKS = [
        { id: '1', label: 'About Us', url: '/about', target: '_self' },
        { id: '2', label: 'Company Heritage', url: '/about', target: '_self' },
        { id: '3', label: 'Careers', url: '/careers', target: '_self' },
        { id: '4', label: 'Our Factories', url: '/factories', target: '_self' },
        { id: '5', label: 'Contact', url: '/contact', target: '_self' }
    ];

    useEffect(() => {
        // Fetch Footer Menus
        fetch('/api/menus?location=footer')
            .then(res => res.ok ? res.json() : null)
            .then(data => data && data.success && setFooterMenus(data.flat.filter((m: any) => m.active)))
            .catch(() => { });

        // Fetch Categories for dynamic column
        fetch('/api/categories')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data)) {
                    setCategories(data.slice(0, 5)); // Take top 5
                }
            })
            .catch(() => { /* Silent fail for categories */ });
    }, []);

    const linksToRender = footerMenus.length > 0 ? footerMenus.filter(m => !m.parentId) : DEFAULT_LINKS;
    const year = new Date().getFullYear();
    const companyName = settings.company_name || 'Apparel Emporium Ltd.';

    return (
        <footer className="bg-[#151922] dark:bg-[#080B11] text-slate-300 pt-16 pb-12 border-t border-slate-800/80 dark:border-white/5 transition-colors duration-500">
            <div className="max-w-4xl mx-auto px-6">
                {/* 3 Columns matching mockup: Company, Sourcing, Support */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16 text-center sm:text-left mb-14">
                    {/* Column 1: Company */}
                    <div className="space-y-3">
                        <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Company</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/about" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/contact" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/careers" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Sourcing */}
                    <div className="space-y-3">
                        <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Sourcing</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/products?category=knitwear" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Knitwear</Link></li>
                            <li><Link href="/products?category=woven" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Woven Wear</Link></li>
                            <li><Link href="/products?category=sweater" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Outerwear</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div className="space-y-3">
                        <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Support</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/faqs" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link href="/terms" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Terms</Link></li>
                            <li><Link href="/privacy-policy" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Centered Copyright Strip */}
                <div className="pt-8 border-t border-slate-800/80 dark:border-white/5 text-center">
                    <p className="text-xs text-slate-400 tracking-wide">
                        All Rights Reserved, {companyName} {year}
                    </p>
                </div>
            </div>
        </footer>
    );
}

