'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
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
            .then(res => res.json())
            .then(data => data.success && setFooterMenus(data.flat.filter((m: any) => m.active)));

        // Fetch Categories for dynamic column
        fetch('/api/categories')
            .then(res => res.json())
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
        <footer className="bg-[#1A202C] dark:bg-[#0B0F19] text-gray-300 pt-16 pb-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="inline-block relative w-40 h-16">
                            {/* If the system has a dedicated explicit light logo configured, force it in Footer, otherwise use dark text */}
                            <Image
                                src={settings.logo_light || '/logo.jpg'}
                                alt={companyName}
                                fill
                                className="object-contain object-left invert opacity-90 brightness-0 sepia-0 grayscale hover:opacity-100 transition-opacity"
                                unoptimized
                            />
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            {settings.company_short_description ||
                                "Premium garments sourcing and manufacturing. We bridge the gap between world-class fashion brands and ethical, high-quality production facilities globally."}
                        </p>

                        <div className="flex gap-4 pt-2">
                            {settings.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-primary hover:text-white p-2.5 rounded-full transition-all duration-300 group">
                                    <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.linkedin_url && (
                                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-primary hover:text-white p-2.5 rounded-full transition-all duration-300 group">
                                    <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-primary hover:text-white p-2.5 rounded-full transition-all duration-300 group">
                                    <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.twitter_url && (
                                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-primary hover:text-white p-2.5 rounded-full transition-all duration-300 group">
                                    <Twitter size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.youtube_url && (
                                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-red-600 hover:text-white p-2.5 rounded-full transition-all duration-300 group">
                                    <Youtube size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider text-sm border-b border-white/10 pb-3 inline-block">Explore</h4>
                        <ul className="space-y-3.5">
                            {linksToRender.map(link => (
                                <li key={link.id}>
                                    <Link
                                        href={link.url}
                                        target={link.target}
                                        className="text-sm hover:text-primary hover:translate-x-1 transition-transform inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dynamic Categories Column */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider text-sm border-b border-white/10 pb-3 inline-block">Collections</h4>
                        <ul className="space-y-3.5">
                            {categories.length > 0 ? categories.map(cat => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/products?category=${cat.slug}`}
                                        className="text-sm hover:text-primary hover:translate-x-1 transition-transform inline-block truncate max-w-[200px]"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            )) : (
                                <>
                                    <li><Link href="/products" className="text-sm hover:text-primary transition-colors">Menswear</Link></li>
                                    <li><Link href="/products" className="text-sm hover:text-primary transition-colors">Womenswear</Link></li>
                                    <li><Link href="/products" className="text-sm hover:text-primary transition-colors">Kidswear</Link></li>
                                    <li><Link href="/products" className="text-sm hover:text-primary transition-colors">Activewear</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider text-sm border-b border-white/10 pb-3 inline-block">Get In Touch</h4>

                        <div className="flex gap-4 group">
                            <MapPin className="text-primary mt-1 shrink-0 group-hover:animate-pulse" size={20} />
                            <p className="text-sm text-gray-400">
                                {settings.company_address || '123 Fashion Avenue, Suite 400\nGarment District, NY 10018\nUnited States'}
                            </p>
                        </div>

                        <div className="flex gap-4 group">
                            <Phone className="text-primary shrink-0 group-hover:rotate-12 transition-transform" size={20} />
                            <a href={`tel:${settings.company_phone || '+1 234 567 8900'}`} className="text-sm hover:text-white transition-colors">
                                {settings.company_phone || '+1 (234) 567-8900'}
                            </a>
                        </div>

                        <div className="flex gap-4 group">
                            <Mail className="text-primary shrink-0 group-hover:scale-110 transition-transform" size={20} />
                            <a href={`mailto:${settings.company_email || 'hello@globalstitch.com'}`} className="text-sm hover:text-white transition-colors">
                                {settings.company_email || 'sourcing@apparel-emporium.com'}
                            </a>
                        </div>
                    </div>

                </div>

                {/* Newsletter / Bottom Strip */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-500 font-medium">
                        &copy; {year} {companyName}. All rights reserved.
                    </p>

                    <div className="flex gap-6 text-xs text-gray-500 font-medium">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
