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

    // Filter out duplicate or redundant menu items to keep the capsule clean
    const navItems = menus.length > 0
        ? menus.filter((item, idx, arr) => {
            // Keep unique URLs or standard mockup items
            if (item.label.toLowerCase() === 'categories' && arr.some(x => x.label.toLowerCase() === 'products')) {
                return false;
            }
            return true;
        })
        : [
            { id: '1', label: 'Home', url: '/', target: '_self', isMegaMenu: false, megaMenuData: null, active: true },
            { id: '2', label: 'Products', url: '/products', target: '_self', isMegaMenu: false, megaMenuData: null, active: false },
            { id: '3', label: 'About Us', url: '/about', target: '_self', isMegaMenu: false, megaMenuData: null, active: false },
            { id: '4', label: 'Support', url: '/support', target: '_self', isMegaMenu: false, megaMenuData: null, active: false },
            { id: '5', label: 'Contact', url: '/contact', target: '_self', isMegaMenu: false, megaMenuData: null, active: false },
        ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
                <div
                    className={`pointer-events-auto relative w-full max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300
                    bg-[#FAF6F0]/90 dark:bg-[#101726]/85 backdrop-blur-xl
                    border border-[#E8E0D2] dark:border-white/10
                    shadow-[0_10px_35px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]`}
                >
                    {/* Brand / Monogram */}
                    <Link href="/" className="flex items-center gap-2 group h-9 sm:h-10 w-auto shrink-0">
                        <div className="h-8 sm:h-9 max-w-[200px] flex items-center transition-all duration-300">
                            <img
                                src={logoSrc}
                                alt={settings.company_name || 'Apparel Emporium'}
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </Link>

                    {/* Navigation Engine (Desktop) */}
                    <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                        {navItems.map((item) => {
                            const hasMega = Boolean(item.isMegaMenu && item.megaMenuData);
                            const isActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));

                            return (
                                <div
                                    key={item.id}
                                    className="relative flex items-center"
                                    onMouseEnter={() => hasMega && setHoveredMenu(item.id)}
                                    onMouseLeave={() => setHoveredMenu(null)}
                                >
                                    <Link
                                        href={item.url}
                                        target={item.target}
                                        className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center gap-1
                                        ${isActive
                                                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-[#E5DEC8] dark:border-white/15'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        {item.label}
                                        {hasMega && (
                                            <ChevronDown size={13} className={`transform transition-transform duration-300 ${hoveredMenu === item.id ? 'rotate-180 text-primary' : 'text-slate-400 dark:text-slate-400'}`} />
                                        )}
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <ThemeToggle />

                        <Link
                            href="/buyer-portal"
                            className="p-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                            title="Buyer Portal"
                            aria-label="Buyer Portal"
                        >
                            <User size={19} />
                        </Link>

                        <Link
                            href="/contact"
                            className="text-xs font-bold uppercase tracking-wider px-4 sm:px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm
                            bg-[#2D2A26] hover:bg-black text-white
                            dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:border dark:border-white/20"
                        >
                            Get a Quote
                        </Link>

                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden p-2 text-slate-700 dark:text-white hover:text-primary transition-colors bg-black/5 dark:bg-white/5 rounded-full"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Toggle Menu"
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    {/* Mega Menu Dropdown attached under capsule */}
                    {navItems.map((item) => {
                        const hasMega = Boolean(item.isMegaMenu && item.megaMenuData);
                        if (!hasMega || hoveredMenu !== item.id) return null;

                        return (
                            <div
                                key={`mega-dropdown-${item.id}`}
                                className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[95vw] max-w-5xl z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 animate-in fade-in duration-200 bg-white dark:bg-[#101726]"
                                onMouseEnter={() => setHoveredMenu(item.id)}
                                onMouseLeave={() => setHoveredMenu(null)}
                            >
                                <MegaMenu data={item.megaMenuData!} isVisible={true} />
                            </div>
                        );
                    })}
                </div>
            </header>

            <MobileNav
                menus={mobileMenus.length > 0 ? mobileMenus : menus}
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
        </>
    );
}

