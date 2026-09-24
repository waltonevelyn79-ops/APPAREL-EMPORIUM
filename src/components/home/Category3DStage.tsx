'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface PillarItem {
    id: string;
    title: string;
    categorySlug: string;
    image: string;
    glowColor: string;
    lightCardBg: string;
    darkCardBg: string;
    subLinks: { label: string; url: string }[];
}

const PILLARS: PillarItem[] = [
    {
        id: 'knit',
        title: 'KNIT FASHION',
        categorySlug: 'knitwear',
        image: '/images/3d/knit_polo.jpg',
        glowColor: 'rgba(59, 130, 246, 0.5)',
        lightCardBg: 'bg-white',
        darkCardBg: 'bg-[#182238]/90',
        subLinks: [
            { label: 'MEN', url: '/products?category=knitwear-mens' },
            { label: 'WOMEN', url: '/products?category=knitwear-womens' },
            { label: 'CHILDREN', url: '/products?category=knitwear-kids' },
        ]
    },
    {
        id: 'woven',
        title: 'WOVEN FASHION',
        categorySlug: 'woven',
        image: '/images/3d/woven_shirt.jpg',
        glowColor: 'rgba(16, 185, 129, 0.45)',
        lightCardBg: 'bg-[#E3E8DC]',
        darkCardBg: 'bg-[#132A24]/90',
        subLinks: [
            { label: 'MEN', url: '/products?category=woven-mens' },
            { label: 'WOMEN', url: '/products?category=woven-womens' },
            { label: 'CHILDREN', url: '/products?category=woven-kids' },
        ]
    },
    {
        id: 'sweater',
        title: 'SWEATER FASHION',
        categorySlug: 'sweater',
        image: '/images/3d/sweater_cardigan.jpg',
        glowColor: 'rgba(245, 158, 11, 0.45)',
        lightCardBg: 'bg-[#EFE4D6]',
        darkCardBg: 'bg-[#2E1F14]/90',
        subLinks: [
            { label: 'MEN', url: '/products?category=sweater-mens' },
            { label: 'WOMEN', url: '/products?category=sweater-womens' },
            { label: 'CHILDREN', url: '/products?category=sweater-kids' },
        ]
    },
    {
        id: 'accessories',
        title: 'ACCESSORIES',
        categorySlug: 'accessories',
        image: '/images/3d/accessories.jpg',
        glowColor: 'rgba(147, 51, 234, 0.45)',
        lightCardBg: 'bg-[#EAE4DC]',
        darkCardBg: 'bg-[#231A33]/90',
        subLinks: [
            { label: 'TRIMS', url: '/products?category=acc-trims' },
            { label: 'FASHION', url: '/products?category=acc-fashion' },
            { label: 'PACKAGING', url: '/products?category=acc-packaging' },
        ]
    }
];

