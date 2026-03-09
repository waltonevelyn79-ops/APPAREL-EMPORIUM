'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Certification {
    id: string;
    name: string;
    image: string;
    link: string;
}

interface CertProps {
    data: any;
    headings?: { certifications_label?: string };
}

export default function Certifications({ data, headings }: CertProps) {
    const [certs, setCerts] = useState<Certification[]>([]);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                setCerts(JSON.parse(data));
            } catch (e) {
                console.error("Cert data parse error");
            }
        } else if (Array.isArray(data)) {
            setCerts(data);
        }
    }, [data]);

    if (!certs || certs.length === 0) return null;

    // Double the array to ensure smooth infinite marquee scroll
    const marqueeCerts = [...certs, ...certs, ...certs];

    return (
        <section className="py-16 bg-white dark:bg-dark-bg border-y border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="text-center mb-10">
                    <span className="text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase text-xs">
                        {headings?.certifications_label || 'Certified By Leading Global Standards'}
                    </span>
                </div>

                {/* Marquee Container */}
                <div className="relative w-full overflow-hidden flex items-center">

                    {/* Gradient Fades for Smooth Illusion */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-dark-bg to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-dark-bg to-transparent z-10 pointer-events-none"></div>

                    {/* Scrolling Track */}
                    <div className="flex shrink-0 animate-marquee items-center gap-16 md:gap-24 hover:pause-animation">
                        {marqueeCerts.map((cert, idx) => (
                            <a
                                key={cert.id + '-' + idx}
                                href={cert.link || '#'}
                                target={cert.link ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="relative h-16 w-32 md:h-20 md:w-40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 flex-shrink-0"
                                title={cert.name}
                            >
                                <Image
                                    src={cert.image || '/placeholder-cert.jpg'}
                                    alt={cert.name}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
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
                        animation: marquee 25s linear infinite;
                    }
                    .hover\\:pause-animation:hover {
                        animation-play-state: paused;
                    }
                `}} />

            </div>
        </section>
    );
}

