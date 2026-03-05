'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { getAccessibleSidebarItems, SidebarItem } from '@/lib/permissions';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X, LogOut, LayoutDashboard, Bell } from 'lucide-react';

export default function Sidebar() {
    const { role } = usePermission();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);

    // Notification logic
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (role !== 'VIEWER') { // default pre-load state
            setGroups(getAccessibleSidebarItems(role as any));
        }

        const pollNotifications = async () => {
            try {
                const res = await fetch('/api/notifications?unread=true');
                const data = await res.json();
                if (data.notifications) setUnreadCount(data.notifications.length);
            } catch (e) { }
        };
        pollNotifications();
        const interval = setInterval(pollNotifications, 30000);
        return () => clearInterval(interval);
    }, [role]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Simple mapping for lucide-react, would usually be dynamic
    const getIcon = (name: string) => {
        return <LayoutDashboard size={18} />;
    }

    const SidebarContent = () => (
        <div className="h-full flex flex-col pt-4">

            <div className="px-6 mb-8 flex justify-between items-center">
                <Link href="/admin" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl transition-transform group-hover:rotate-12 shadow-lg">
                        G
                    </div>
                    {isOpen && <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white font-heading">GlobalStitch</span>}
                </Link>
                {isOpen && (
                    <button className="md:hidden p-2 text-gray-500 hover:text-gray-900" onClick={() => setIsMobileOpen(false)}>
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-20">
                <ul className="space-y-1">
                    {groups.map((item, itemIdx) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <li key={itemIdx}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-primary text-white font-bold shadow-md'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                                    title={!isOpen ? item.label : undefined}
                                >
                                    <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'}`}>
                                        {getIcon(item.icon)}
                                    </div>
                                    {isOpen && <span className="text-sm">{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Bottom User Area */}
            <div className={`p-4 border-t border-gray-200 dark:border-gray-800 shrink-0 ${isOpen ? 'bg-gray-50 dark:bg-dark-bg' : ''}`}>
                <div className="flex items-center gap-3 w-full">
                    <img src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white" />
                    {isOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session?.user?.name || 'Administrator'}</p>
                            <p className="text-xs text-gray-500 font-mono">{role}</p>
                        </div>
                    )}
                    {isOpen && (
                        <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
                {!isOpen && (
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-4 w-full flex justify-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Navbar Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
                <Link href="/admin" className="font-extrabold text-xl font-heading text-primary">GlobalStitch</Link>
                <div className="flex items-center gap-4">
                    <Link href="/admin/notifications" className="relative text-gray-600 dark:text-gray-300">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface">{unreadCount}</span>}
                    </Link>
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-gray-600 dark:text-gray-300">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar Sidebar Map */}
            <aside className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
                {/* Desktop Toggle & Bell */}
                <div className={`absolute top-4 ${isOpen ? 'right-4' : 'left-0 justify-center w-full'} flex items-center gap-2 z-50`}>
                    <Link href="/admin/notifications" className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-surface animate-pulse"></span>}
                    </Link>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Menu size={18} />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Mobile Overlay Sidebar */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
                    <aside className="relative w-72 max-w-[80%] h-full bg-white dark:bg-dark-surface shadow-2xl animate-in slide-in-from-left">
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    );
}
