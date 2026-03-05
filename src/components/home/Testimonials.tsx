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
}

interface TestimonialProps {
    data: any;
}

export default function Testimonials({ data }: TestimonialProps) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                setTestimonials(JSON.parse(data));
            } catch (e) {
                console.error("Testimonials data parse error");
            }
        } else if (Array.isArray(data)) {
            setTestimonials(data);
        }
    }, [data]);

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    if (!testimonials || testimonials.length === 0) return null;

    const nextSlide = () => setCurrentIdx((p) => (p + 1) % testimonials.length);
    const prevSlide = () => setCurrentIdx((p) => (p - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-24 bg-white dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
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

                    <div className="relative overflow-hidden min-h-[280px] md:min-h-[200px]">
                        {testimonials.map((test, idx) => (
                            <div
                                key={test.id || idx}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex flex-col items-center text-center
                                ${idx === currentIdx ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-20 z-0 pointer-events-none'}`}
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />)}
                                </div>

                                <blockquote className="text-xl md:text-2xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl mb-10">
                                    "{test.quote}"
                                </blockquote>

                                <div className="mt-auto flex flex-col items-center">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-primary shadow-md">
                                        <Image
                                            src={test.avatar || '/placeholder-avatar.jpg'}
                                            alt={test.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
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
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="flex gap-2">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIdx(idx)}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-8 bg-primary shadow-sm' : 'w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary dark:hover:text-primary transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
