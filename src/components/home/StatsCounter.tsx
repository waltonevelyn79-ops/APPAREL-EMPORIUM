'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';

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

export default function StatsCounter({ data }: StatsCounterProps) {
    const [stats, setStats] = useState<Stat[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                setStats(JSON.parse(data));
            } catch (e) {
                console.error("Stats counter data parse error");
            }
        } else if (Array.isArray(data)) {
            setStats(data);
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
        <section ref={sectionRef} className="py-20 bg-primary dark:bg-dark-surface relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, idx) => {
                        const IconComponent = (Icons as any)[stat.icon] || Icons.Activity;

                        return (
                            <div key={stat.id || idx} className="text-center group">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-secondary mb-6 group-hover:bg-secondary group-hover:text-primary transition-all duration-500 transform group-hover:-translate-y-2 shadow-lg backdrop-blur-sm">
                                    <IconComponent size={32} />
                                </div>

                                <div className="text-4xl md:text-5xl font-extrabold text-white font-heading mb-2 flex items-center justify-center">
                                    <AnimatedNumber value={stat.number} isVisible={isVisible} />
                                    <span className="text-secondary ml-1">{stat.suffix}</span>
                                </div>

                                <p className="text-primary-foreground/80 dark:text-gray-300 font-medium text-sm md:text-base tracking-wide uppercase">
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
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

