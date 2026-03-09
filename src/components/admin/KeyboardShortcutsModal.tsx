'use client';

import React, { useState, useEffect } from 'react';
import { Command, X } from 'lucide-react';

const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], desc: 'Open Quick Search' },
    { keys: ['Ctrl', 'N'], desc: 'Create New Product' },
    { keys: ['Ctrl', 'S'], desc: 'Save Form/Page' },
    { keys: ['Escape'], desc: 'Close Modal' },
    { keys: ['?'], desc: 'Show Keyboard Shortcuts' }
];

export default function KeyboardShortcutsModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const toggleHelp = () => setIsOpen(prev => !prev);
        const closeModals = () => setIsOpen(false);

        window.addEventListener('admin-help-shortcuts', toggleHelp);
        window.addEventListener('admin-close-modals', closeModals);

        return () => {
            window.removeEventListener('admin-help-shortcuts', toggleHelp);
            window.removeEventListener('admin-close-modals', closeModals);
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Command className="w-5 h-5 text-primary" /> Keyboard Shortcuts
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                        {SHORTCUTS.map((sc, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {sc.desc}
                                </span>
                                <div className="flex items-center gap-1.5 font-mono text-xs">
                                    {sc.keys.map((key, j) => (
                                        <React.Fragment key={j}>
                                            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm font-bold text-gray-600 dark:text-gray-400">
                                                {key === 'Ctrl' ? (typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl') : key}
                                            </kbd>
                                            {j < sc.keys.length - 1 && <span className="text-gray-400">+</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 text-center text-sm font-medium text-gray-500 border-t border-gray-100 dark:border-gray-800">
                    Navigate the admin dashboard like a pro.
                </div>
            </div>
        </div>
    );
}

