'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Menu, X, ChevronDown } from 'lucide-react';
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

    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [mobileMenus, setMobileMenus] = useState<MenuItem[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        // Fetch Main Desktop Menu
        fetch('/api/menus?location=main')
            .then(res => res.json())
            .then(data => data.success && setMenus(data.menus.filter((m: any) => m.active)));

        // Fetch Mobile Root Menus
        fetch('/api/menus?location=mobile')
            .then(res => res.json())
            .then(data => data.success && setMobileMenus(data.menus.filter((m: any) => m.active)));

        // Handle Scroll Parallax/Shadow
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logoSrc = theme === 'dark' && settings.logo_dark
        ? settings.logo_dark
        : (settings.logo_light || '/logo.jpg');

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 
            ${isScrolled
                    ? 'bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-gray-800 py-3'
                    : 'bg-white dark:bg-dark-bg py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="relative flex items-center group touch-manipulation">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-xl border-2 border-primary/10 group-hover:border-primary/50 transition-colors shadow-sm bg-white">
                        <Image
                            src={logoSrc}
                            alt={settings.company_name || 'Logo'}
                            fill
                            className="object-contain p-1 transform group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                        />
                    </div>
                    <span className="ml-3 font-extrabold text-xl md:text-2xl tracking-tight text-gray-900 dark:text-white hidden sm:block font-heading">
                        {settings.company_name || 'Apparel Emporium'}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {menus.map((item) => {
                        const hasMega = item.isMegaMenu && item.megaMenuData;
                        const hasChildren = item.children && item.children.length > 0;
                        const isActive = pathname === item.url || (pathname.startsWith(item.url) && item.url !== '/');

                        return (
                            <div
                                key={item.id}
                                className="relative"
                                onMouseEnter={() => setHoveredMenu(item.id)}
                                onMouseLeave={() => setHoveredMenu(null)}
                            >
                                <Link
                                    href={item.url}
                                    target={item.target}
                                    className={`px-3 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-1 group whitespace-nowrap
                                    ${isActive
                                            ? 'bg-primary/10 text-primary dark:text-primary dark:bg-primary/20'
                                            : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {item.label}
                                    {(hasMega || hasChildren) && (
                                        <ChevronDown size={14} className={`transform transition-transform duration-300 ${hoveredMenu === item.id ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                                    )}
                                </Link>

                                {/* Standard Dropdown */}
                                {hasChildren && !hasMega && hoveredMenu === item.id && (
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-dark-surface shadow-xl rounded-xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                                        <div className="py-2">
                                            {item.children!.map(child => (
                                                <Link
                                                    key={child.id}
                                                    href={child.url}
                                                    target={child.target}
                                                    className="block px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mega Menu Injection */}
                                {hasMega && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-7xl px-4 pointer-events-none">
                                        <div className={`pointer-events-auto transition-all duration-300 origin-top ${hoveredMenu === item.id ? 'opacity-100 scale-100 translate-y-2' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                                            <MegaMenu data={item.megaMenuData!} isVisible={hoveredMenu === item.id} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4 xl:gap-6">
                    <ThemeToggle />

                    <Link
                        href="/contact"
                        className="hidden md:flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_0_rgba(var(--color-primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--color-primary),0.23)] hover:scale-105 transition-all duration-300 transform"
                    >
                        Get a Quote
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-primary transition-colors bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Toggle Menu"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

            </div>

            {/* Mobile Navigation Drawer */}
            <MobileNav
                menus={mobileMenus.length > 0 ? mobileMenus : menus} // Fallback to main menu if Mobile specific isn't built yet
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

        </header>
    );
}
