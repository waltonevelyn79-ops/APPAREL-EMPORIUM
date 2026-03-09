'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

interface Popup {
    id: string;
    name: string;
    content: string;
    image: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    trigger: string;
    triggerValue: string | null;
    displayPages: string | null;
    showOnce: boolean;
}

export default function PopupBanner() {
    const pathname = usePathname();
    const [popups, setPopups] = useState<Popup[]>([]);
    const [activePopup, setActivePopup] = useState<Popup | null>(null);

    useEffect(() => {
        // Fetch active campaigns matching valid date ranges
        fetch('/api/popups')
            .then(r => r.json())
            .then(data => {
                if (data.popups) setPopups(data.popups);
            });
    }, []);

    useEffect(() => {
        if (!popups.length) return;

        // Filter valid popups for current page
        const validPopups = popups.filter(p => {
            if (p.showOnce) {
                const shownStr = localStorage.getItem('shown_popups') || '[]';
                const shown = JSON.parse(shownStr);
                if (shown.includes(p.id)) return false;
            }
            if (p.displayPages && p.displayPages !== 'ALL') {
                if (p.displayPages === '/' && pathname !== '/') return false;
                if (p.displayPages !== '/' && !pathname.includes(p.displayPages)) return false;
            }
            return true;
        });

        if (!validPopups.length) return;

        // Take the highest priority one (assuming first)
        const banner = validPopups[0];

        const triggerBanner = () => {
            setActivePopup(banner);
            if (banner.showOnce) {
                const shown = JSON.parse(localStorage.getItem('shown_popups') || '[]');
                shown.push(banner.id);
                localStorage.setItem('shown_popups', JSON.stringify(shown));
            }
        };

        if (banner.trigger === 'load') {
            triggerBanner();
        } else if (banner.trigger === 'delay') {
            const ms = (parseInt(banner.triggerValue || '5')) * 1000;
            const timer = setTimeout(triggerBanner, ms);
            return () => clearTimeout(timer);
        } else if (banner.trigger === 'scroll') {
            const threshold = parseInt(banner.triggerValue || '50');
            const handleScroll = () => {
                const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (scrolled >= threshold) {
                    triggerBanner();
                    window.removeEventListener('scroll', handleScroll);
                }
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        } else if (banner.trigger === 'exit') {
            const handleMouseOut = (e: MouseEvent) => {
                if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
                    triggerBanner();
                    document.removeEventListener('mouseleave', handleMouseOut);
                }
            };
            document.addEventListener('mouseleave', handleMouseOut);
            return () => document.removeEventListener('mouseleave', handleMouseOut);
        }
    }, [popups, pathname]);

    if (!activePopup) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={() => setActivePopup(null)}
                    className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-gray-800 dark:text-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 backdrop-blur-md"
                >
                    <X size={16} />
                </button>

                {activePopup.image && (
                    <div className="w-full h-48 bg-gray-100 relative">
                        <img src={activePopup.image} alt={activePopup.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark-surface to-transparent bottom-0 h-1/2"></div>
                    </div>
                )}

                <div className={`p-8 text-center ${!activePopup.image ? 'pt-12' : 'pt-4'}`}>
                    <div className="text-gray-700 dark:text-gray-300 text-lg whitespace-pre-wrap leading-relaxed">
                        {/* We use basic HTML parsing here safely since content is from SUPER_ADMIN ONLY via CMS */}
                        <div dangerouslySetInnerHTML={{ __html: activePopup.content }} />
                    </div>

                    {activePopup.ctaText && activePopup.ctaLink && (
                        <div className="mt-8">
                            <a
                                href={activePopup.ctaLink}
                                onClick={() => setActivePopup(null)}
                                className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full shadow hover:shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                            >
                                {activePopup.ctaText}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close map wrapper */}
            <div className="absolute inset-0 -z-10" onClick={() => setActivePopup(null)}></div>
        </div>
    );
}

