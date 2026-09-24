'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Menu, X, ChevronDown, User, ShieldCheck } from 'lucide-react';
import MegaMenu from './MegaMenu';
import MobileNav from './MobileNav';
import ThemeToggle from '../shared/ThemeToggle';

type MenuItem = {
    id: string;
    label: string;
    url: string;
    target: string;
    isMegaMenu: boolean;
    megaMenuData: string | null;
    children?: MenuItem[];
    active: boolean;
};

export default function Header() {
    const { settings } = useSettings();
    const { theme } = useTheme();
    const pathname = usePathname();
    const isAdminPath = pathname?.startsWith('/executive-portal-aelbd');

    if (isAdminPath) return null;

    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [mobileMenus, setMobileMenus] = useState<MenuItem[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (isAdminPath) return; // Don't fetch if not showing
        fetch('/api/menus?location=main')
            .then(res => res.ok ? res.json() : null)
            .then(data => data && data.success && setMenus(data.menus))
            .catch(() => { });

        fetch('/api/menus?location=mobile')
            .then(res => res.ok ? res.json() : null)
            .then(data => data && data.success && setMobileMenus(data.menus))
            .catch(() => { });

        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logoSrc = theme === 'dark'
        ? (settings.header_logo_dark || settings.logo_dark || '/logo.jpg')
        : (settings.header_logo_light || settings.logo_light || '/logo.jpg');

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 
                ${isScrolled
                        ? 'bg-white/80 dark:bg-[#0B0F19]/90 backdrop-blur-xl shadow-xl border-b border-gray-100 dark:border-white/5 py-3'
                        : 'bg-white dark:bg-[#0F172A] py-5 border-b border-gray-100 dark:border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                    <Link href="/" className="flex items-center group h-10 lg:h-12 w-auto min-w-[120px]">
                        <div style={{ height: '40px', maxWidth: '240px', display: 'flex', alignItems: 'center' }} className="transition-all duration-300">
                            <img
                                src={logoSrc}
                                alt={settings.company_name || 'Apparel Emporium'}
                                style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                            />
                        </div>
                    </Link>

                    {/* Navigation Engine */}
                    <nav className="hidden lg:flex items-center gap-1 xl:gap-4">
                        {menus.map((item) => {
                            const hasMega = Boolean(item.isMegaMenu && item.megaMenuData);
                            const isActive = pathname === item.url;

                            return (
                                <div
                                    key={item.id}
                                    className="relative h-12 flex items-center"
                                    onMouseEnter={() => hasMega && setHoveredMenu(item.id)}
                                    onMouseLeave={() => setHoveredMenu(null)}
                                >
                                    <Link
                                        href={item.url}
                                        target={item.target}
                                        className={`px-4 py-2 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all flex items-center gap-1.5 group
                                        ${isActive
                                                ? 'text-primary'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {item.label}
                                        {hasMega && (
                                            <ChevronDown size={14} className={`transform transition-transform duration-300 ${hoveredMenu === item.id ? 'rotate-180 text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                                        )}
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>


                    {/* Logic Interface */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <Link
                            href="/buyer-portal"
                            className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors hover:bg-primary/10 rounded-full"
                            title="Buyer Portal"
                            aria-label="Buyer Portal"
                        >
                            <User size={20} />
                        </Link>

                        <Link
                            href="/contact"
                            className="bg-primary hover:bg-[#2563EB] text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-tighter"
                        >
                            Get a Quote
                        </Link>

                        {/* Mobile Access */}
                        <button
                            className="lg:hidden p-2.5 text-gray-700 dark:text-white hover:text-primary transition-colors bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Toggle Menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Mega Menu Dropdown attached seamlessly to header bottom */}
                {menus.map((item) => {
                    const hasMega = Boolean(item.isMegaMenu && item.megaMenuData);
                    if (!hasMega || hoveredMenu !== item.id) return null;

                    return (
                        <div
                            key={`mega-dropdown-${item.id}`}
                            className="absolute top-full left-0 w-full z-50 shadow-2xl animate-in fade-in duration-200"
                            onMouseEnter={() => setHoveredMenu(item.id)}
                            onMouseLeave={() => setHoveredMenu(null)}
                        >
                            <MegaMenu data={item.megaMenuData!} isVisible={true} />
                        </div>
                    );
                })}
            </header>

            <MobileNav
                menus={mobileMenus.length > 0 ? mobileMenus : menus}
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
        </>
    );
}

