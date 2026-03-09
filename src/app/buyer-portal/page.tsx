'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/hooks/usePermission';
import { ShoppingBag, ShoppingCart, MessageSquare, ClipboardList, Package, User, Clock, ChevronRight } from 'lucide-react';

export default function BuyerDashboardPage() {
    const { data: session } = useSession();

    const stats = [
        { label: 'Active RFQs', value: '4', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        { label: 'Open Inquiries', value: '2', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
        { label: 'Quotations Received', value: '1', icon: ShoppingBag, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/10' },
        { label: 'Saved Products', value: '12', icon: Package, color: 'text-primary', bg: 'bg-primary/5 dark:bg-primary/10' },
    ];

    return (
        <div className="space-y-12">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-primary/50 transition-all duration-300">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h4>
                        <p className="text-3xl font-black text-gray-900 dark:text-white font-heading">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Recommendations */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black font-heading">Recommended For You</h3>
                        <Link href="/products" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">Explore Catalog <ChevronRight size={16} /></Link>
                    </div>

                    <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 p-8 text-center py-20">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Build Your Sourcing Profile</h4>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">Update your preferences and business details in the settings to get tailored product recommendations from our factories.</p>
                        <Link href="/buyer-portal/settings" className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all inline-block">Complete Your Profile</Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-8">
                    <h3 className="text-2xl font-black font-heading">Sourcing Activity</h3>
                    <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
                        <div className="space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-dark-bg flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">RFQ #829{i} Status Updated</p>
                                        <p className="text-xs text-gray-400 mt-1">Your request for Premium T-Shirts has been moved to "In Review".</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-300 mt-2">2 Hours Ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
