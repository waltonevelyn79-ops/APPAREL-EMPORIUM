'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const { settings } = useSettings();

    // 1. Initialize Dark/Light Mode
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme;
        if (stored) {
            setTheme(stored);
            if (stored === 'dark') document.documentElement.classList.add('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    // 2. Load Google Fonts dynamically if custom fonts are chosen
    useEffect(() => {
        if (!settings.heading_font && !settings.body_font) return;

        const fontsToLoad = new Set<string>();
        if (settings.heading_font) fontsToLoad.add(settings.heading_font);
        if (settings.body_font) fontsToLoad.add(settings.body_font);

        if (fontsToLoad.size > 0) {
            const fontFamilies = Array.from(fontsToLoad).map(f => f.replace(/ /g, '+') + ':wght@300;400;500;600;700').join('&family=');
            const url = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;

            // Avoid duplicate links
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.href = url;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        }
    }, [settings.heading_font, settings.body_font]);

    // 3. Inject CSS Variables Dynamically from Database
    useEffect(() => {
        if (!settings || Object.keys(settings).length === 0) return;

        const root = document.documentElement;

        // Colors
        if (settings.primary_color) root.style.setProperty('--color-primary', settings.primary_color);
        if (settings.secondary_color) root.style.setProperty('--color-secondary', settings.secondary_color);
        if (settings.accent_color) root.style.setProperty('--color-accent', settings.accent_color);
        if (settings.light_bg) root.style.setProperty('--color-light-bg', settings.light_bg);
        if (settings.dark_bg) root.style.setProperty('--color-dark-bg', settings.dark_bg);

        // Typography (Wrap in quotes for CSS font-family consistency)
        if (settings.heading_font) root.style.setProperty('--font-heading', `"${settings.heading_font}", sans-serif`);
        if (settings.body_font) root.style.setProperty('--font-body', `"${settings.body_font}", sans-serif`);

    }, [settings]);

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme used outside ThemeProvider');
    return context;
};

