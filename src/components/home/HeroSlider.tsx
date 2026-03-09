'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import Link from 'next/link';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    image: string;
}

interface HeroSliderProps {
    data: any;
}

export default function HeroSlider({ data }: HeroSliderProps) {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                setSlides(JSON.parse(data));
            } catch (e) {
                console.error("Hero slider data parse error");
            }
        } else if (Array.isArray(data)) {
            setSlides(data);
        }
    }, [data]);

    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length, isPaused]);

    const nextSlide = () => setCurrentIdx((p) => (p + 1) % slides.length);
    const prevSlide = () => setCurrentIdx((p) => (p - 1 + slides.length) % slides.length);

    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) nextSlide();
        if (touchStart - touchEnd < -75) prevSlide();
    };

    if (slides.length === 0) return null;

    return (
        <section
            className="relative w-full h-[80vh] min-h-[500px] overflow-hidden group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {slides.map((slide, idx) => (
                <div
                    key={slide.id || idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <Image
                        src={slide.image || '/placeholder-hero.jpg'}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-black/50" />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`max-w-4xl px-4 text-center transform transition-all duration-1000 delay-100 pointer-events-auto
                            ${idx === currentIdx ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                        >
                            <h2
                                className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg font-heading"
                                dangerouslySetInnerHTML={{ __html: slide.title }}
                            />
                            <p
                                className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md"
                                dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                            />
                            {slide.ctaText && slide.ctaLink && (
                                <Link
                                    href={slide.ctaLink}
                                    className="inline-block bg-primary text-white text-lg font-bold px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgba(var(--color-primary),0.39)] hover:shadow-[0_6px_20px_rgba(var(--color-primary),0.23)] hover:scale-105 transition-all duration-300"
                                >
                                    {slide.ctaText}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-black/20 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-black/20 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIdx(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Play/Pause indicator */}
                    <div className="absolute top-24 left-4 z-20 md:hidden flex">
                        {isPaused ? <Pause className="text-white/50" size={20} /> : <Play className="text-white/50" size={20} />}
                    </div>
                </>
            )}
        </section>
    );
}

