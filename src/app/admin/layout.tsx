'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Bell, Search, Sun, Moon, User, Settings, LogOut, Loader2 } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import KeyboardShortcutsModal from '@/components/admin/KeyboardShortcutsModal';
import QuickSearch from '@/components/admin/QuickSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Enable global keyboard shortcuts
    useKeyboardShortcuts();

    useEffect(() => {
        if (status === 'unauthenticated' && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [status, pathname, router]);

    // Close sidebar on navigation in mobile
    useEffect(() => {
        setIsSidebarOpen(false);
        setIsUserMenuOpen(false);
    }, [pathname]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    if (status === 'unauthenticated' || pathname === '/admin/login') {
        return <>{children}</>;
    }

    const breadcrumbs = pathname.split('/').filter(p => p && p !== 'admin');

    const triggerQuickSearch = () => window.dispatchEvent(new CustomEvent('admin-quick-search-toggle'));

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-dark-bg overflow-hidden text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            {/* Mobile overlays */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar Component */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Global Components */}
                <QuickSearch />
                <KeyboardShortcutsModal />

                {/* Topbar */}
                <header className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumbs */}
                        <div className="hidden sm:flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
                                    <span className={`capitalize truncate ${idx === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white font-bold' : 'hover:text-primary transition-colors'}`}>
                                        {crumb.replace(/-/g, ' ')}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Quick Search Trigger */}
                        <button
                            onClick={triggerQuickSearch}
                            className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-500 dark:text-gray-400 group border border-transparent dark:border-gray-700"
                        >
                            <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                            <span>Quick Search...</span>
                            <kbd className="hidden md:inline-block font-mono text-[10px] font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 ml-2">
                                {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
                            </kbd>
                        </button>

                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-surface animate-pulse"></span>
                        </button>

                        <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors">
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="relative ml-2">
                            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors border border-gray-200 dark:border-gray-700">
                                {(session?.user as any)?.avatar ? (
                                    <img src={(session?.user as any).avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2 origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-2 truncate">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{(session?.user as any)?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{(session?.user as any)?.email}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mt-1">{(session?.user as any)?.role}</p>
                                    </div>
                                    <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Settings className="w-4 h-4" /> Profile Settings
                                    </Link>
                                    <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                        <LogOut className="w-4 h-4" /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth" id="admin-main-scroll">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