export default function Category3DStage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const nextPillar = () => setActiveIndex((prev) => (prev + 1) % PILLARS.length);
    const prevPillar = () => setActiveIndex((prev) => (prev - 1 + PILLARS.length) % PILLARS.length);

    // Mouse tilt tracking for active card
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Subtle tilt clamp: -8 to +8 degrees
        setTilt({
            x: Math.max(-8, Math.min(8, -(y / rect.height) * 16)),
            y: Math.max(-8, Math.min(8, (x / rect.width) * 16)),
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    const activePillar = PILLARS[activeIndex];

    return (
        <section className="relative w-full pt-28 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-[#FAF7F2] dark:bg-[#0B0F19] transition-colors duration-500">
            {/* Ambient 3D Spotlight Behind Active Card */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[450px] sm:h-[550px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 opacity-60 dark:opacity-40"
                style={{
                    background: `radial-gradient(circle, ${activePillar.glowColor} 0%, transparent 70%)`
                }}
            />

            {/* Subtle background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Stage Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-primary dark:text-blue-400 border border-blue-500/20 mb-3 shadow-xs">
                        <Sparkles size={12} />
                        Core Manufacturing Divisions
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-heading">
                        Export Garments Sourcing
                    </h1>
                </div>

                {/* 3D Perspective Stage */}
                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={handleMouseLeave}
                    className="relative h-[480px] sm:h-[540px] flex items-center justify-center select-none"
                    style={{ perspective: '1600px' }}
                >
                    {PILLARS.map((pillar, idx) => {
                        // Calculate offset relative to active card (-1, 0, 1, etc.)
                        let offset = idx - activeIndex;
                        if (offset < -1) offset += PILLARS.length;
                        if (offset > 2) offset -= PILLARS.length;

                        const isCenter = offset === 0;
                        const isLeft = offset === -1 || (activeIndex === 0 && idx === PILLARS.length - 1);
                        const isRight = offset === 1;
                        const isHidden = !isCenter && !isLeft && !isRight;

                        // Position & 3D transform formulas
                        let transformStyle = '';
                        let zIndex = 10;
                        let opacity = 0.75;

                        if (isCenter) {
                            zIndex = 30;
                            opacity = 1;
                            const tiltX = isHovered ? tilt.x : 0;
                            const tiltY = isHovered ? tilt.y : 0;
                            transformStyle = `translateX(0px) translateZ(40px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
                        } else if (isLeft) {
                            zIndex = 20;
                            opacity = 0.7;
                            transformStyle = `translateX(-240px) translateZ(-60px) rotateY(16deg) scale(0.88)`;
                        } else if (isRight) {
                            zIndex = 20;
                            opacity = 0.7;
                            transformStyle = `translateX(240px) translateZ(-60px) rotateY(-16deg) scale(0.88)`;
                        } else {
                            zIndex = 5;
                            opacity = 0;
                            transformStyle = `translateX(400px) translateZ(-160px) rotateY(-25deg) scale(0.7)`;
                        }

                        return (
                            <div
                                key={pillar.id}
                                onClick={() => setActiveIndex(idx)}
                                className={`absolute w-[290px] sm:w-[350px] transition-all duration-700 ease-out cursor-pointer ${
                                    isHidden ? 'pointer-events-none' : ''
                                }`}
                                style={{
                                    transform: transformStyle,
                                    zIndex,
                                    opacity,
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform, opacity',
                                }}
                            >
                                {/* 3D Card Shell */}
                                <div
                                    className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-500 overflow-hidden shadow-2xl border ${
                                        isCenter
                                            ? `${pillar.lightCardBg} dark:${pillar.darkCardBg} border-slate-200/90 dark:border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)]`
                                            : 'bg-white/80 dark:bg-[#161D2B]/80 border-slate-200/60 dark:border-white/5 backdrop-blur-md'
                                    }`}
                                >
                                    {/* 3D Render Image Container */}
                                    <div className="relative w-full aspect-square mb-4 rounded-2xl overflow-hidden flex items-center justify-center">
                                        <Image
                                            src={pillar.image}
                                            alt={pillar.title}
                                            fill
                                            priority={idx < 2}
                                            className={`object-contain transition-transform duration-700 ease-out drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)] ${
                                                isCenter ? 'scale-105 group-hover:scale-110' : 'scale-95'
                                            }`}
                                            sizes="(max-width: 768px) 290px, 350px"
                                        />
                                    </div>

                                    {/* Pillar Title */}
                                    <div className="text-center space-y-2.5">
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                                            {pillar.title}
                                        </h2>

                                        {/* Sub-department Quick Links (Only visible when active in center) */}
                                        {isCenter && (
                                            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1 border-t border-slate-200/70 dark:border-white/10 animate-in fade-in duration-300">
                                                {pillar.subLinks.map((sub, sIdx) => (
                                                    <Link
                                                        key={sIdx}
                                                        href={sub.url}
                                                        className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline py-1 transition-colors"
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Interactive Glow Ring */}
                                    {isCenter && (
                                        <div
                                            className="absolute -inset-px rounded-3xl pointer-events-none border-2 border-primary/40 dark:border-blue-400/40"
                                            style={{
                                                boxShadow: `inset 0 0 20px ${pillar.glowColor}`
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 3D Navigation Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        onClick={prevPillar}
                        aria-label="Previous Manufacturing Division"
                        className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Pillar Indicator Dots */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs">
                        {PILLARS.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => setActiveIndex(idx)}
                                aria-label={`Select ${p.title}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === activeIndex
                                        ? 'w-6 bg-primary dark:bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.8)]'
                                        : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextPillar}
                        aria-label="Next Manufacturing Division"
                        className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
}
