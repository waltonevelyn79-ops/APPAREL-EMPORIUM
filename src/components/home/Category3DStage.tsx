'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface PillarItem {
    id: string;
    title: string;
    displayTitleLines: string[];
    categorySlug: string;
    image: string;
    glowColor: string;
    sideBg: string;
    innerPanelBg: string;
    subLinks: { label: string; url: string }[];
}

const PILLARS: PillarItem[] = [
    {
        id: 'woven',
        title: 'WOVEN FASHION',
        displayTitleLines: ['WOVEN', 'FASHION'],
        categorySlug: 'woven',
        image: '/images/3d/woven_shirt.png',
        glowColor: 'rgba(197, 188, 160, 0.45)',
        sideBg: 'bg-[#C5BCA0] dark:bg-[#1E2920]',
        innerPanelBg: 'bg-[#D6CEB6] dark:bg-[#29382C]',
        subLinks: [
            { label: 'MEN', url: '/products?category=woven-mens' },
            { label: 'WOMEN', url: '/products?category=woven-womens' },
            { label: 'CHILDREN', url: '/products?category=woven-kids' },
        ]
    },
    {
        id: 'knit',
        title: 'KNIT FASHION',
        displayTitleLines: ['KNIT', 'FASHION'],
        categorySlug: 'knitwear',
        image: '/images/3d/knit_polo.png',
        glowColor: 'rgba(232, 219, 201, 0.55)',
        sideBg: 'bg-[#DDD5C7] dark:bg-[#20293A]',
        innerPanelBg: 'bg-[#E8DBC9] dark:bg-[#253046]',
        subLinks: [
            { label: 'MEN', url: '/products?category=knitwear-mens' },
            { label: 'WOMEN', url: '/products?category=knitwear-womens' },
            { label: 'CHILDREN', url: '/products?category=knitwear-kids' },
        ]
    },
    {
        id: 'sweater',
        title: 'SWEATER FASHION',
        displayTitleLines: ['SWEATER', 'FASHION'],
        categorySlug: 'sweater',
        image: '/images/3d/sweater_cardigan.png',
        glowColor: 'rgba(199, 178, 159, 0.45)',
        sideBg: 'bg-[#C7B29F] dark:bg-[#2E2018]',
        innerPanelBg: 'bg-[#D9C6B4] dark:bg-[#3D2C22]',
        subLinks: [
            { label: 'MEN', url: '/products?category=sweater-mens' },
            { label: 'WOMEN', url: '/products?category=sweater-womens' },
            { label: 'CHILDREN', url: '/products?category=sweater-kids' },
        ]
    },
    {
        id: 'accessories',
        title: 'ACCESSORIES',
        displayTitleLines: ['ACCESSORIES'],
        categorySlug: 'accessories',
        image: '/images/3d/accessories.png',
        glowColor: 'rgba(181, 172, 162, 0.45)',
        sideBg: 'bg-[#B5ACA2] dark:bg-[#242125]',
        innerPanelBg: 'bg-[#CCC5BD] dark:bg-[#352F37]',
        subLinks: [
            { label: 'TRIMS', url: '/products?category=acc-trims' },
            { label: 'FASHION', url: '/products?category=acc-fashion' },
            { label: 'PACKAGING', url: '/products?category=acc-packaging' },
        ]
    }
];

