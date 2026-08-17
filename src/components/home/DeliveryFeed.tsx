'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, CheckCircle2, Clock, Globe, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface DeliveryUpdate {
    id: string;
    title: string;
    description: string;
    category: string;
    buyer: string;
    buyerCountry: string;
    quantity: string;
    status: 'SHIPPED' | 'DELIVERED' | 'IN_PRODUCTION' | 'COMPLETED';
    imageUrl?: string;
    createdAt: string;
}

const statusConfig: Record<DeliveryUpdate['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    IN_PRODUCTION: {
        label: 'In Production',
        color: 'text-amber-400',
        bg: 'bg-amber-400/10 border-amber-400/30',
        icon: <Clock size={12} className="text-amber-400" />,
    },
    SHIPPED: {
        label: 'Shipped',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/30',
        icon: <Truck size={12} className="text-blue-400" />,
    },
    DELIVERED: {
        label: 'Delivered',
        color: 'text-green-400',
        bg: 'bg-green-400/10 border-green-400/30',
        icon: <CheckCircle2 size={12} className="text-green-400" />,
    },
    COMPLETED: {
        label: 'Completed',
        color: 'text-primary',
        bg: 'bg-primary/10 border-primary/30',
        icon: <CheckCircle2 size={12} className="text-primary" />,
    },
};

// Category-based placeholder images (high-quality garment stock photos)
const categoryPlaceholders: Record<string, string> = {
    'Knitwear': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop&q=80',
    'Woven': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=300&fit=crop&q=80',
    'Activewear': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=300&fit=crop&q=80',
    'Kidswear': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=300&fit=crop&q=80',
    'Denim': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&q=80',
    'Sweater': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop&q=80',
    'default': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop&q=80',
};

function getPlaceholderImage(category: string): string {
    return categoryPlaceholders[category] || categoryPlaceholders['default'];
}

// Country flag emoji helper
function getCountryFlag(country: string): string {
    const flags: Record<string, string> = {
        'Sweden': '🇸🇪', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'UAE': '🇦🇪',
        'United Kingdom': '🇬🇧', 'Germany': '🇩🇪', 'USA': '🇺🇸', 'France': '🇫🇷',
        'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Netherlands': '🇳🇱', 'Spain': '🇪🇸',
        'Italy': '🇮🇹', 'Denmark': '🇩🇰', 'Norway': '🇳🇴', 'Finland': '🇫🇮',
    };
    return flags[country] || '🌍';
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FeedCard({ item }: { item: DeliveryUpdate }) {
    const status = statusConfig[item.status] || statusConfig.COMPLETED;
    const imgSrc = item.imageUrl || getPlaceholderImage(item.category);
    const [imgError, setImgError] = useState(false);

    return (
        <div className="flex-none w-[300px] sm:w-[340px] bg-white/5 border border-white/10 hover:border-primary/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:bg-white/[0.08] group cursor-default hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
            {/* Product Image */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-800/60 flex-shrink-0">
                {!imgError ? (
                    <img
                        src={imgSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                        <ShoppingBag size={36} />
                        <span className="text-xs font-medium text-slate-500">{item.category}</span>
                    </div>
                )}
                {/* Status badge on image */}
                <div className="absolute top-3 right-3">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm ${status.bg} ${status.color}`}>
                        {status.icon}
                        {status.label}
                    </span>
                </div>
                {/* Category chip */}
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                        {item.category}
                    </span>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col gap-2.5 flex-1">
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
                    {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 flex-1">
                    {item.description}
                </p>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.07] mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm leading-none">{getCountryFlag(item.buyerCountry)}</span>
                            <span className="text-[11px] font-semibold text-slate-300">{item.buyerCountry}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                            <Package size={10} />
                            <span className="text-[10px] font-medium">{item.quantity}</span>
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium tabular-nums">
                        {timeAgo(item.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryFeed() {
    const [items, setItems] = useState<DeliveryUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const trackRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number | null>(null);
    const pausedRef = useRef(false);
    const posRef = useRef(0);

    useEffect(() => {
        fetch('/api/delivery-feed')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (items.length === 0) return;
        const track = trackRef.current;
        if (!track) return;
        const speed = 0.5;
        const animate = () => {
            if (!pausedRef.current && track) {
                posRef.current -= speed;
                const halfWidth = track.scrollWidth / 2;
                if (Math.abs(posRef.current) >= halfWidth) {
                    posRef.current = 0;
                }
                track.style.transform = `translateX(${posRef.current}px)`;
            }
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [items]);

    if (loading) {
        return (
            <section className="py-16 bg-slate-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
            </section>
        );
    }

    if (items.length === 0) return null;

    const doubled = [...items, ...items];

    return (
        <section className="py-14 bg-slate-950 border-y border-white/5 overflow-hidden relative" id="live-feed">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                            <span className="text-green-400 font-bold text-xs uppercase tracking-widest">Live Updates</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white font-heading">
                            Recent Deliveries &amp; Production
                        </h2>
                        <p className="text-slate-500 text-xs mt-1.5 max-w-lg">
                            Real-time updates on active orders, recent shipments and completed deliveries to our global buyers.
                        </p>
                    </div>
                    <a
                        href="/contact"
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-xl text-xs font-bold transition-all"
                    >
                        Get Your Order Started
                        <ChevronRight size={14} />
                    </a>
                </div>
            </div>

            <div
                className="relative"
                onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
            >
                <div className="flex" ref={trackRef} style={{ willChange: 'transform' }}>
                    {doubled.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="px-3">
                            <FeedCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
