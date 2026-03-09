'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
    id: string;
    quote: string;
    name: string;
    company: string;
    country: string;
    avatar: string;
    rating?: number;
}

interface TestimonialProps {
    data: any;
}

// Default testimonials shown if no data is configured in admin
const defaultTestimonials: Testimonial[] = [
    {
        id: '1',
        name: 'Luca Bianchi',
        company: 'ModeHaus GmbH',
        country: 'Germany',
        quote: 'Apparel Emporium has been our sourcing partner for 3+ years. Their quality control and on-time delivery are second to none. Our customers consistently love the fabric quality and craftsmanship.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Luca',
        rating: 5
    },
    {
        id: '2',
        name: 'Sophie Laurent',
        company: 'Chic Parisienne',
        country: 'France',
        quote: 'The team at Apparel Emporium is incredibly professional. From sampling to bulk production, every detail is managed with precision. We have doubled our order volume with full confidence.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sophie',
        rating: 5
    },
    {
        id: '3',
        name: 'James Thornton',
        company: 'BritStyle Group',
        country: 'United Kingdom',
        quote: 'Exceptional sourcing capabilities and transparent communication. We were impressed by their compliance certifications and ethical manufacturing standards. Highly recommended for any global brand.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=James',
        rating: 5
    },
    {
        id: '4',
        name: 'Yuki Nakamura',
        company: 'Harajuku Textiles Co.',
        country: 'Japan',
        quote: 'The precision in stitching and colour matching is remarkable. Apparel Emporium understands Japanese quality standards perfectly. Their attention to detail truly sets them apart from competitors.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Yuki',
        rating: 5
    },
    {
        id: '5',
        name: 'Maria Gonzalez',
        company: 'VivaWear International',
        country: 'Spain',
        quote: 'We have sourced from many Bangladeshi exporters, but Apparel Emporium stands out for both quality and professionalism. Their logistics team ensures smooth, timely deliveries every single time.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Maria',
        rating: 5
    },
    {
        id: '6',
        name: 'Erik Strom',
        company: 'NordFashion AB',
        country: 'Sweden',
        quote: 'Their commitment to sustainable and ethical production aligns perfectly with our brand values. A truly reliable partner for premium Scandinavian activewear and sportswear collections.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Erik',
        rating: 5
    }
];

export default function Testimonials({ data }: TestimonialProps) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

    useEffect(() => {
        let parsed: Testimonial[] | null = null;

        if (data && typeof data === 'string' && data.length > 5) {
            try {
                const result = JSON.parse(data);
                if (Array.isArray(result) && result.length > 0) {
                    parsed = result;
                }
            } catch (e) {
                console.error('Testimonials data parse error');
            }
        } else if (Array.isArray(data) && data.length > 0) {
            parsed = data;
        }

        // Use data from settings if available, otherwise use defaults
        setTestimonials(parsed && parsed.length > 0 ? parsed : defaultTestimonials);
    }, [data]);

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextSlide = () => setCurrentIdx((p) => (p + 1) % testimonials.length);
    const prevSlide = () => setCurrentIdx((p) => (p - 1 + testimonials.length) % testimonials.length);

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-24 bg-white dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/2" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">Client Success Stories</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-heading">
                        Trusted Globally
                    </h2>
                    <div className="w-24 h-1 bg-secondary mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-dark-surface rounded-3xl p-8 md:p-14 shadow-xl border border-gray-100 dark:border-gray-800 relative">
                    <Quote className="absolute top-8 left-8 text-primary/10 w-24 h-24 -scale-y-100 -scale-x-100 rotate-180" />

                    <div className="relative overflow-hidden min-h-[280px] md:min-h-[220px]">
                        {testimonials.map((test, idx) => (
                            <div
                                key={test.id || idx}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex flex-col items-center text-center
                                ${idx === currentIdx ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-20 z-0 pointer-events-none'}`}
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={20} className={`${i <= (test.rating || 5) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                </div>

                                <blockquote className="text-lg md:text-xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl mb-10">
                                    &ldquo;{test.quote}&rdquo;
                                </blockquote>

                                <div className="mt-auto flex flex-col items-center">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-primary shadow-md bg-gray-100 flex items-center justify-center">
                                        {!imgErrors.has(idx) ? (
                                            <img
                                                src={test.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${test.name}`}
                                                alt={test.name}
                                                className="w-full h-full object-cover"
                                                onError={() => setImgErrors(prev => new Set([...prev, idx]))}
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">
                                                {test.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg font-heading">
                                        {test.name}
                                    </div>
                                    <div className="text-sm font-medium text-primary uppercase tracking-wider">
                                        {test.company} <span className="text-gray-400 mx-1">•</span> {test.country}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-12">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary dark:hover:text-primary transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
                                aria-label="Previous review"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="flex gap-2">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIdx(idx)}
                                        aria-label={`Go to review ${idx + 1}`}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-8 bg-primary shadow-sm' : 'w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary dark:hover:text-primary transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
                                aria-label="Next review"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>

                {/* All reviews mini grid */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {testimonials.map((test, idx) => (
                        <button
                            key={test.id}
                            onClick={() => setCurrentIdx(idx)}
                            className={`text-left p-4 rounded-2xl border transition-all duration-200 ${idx === currentIdx
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                : 'border-gray-100 dark:border-gray-800 hover:border-primary/30 bg-white dark:bg-dark-surface'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                                    {!imgErrors.has(idx) ? (
                                        <img
                                            src={test.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${test.name}`}
                                            alt={test.name}
                                            className="w-full h-full object-cover"
                                            onError={() => setImgErrors(prev => new Set([...prev, idx]))}
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-primary">
                                            {test.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{test.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{test.country}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="fill-yellow-500 text-yellow-500" />)}
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </section>
    );
}