export default function Category3DStage() {
    // Start with index 1 (KNIT FASHION) as center, matching reference image
    const [activeIndex, setActiveIndex] = useState(1);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [screenWidth, setScreenWidth] = useState(1200);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<number | null>(null);

    const nextPillar = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % PILLARS.length);
    }, []);

    const prevPillar = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + PILLARS.length) % PILLARS.length);
    }, []);

    // Track responsive screen width for precise, non-overlapping spacing
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Smooth Autoplay: advance automatically every 4.5 seconds when not hovered
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            nextPillar();
        }, 4500);
        return () => clearInterval(interval);
    }, [isHovered, nextPillar]);

    // Interactive 3D mouse tilt tracking for the active center card
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Subtle tilt clamp: -6 to +6 degrees
        setTilt({
            x: Math.max(-6, Math.min(6, -(y / rect.height) * 12)),
            y: Math.max(-6, Math.min(6, (x / rect.width) * 12)),
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    // Mobile touch gestures for swiping
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartRef.current === null) return;
        const touchDiff = e.changedTouches[0].clientX - touchStartRef.current;
        if (touchDiff > 45) {
            prevPillar();
        } else if (touchDiff < -45) {
            nextPillar();
        }
        touchStartRef.current = null;
    };

    const activePillar = PILLARS[activeIndex];

    return (
        <section className="relative w-full pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-[#F6F2EC] dark:bg-[#0B0F19] transition-colors duration-500">
            {/* Ambient luxury radial glow behind center stage */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[500px] sm:h-[650px] rounded-full blur-[130px] pointer-events-none transition-all duration-1000 opacity-60 dark:opacity-30"
                style={{
                    background: `radial-gradient(circle, ${activePillar.glowColor} 0%, transparent 70%)`
                }}
            />

            {/* Subtle luxury studio background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header Title */}
                <div className="text-center mb-10 sm:mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-stone-900/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-900/10 dark:border-white/10 mb-3 shadow-xs">
                        <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
                        Core Manufacturing Divisions
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight font-heading">
                        Export Garments Sourcing
                    </h1>
                </div>

                {/* 3D Perspective Stage Area */}
                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="relative h-[530px] sm:h-[580px] flex items-center justify-center select-none"
                    style={{ perspective: '1800px' }}
                >
                    {PILLARS.map((pillar, idx) => {
                        // Calculate cyclic offset relative to active card (-2, -1, 0, 1, 2)
                        let offset = idx - activeIndex;
                        if (offset < -2) offset += PILLARS.length;
                        if (offset > 2) offset -= PILLARS.length;

                        // Fallback wrap around
                        if (offset === 3) offset = -1;
                        if (offset === -3) offset = 1;

                        const isCenter = offset === 0;

                        // Responsive, spacious translateX distances ensuring ample breathing room (no overlap!)
                        let translateX = 0;
                        let translateZ = 0;
                        let rotateY = 0;
                        let scale = 1;
                        let opacity = 1;
                        let zIndex = 10;
                        let isHidden = false;

                        if (isCenter) {
                            translateX = 0;
                            translateZ = 60;
                            rotateY = isHovered ? tilt.y : 0;
                            scale = 1;
                            opacity = 1;
                            zIndex = 30;
                        } else if (offset === -1) {
                            // Left Card
                            translateX = screenWidth >= 1280 ? -420 : screenWidth >= 1024 ? -370 : screenWidth >= 640 ? -300 : -230;
                            translateZ = -40;
                            rotateY = screenWidth >= 640 ? 12 : 6;
                            scale = screenWidth >= 640 ? 0.86 : 0.74;
                            opacity = screenWidth >= 640 ? 0.95 : 0.45;
                            zIndex = 20;
                        } else if (offset === 1) {
                            // Right Card
                            translateX = screenWidth >= 1280 ? 420 : screenWidth >= 1024 ? 370 : screenWidth >= 640 ? 300 : 230;
                            translateZ = -40;
                            rotateY = screenWidth >= 640 ? -12 : -6;
                            scale = screenWidth >= 640 ? 0.86 : 0.74;
                            opacity = screenWidth >= 640 ? 0.95 : 0.45;
                            zIndex = 20;
                        } else if (offset === 2) {
                            // Far Right Card (peeking)
                            translateX = screenWidth >= 1280 ? 790 : screenWidth >= 1024 ? 690 : 540;
                            translateZ = -120;
                            rotateY = -20;
                            scale = 0.72;
                            opacity = screenWidth >= 1024 ? 0.6 : 0;
                            zIndex = 10;
                            if (screenWidth < 1024) isHidden = true;
                        } else if (offset === -2) {
                            // Far Left Card (peeking)
                            translateX = screenWidth >= 1280 ? -790 : screenWidth >= 1024 ? -690 : -540;
                            translateZ = -120;
                            rotateY = 20;
                            scale = 0.72;
                            opacity = screenWidth >= 1024 ? 0.6 : 0;
                            zIndex = 10;
                            if (screenWidth < 1024) isHidden = true;
                        } else {
                            isHidden = true;
                            opacity = 0;
                        }

                        const rotateX = isCenter && isHovered ? tilt.x : 0;
                        const transformStyle = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;

                        return (
                            <div
                                key={pillar.id}
                                onClick={() => setActiveIndex(idx)}
                                className={`absolute transition-all ease-out cursor-pointer ${
                                    isHidden ? 'pointer-events-none' : ''
                                }`}
                                style={{
                                    transform: transformStyle,
                                    zIndex,
                                    opacity,
                                    transitionDuration: '750ms',
                                    transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform, opacity',
                                }}
                            >
                                {isCenter ? (
                                    /* ─── ACTIVE CENTER CARD: White shell with warm inner arch & pop-out polo shirt ─── */
                                    <div className="relative w-[305px] sm:w-[350px] md:w-[365px] h-[480px] sm:h-[515px] bg-white dark:bg-[#151D2C] rounded-[32px] sm:rounded-[36px] p-4 sm:p-5 pt-0 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14),0_10px_25px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-black/[0.04] dark:border-white/10 overflow-visible transition-colors duration-500">
                                        {/* Inner Arch / Rounded Frame */}
                                        <div className={`relative w-full h-[290px] sm:h-[315px] rounded-[24px] sm:rounded-[28px] ${pillar.innerPanelBg} overflow-visible mt-4 sm:mt-5 transition-colors duration-500`}>
                                            {/* Pop-Out Garment: collar and shoulders extend ABOVE the top edge of the card */}
                                            <div className="absolute -top-14 sm:-top-18 inset-x-0 h-[320px] sm:h-[355px] flex items-center justify-center pointer-events-none">
                                                <div className="relative w-full h-full animate-stage-float">
                                                    <Image
                                                        src={pillar.image}
                                                        alt={pillar.title}
                                                        fill
                                                        priority
                                                        className="object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.22)]"
                                                        sizes="(max-width: 768px) 320px, 365px"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center Card Bottom Typography */}
                                        <div className="text-center pt-3 pb-2">
                                            <h2 className="text-2xl sm:text-[28px] font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white font-heading">
                                                {pillar.title}
                                            </h2>

                                            {/* Sub-department Quick Links */}
                                            <div className="flex items-center justify-center gap-6 sm:gap-8 pt-3 border-t border-slate-100 dark:border-white/10 mt-3">
                                                {pillar.subLinks.map((sub, sIdx) => (
                                                    <Link
                                                        key={sIdx}
                                                        href={sub.url}
                                                        className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* ─── SIDE CARD: Solid smooth luxury card with garment & bottom title ─── */
                                    <div
                                        className={`group relative w-[220px] sm:w-[255px] md:w-[270px] h-[340px] sm:h-[380px] rounded-[24px] sm:rounded-[28px] ${pillar.sideBg} p-4 flex flex-col justify-between shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] border border-black/[0.04] dark:border-white/5 overflow-hidden transition-all duration-500`}
                                    >
                                        {/* Product Garment Image */}
                                        <div className="relative w-full h-[220px] sm:h-[250px] mt-2 flex items-center justify-center">
                                            <Image
                                                src={pillar.image}
                                                alt={pillar.title}
                                                fill
                                                className="object-contain filter drop-shadow-[0_14px_20px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 220px, 270px"
                                            />
                                        </div>

                                        {/* Side Card Title at bottom */}
                                        <div className="text-center pb-4 sm:pb-5">
                                            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white leading-tight font-heading">
                                                {pillar.displayTitleLines.map((line, lIdx) => (
                                                    <span key={lIdx} className="block">
                                                        {line}
                                                    </span>
                                                ))}
                                            </h3>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 3D Navigation Controls */}
                <div className="flex items-center justify-center gap-4 mt-4 sm:mt-6">
                    <button
                        onClick={prevPillar}
                        aria-label="Previous Division"
                        className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Indicator Pill Dots */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-xs backdrop-blur-sm">
                        {PILLARS.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => setActiveIndex(idx)}
                                aria-label={`Select ${p.title}`}
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    idx === activeIndex
                                        ? 'w-7 bg-stone-900 dark:bg-blue-400 shadow-xs'
                                        : 'w-2 bg-stone-300 dark:bg-slate-600 hover:bg-stone-400'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextPillar}
                        aria-label="Next Division"
                        className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
}
