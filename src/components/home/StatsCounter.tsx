'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { ShieldCheck, Star, Award, TrendingUp } from 'lucide-react';

interface Stat {
    id: string;
    number: number;
    suffix: string;
    label: string;
    icon: string;
}

interface StatsCounterProps {
    data: any;
}

// Authentic, Trust-First B2B Quality & Reliability Metrics for Apparel Emporium
const DEFAULT_STATS: Stat[] = [
    { id: '1', number: 99, suffix: '%', label: 'Quality Pass Rate', icon: 'ShieldCheck' },
    { id: '2', number: 98, suffix: '%', label: 'On-Time Shipment', icon: 'Clock' },
    { id: '3', number: 100, suffix: '%', label: 'Ethical Compliance', icon: 'Award' },
    { id: '4', number: 100, suffix: '%', label: 'Dedicated QA Support', icon: 'CheckCircle2' },
];

// Trust badges / verifiers to show under each stat
const statTrustInfo: Record<string, { source: string; badge: string }> = {
    'QUALITY PASS RATE': { source: 'AQL 2.5 Standard · ISO 9001', badge: '🛡️' },
    'ON-TIME SHIPMENT': { source: 'Milestone Tracking Protocol', badge: '⏱️' },
    'ON-TIME DELIVERY': { source: 'Critical Path Management', badge: '⏱️' },
    'ETHICAL COMPLIANCE': { source: 'BSCI & OEKO-TEX Audited', badge: '🌱' },
    'COMPLIANT SOURCING': { source: 'BSCI, GOTS & OEKO-TEX', badge: '🌱' },
    'DEDICATED QA SUPPORT': { source: 'In-House Merchandising & QC', badge: '👔' },
    'TRADE & QC SUPPORT': { source: 'Dedicated Merchandisers', badge: '👔' },
    'YEARS EXPERIENCE': { source: 'Est. 2004 · Verified', badge: '🏅' },
    'EXPORT MARKETS': { source: 'EU, US, Canada, UAE', badge: '🌍' },
    'GLOBAL DESTINATIONS': { source: 'EU, US, Canada, UAE', badge: '🌍' },
    'GLOBAL BUYERS': { source: 'Active Global Network', badge: '🌍' },
    'AUDITED FACTORIES': { source: 'BSCI / ISO Certified', badge: '🏭' },
    'PARTNER FACTORIES': { source: 'BSCI / ISO Audited', badge: '🏭' },
    'PCS ANNUAL VOLUME': { source: 'BGMEA Export Record', badge: '📦' },
    'PIECES/YEAR': { source: 'Export volume · BGMEA', badge: '📦' },
    'CLIENT RETENTION': { source: 'Repeat Buyer Rate', badge: '⭐' },
    'COMPLIANCE RATE': { source: 'AQL 2.5 Standard', badge: '🛡️' },
};

// Certifications strip
const CERTS = [
    { label: 'ISO 9001:2015', icon: <ShieldCheck size={14} className="text-secondary" /> },
    { label: 'BSCI Certified', icon: <Award size={14} className="text-secondary" /> },
    { label: 'OEKO-TEX®', icon: <ShieldCheck size={14} className="text-secondary" /> },
    { label: 'GOTS Compliant', icon: <Star size={14} className="text-secondary" /> },
    { label: 'BGMEA Member', icon: <Award size={14} className="text-secondary" /> },
    { label: 'Fair Trade', icon: <TrendingUp size={14} className="text-secondary" /> },
];

export default function StatsCounter({ data }: StatsCounterProps) {
    const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setStats(parsed);
                } else {
                    setStats(DEFAULT_STATS);
                }
            } catch (e) {
                setStats(DEFAULT_STATS);
            }
        } else if (Array.isArray(data) && data.length > 0) {
            setStats(data);
        } else {
            setStats(DEFAULT_STATS);
        }
    }, [data]);

    useEffect(() => {
        const currentRef = sectionRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.2 });
        observer.observe(currentRef);

        return () => observer.disconnect();
    }, [stats.length]);

    if (!stats || stats.length === 0) return null;

    return (
        <section ref={sectionRef} className="bg-[#0B1628] text-white relative overflow-hidden">

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'linear-gradient(rgba(200,169,98,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,98,0.6) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            {/* Stats row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, idx) => {
                        const IconComponent = (Icons as any)[stat.icon] || Icons.Activity;
                        const trustInfo = statTrustInfo[stat.label.toUpperCase()] || { source: 'Verified data', badge: '✓' };

                        return (
                            <div key={stat.id || idx} className="group text-center relative">
                                {/* Vertical divider (not on last) */}
                                {idx < stats.length - 1 && (
                                    <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-white/10" />
                                )}

                                {/* Icon */}
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.06] border border-secondary/20 text-secondary mb-5 group-hover:bg-secondary/10 group-hover:border-secondary/50 transition-all duration-500 shadow-lg">
                                    <IconComponent size={26} className="text-secondary" />
                                </div>

                                {/* Number */}
                                <div className="text-4xl md:text-5xl font-black text-white font-heading mb-1 flex items-center justify-center tabular-nums">
                                    <AnimatedNumber value={stat.number} isVisible={isVisible} />
                                    <span className="text-secondary ml-1 font-extrabold">{stat.suffix}</span>
                                </div>

                                {/* Label */}
                                <p className="text-slate-300 font-bold text-xs md:text-sm tracking-widest uppercase mb-3">
                                    {stat.label}
                                </p>

                                {/* Trust indicator */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-medium text-slate-400">
                                    <span>{trustInfo.badge}</span>
                                    <span>{trustInfo.source}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Certifications strip */}
            <div className="border-t border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mr-2">Internationally Certified:</span>
                        {CERTS.map((cert, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-slate-400 hover:text-secondary transition-colors">
                                {cert.icon}
                                <span className="text-[11px] font-semibold">{cert.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Custom hook to animate numbers from 0 to target value when visible
function AnimatedNumber({ value, isVisible }: { value: number, isVisible: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        let startTimestamp: number | null = null;
        const duration = 2000; // 2 seconds

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // easeOutQuart
            const easeOutProgress = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutProgress * value);

            setCount(currentCount);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(value);
            }
        };

        window.requestAnimationFrame(step);
    }, [value, isVisible]);

    return <span>{count.toLocaleString()}</span>;
}
