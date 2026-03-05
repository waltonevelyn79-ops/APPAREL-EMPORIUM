'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    settings: Record<string, string>;
    updateSetting: (key: string, value: string) => Promise<void>;
    updateSettings: (newSettings: Record<string, string>) => Promise<void>;
    getSettingValue: (key: string) => string;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSetting = async (key: string, value: string) => {
        await updateSettings({ [key]: value });
    };

    const updateSettings = async (newSettings: Record<string, string>) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (res.ok) {
                setSettings(prev => ({ ...prev, ...newSettings }));
            }
        } catch (error) {
            console.error("Failed to update settings", error);
            throw error;
        }
    };

    const getSettingValue = (key: string) => {
        return settings[key] || '';
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, getSettingValue, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
