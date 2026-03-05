'use client';

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface FeatureCard {
    id: string;
    icon: string;
    title: string;
    description: string;
}

interface WhyChooseUsProps {
    data: any;
}

export default function WhyChooseUs({ data }: WhyChooseUsProps) {
    const [features, setFeatures] = useState<FeatureCard[]>([]);

    useEffect(() => {
        if (data && typeof data === 'string') {
            try {
                setFeatures(JSON.parse(data));
            } catch (e) {
                console.error("WhyChooseUs data parse error");
            }
        } else if (Array.isArray(data)) {
            setFeatures(data);
        }
    }, [data]);

    if (!features || features.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50/50 dark:bg-dark-surface/50 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300 relative overflow-hidden">

            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <span className="text-secondary font-bold tracking-widest uppercase text-xs md:text-sm mb-3 block">Corporate Advantage</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-heading">
                        Why Partner With Us
                    </h2>
                    <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Leading global sourcing and manufacturing excellence with a commitment to quality, sustainability, and transparency.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-8 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, idx) => {
                        const IconComponent = (Icons as any)[feature.icon] || Icons.CheckCircle;

                        return (
                            <div
                                key={feature.id || idx}
                                className="group bg-white dark:bg-dark-bg p-8 rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Hover Gradient border */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110 shadow-sm">
                                        <IconComponent size={32} strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
