'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/hooks/usePermission';
import Sidebar from '@/components/admin/Sidebar';
import { User, Bell, LayoutDashboard, ShoppingBag, Settings, LogOut, Package, ClipboardList, MessageSquare } from 'lucide-react';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { role } = usePermission();

    if (!session || role !== 'BUYER') {
        // This is caught by middleware but for safety
        return null;
    }

    const navItems = [
        { label: 'Overview', icon: LayoutDashboard, href: '/buyer-portal' },
        { label: 'My RFQs', icon: ClipboardList, href: '/buyer-portal/rfqs' },
        { label: 'My Inquiries', icon: MessageSquare, href: '/buyer-portal/inquiries' },
        { label: 'Manufacturer Catalog', icon: Package, href: '/products' },
        { label: 'Settings', icon: Settings, href: '/buyer-portal/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-800 flex flex-col pt-8">
                <div className="px-6 mb-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black text-xs transition-transform group-hover:rotate-12 shadow-lg">
                            AE
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white font-heading uppercase">Buyer Portal</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-primary transition-all"
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <img
                            src={session.user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user?.name}`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{session.user?.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase">Buyer</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-xl font-bold font-heading">Welcome Back, {session.user?.name?.split(' ')[0]}</h2>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
