'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePermission } from '@/hooks/usePermission';
import { Bell, Check, Trash2, Mail, FileText, AlertCircle, MessageSquare } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const { role } = usePermission();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (role !== 'VIEWER') {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [role]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=5');
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                const countRes = await fetch('/api/notifications?unread=true');
                const countData = await countRes.json();
                if (countData.notifications) setUnreadCount(countData.notifications.length);
            }
        } catch (e) { }
    };

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isRead: true })
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (e) { }
    };

    const markAllRead = async () => {
        try {
            await Promise.all(
                notifications.filter(n => !n.isRead).map(n =>
                    fetch('/api/notifications', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: n.id, isRead: true })
                    })
                )
            );
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'INQUIRY': return <MessageSquare size={16} className="text-blue-500" />;
            case 'RFQ': return <FileText size={16} className="text-purple-500" />;
            case 'SYSTEM': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 60) return `${min}m ago`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (role === 'VIEWER') return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-bg">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary font-bold hover:underline py-1">Mark all read</button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 font-sans text-sm">No recent alerts.</div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {notifications.map(n => (
                                    <li
                                        key={n.id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!n.isRead ? 'bg-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className={`text-sm truncate pr-2 ${!n.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
                                                <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap pt-0.5 shrink-0">{getTimeAgo(n.createdAt)}</span>
                                            </div>
                                            <p className={`text-xs line-clamp-2 ${!n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                                        </div>
                                        {!n.isRead && <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link
                        href="/executive-portal-aelbd/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 bg-gray-50 dark:bg-dark-bg text-center text-xs font-bold text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition border-t border-gray-100 dark:border-gray-800"
                    >
                        View Full Alert History &rarr;
                    </Link>
                </div>
            )}
        </div>
    );
}

