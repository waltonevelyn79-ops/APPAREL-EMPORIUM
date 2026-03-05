'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-yellow-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            aria-label="Toggle Dark Mode"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun
                    className={`absolute inset-0 transition-all duration-300 transform ${theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}
                    size={20}
                />
                <Moon
                    className={`absolute inset-0 transition-all duration-300 transform ${theme === 'light' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}
                    size={20}
                />
            </div>
        </button>
    );
}
