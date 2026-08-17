'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, Award, Leaf, CheckCircle2, Globe2 } from 'lucide-react';

interface Certification {
    id: string;
    name: string;
    subtitle?: string;
    image: string;
    link: string;
}

interface CertProps {
    data: any;
    headings?: {
        certifications_label?: string;
        certifications_heading?: string;
        certifications_subheading?: string;
    };
}

const DEFAULT_CERTS: Certification[] = [
    { id: '1', name: 'OEKO-TEX® Standard 100', subtitle: 'Chemical & Eco Safety', image: '/images/certifications/oeko-tex.png', link: 'https://www.oeko-tex.com' },
    { id: '2', name: 'amfori BSCI', subtitle: 'Social & Ethical Audit', image: '/images/certifications/bsci.png', link: 'https://www.amfori.org/content/amfori-bsci' },
    { id: '3', name: 'SEDEX SMETA', subtitle: 'Supply Chain Transparency', image: '/images/certifications/sedex.png', link: 'https://www.sedex.com' },
    { id: '4', name: 'WRAP Certified', subtitle: 'Lawful & Ethical Production', image: '/images/certifications/wrap.png', link: 'https://wrapcompliance.org' },
    { id: '5', name: 'GOTS Organic', subtitle: 'Global Organic Textile', image: '/images/certifications/gots.png', link: 'https://www.global-standard.org' },
    { id: '6', name: 'ISO 9001:2015', subtitle: 'Quality Management System', image: '/images/certifications/iso9001.svg', link: 'https://www.iso.org/iso-9001' },
    { id: '7', name: 'Fair Wear Foundation', subtitle: 'Fair Labor & Safe Workplace', image: '/images/certifications/fairwear.png', link: 'https://www.fairwear.org' },
    { id: '8', name: 'BGMEA Member', subtitle: 'Registered Apparel Exporter', image: '/images/certifications/bgmea.svg', link: 'https://www.bgmea.com.bd' }
];

const COMPLIANCE_PILLARS = [
    {
        icon: <ShieldCheck size={18} className="text-secondary" />,
        title: 'AQL 2.5 Inspection Standard',
        desc: 'Strict inline and final AQL 2.5 / 1.5 quality checks for zero-defect exports.'
    },
    {
        icon: <Leaf size={18} className="text-secondary" />,
        title: 'EU REACH & US CPSIA Tested',
        desc: 'Certified chemical-safe, azo-free and non-toxic dyes on all fabrics.'
    },
    {
        icon: <Award size={18} className="text-secondary" />,
        title: '100% Social Compliance',
        desc: 'Fair living wages, safe environments, and zero child or forced labor.'
    },
    {
        icon: <Globe2 size={18} className="text-secondary" />,
        title: 'Global Retailer Benchmark',
        desc: 'Engineered to match the exacting quality specifications of top international brands.'
    }
];

export default function Certifications({ data, headings }: CertProps) {
    const [certs, setCerts] = useState<Certification[]>(DEFAULT_CERTS);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Enrich with default image paths if empty
                    const enriched = parsed.map(c => {
                        const defaultMatch = DEFAULT_CERTS.find(dc => dc.name.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(dc.name.toLowerCase()));
                        return {
                            ...c,
                            subtitle: c.subtitle || defaultMatch?.subtitle || 'Audited Benchmark',
                            image: c.image || defaultMatch?.image || ''
                        };
                    });
                    setCerts(enriched);
                } else {
                    setCerts(DEFAULT_CERTS);
                }
            } catch (e) {
                setCerts(DEFAULT_CERTS);
            }
        } else if (Array.isArray(data) && data.length > 0) {
            setCerts(data);
        } else {
            setCerts(DEFAULT_CERTS);
        }
    }, [data]);

    if (!certs || certs.length === 0) return null;

    // Double/triple the array to ensure smooth infinite marquee scroll
    const marqueeCerts = [...certs, ...certs, ...certs];

    return (
        <section className="py-20 bg-slate-50 dark:bg-dark-bg/60 border-y border-gray-100 dark:border-gray-800/80 transition-colors duration-300 overflow-hidden relative">
            
            {/* Background ambient lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-secondary/5 blur-[120px] pointer-events-none -z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-bold tracking-wider uppercase text-[11px] mb-3 border border-primary/20">
                        <ShieldCheck size={14} />
                        {headings?.certifications_label || 'Compliance & Production Standards'}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
                        {headings?.certifications_heading || 'Engineered to the Standards of Leading Global Apparel Brands'}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {headings?.certifications_subheading || 'We manufacture apparel strictly aligned with world-class quality benchmarks, zero-defect AQL 2.5 standards, and comprehensive social and environmental audits. Our manufacturing units produce garments that meet the exact quality and compliance demands of premier European, American, and international retailers.'}
                    </p>
                    <div className="w-20 h-1 bg-secondary mx-auto mt-6 rounded-full" />
                </div>

                {/* 4 Compliance Pillars Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {COMPLIANCE_PILLARS.map((pillar, i) => (
                        <div key={i} className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm flex items-start gap-3 transition-all hover:border-secondary/50">
                            <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 mt-0.5">
                                {pillar.icon}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-1">
                                    {pillar.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {pillar.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Marquee Logo Slider Container */}
                <div className="relative w-full overflow-hidden flex items-center py-4 bg-white/80 dark:bg-dark-surface/60 rounded-2xl border border-gray-200/60 dark:border-gray-800 backdrop-blur-sm shadow-sm">

                    {/* Gradient Fades for Smooth Illusion */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-white dark:from-dark-surface to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-white dark:from-dark-surface to-transparent z-10 pointer-events-none" />

                    {/* Scrolling Track */}
                    <div className="flex shrink-0 animate-marquee items-center gap-8 md:gap-14 hover:pause-animation">
                        {marqueeCerts.map((cert, idx) => (
                            <a
                                key={cert.id + '-' + idx}
                                href={cert.link || '#'}
                                target={cert.link ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 hover:border-secondary/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0 shadow-2xs"
                                title={cert.name}
                            >
                                {cert.image ? (
                                    <div className="relative h-12 w-28 md:h-14 md:w-32 flex items-center justify-center">
                                        <Image
                                            src={cert.image}
                                            alt={cert.name}
                                            fill
                                            className="object-contain grayscale group-hover:grayscale-0 opacity-75 group-hover:opacity-100 transition-all duration-300"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 py-1 px-2">
                                        <Award size={20} className="text-secondary" />
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-secondary transition-colors">{cert.name}</p>
                                            {cert.subtitle && <p className="text-[10px] text-gray-400">{cert.subtitle}</p>}
                                        </div>
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes marquee {
                        from { transform: translateX(0); }
                        to { transform: translateX(calc(-100% / 3)); }
                    }
                    .animate-marquee {
                        animation: marquee 30s linear infinite;
                    }
                    .hover\\:pause-animation:hover {
                        animation-play-state: paused;
                    }
                `}} />

            </div>
        </section>
    );
}
