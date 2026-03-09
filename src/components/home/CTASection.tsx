'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CTAData {
    heading: string;
    subheading: string;
    ctaText: string;
    ctaLink: string;
    image: string;
}

interface CTAProps {
    data: any;
}

export default function CTASection({ data }: CTAProps) {
    const [cta, setCta] = useState<CTAData | null>(null);

    useEffect(() => {
        if (!data) return;
        if (typeof data === 'string') {
            try {
                setCta(JSON.parse(data));
            } catch (e) {
                console.error("CTA data parse error");
            }
        } else {
            setCta(data);
        }
    }, [data]);

    if (!cta) return null;

    return (
        <section className="relative py-32 bg-primary dark:bg-dark-bg transition-colors duration-300">
            {/* Background Texture/Image */}
            <div className="absolute inset-0">
                <Image
                    src={cta.image || '/placeholder-cta.jpg'}
                    alt="Ready to Start"
                    fill
                    className="object-cover"
                    unoptimized
                />
                {/* Heavy Multi-Stop Gradient Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 dark:from-black/95 dark:via-black/80 dark:to-black/40 mix-blend-multiply" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center md:text-left">
                <div className="max-w-3xl">
                    <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        Take The Next Step
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 font-heading leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        {cta.heading || 'Let\'s Create Something Extraordinary'}
                    </h2>
                    <p className="text-xl text-gray-200 mb-10 leading-relaxed font-light drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        {cta.subheading || 'Partner with us to elevate your brand. From sourcing the finest materials to full-scale manufacturing, our experts are ready.'}
                    </p>

                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
                        <Link
                            href={cta.ctaLink || '/contact'}
                            className="inline-flex items-center justify-center bg-white text-primary font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                        >
                            {cta.ctaText || 'Get Started Now'}
                            <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative diagonal accent line */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 border-[16px] border-secondary/20 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }}></div>
        </section>
    );
}

