'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { usePermission } from '@/hooks/usePermission';
import { Save, AlertTriangle, ArrowRight, LayoutTemplate } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

const FONTS = [
    'Inter', 'Poppins', 'Roboto', 'Montserrat',
    'Playfair Display', 'Lato', 'Open Sans', 'Raleway'
];

export default function ThemeManagerPage() {
    const { settings, updateSettings } = useSettings();
    const { role } = usePermission();

    const [formData, setFormData] = useState({
        primary_color: '#1B365D',
        secondary_color: '#C8A962',
        accent_color: '#2E8B57',
        light_bg: '#F8F9FA',
        dark_bg: '#0F172A',
        heading_font: 'Inter',
        body_font: 'Inter',
        logo_light: '',
        logo_dark: '',
        favicon: '',
        og_image: ''
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            setFormData({
                primary_color: settings.primary_color || '#1B365D',
                secondary_color: settings.secondary_color || '#C8A962',
                accent_color: settings.accent_color || '#2E8B57',
                light_bg: settings.light_bg || '#F8F9FA',
                dark_bg: settings.dark_bg || '#0F172A',
                heading_font: settings.heading_font || 'Inter',
                body_font: settings.body_font || 'Inter',
                logo_light: settings.logo_light || '',
                logo_dark: settings.logo_dark || '',
                favicon: settings.favicon || '',
                og_image: settings.og_image || ''
            });

            // Set initial root CSS variables for preview
            updateCSSVariables({
                primary_color: settings.primary_color,
                secondary_color: settings.secondary_color,
                accent_color: settings.accent_color,
                light_bg: settings.light_bg,
                dark_bg: settings.dark_bg,
                heading_font: settings.heading_font,
                body_font: settings.body_font
            });
        }
    }, [settings]);

    const updateCSSVariables = (data: Partial<typeof formData>) => {
        const root = document.documentElement;
        if (data.primary_color) root.style.setProperty('--color-primary', data.primary_color);
        if (data.secondary_color) root.style.setProperty('--color-secondary', data.secondary_color);
        if (data.accent_color) root.style.setProperty('--color-accent', data.accent_color);
        if (data.light_bg) root.style.setProperty('--color-light-bg', data.light_bg);
        if (data.dark_bg) root.style.setProperty('--color-dark-bg', data.dark_bg);
        if (data.heading_font) root.style.setProperty('--font-heading', `"${data.heading_font}", sans-serif`);
        if (data.body_font) root.style.setProperty('--font-body', `"${data.body_font}", sans-serif`);
    };

    const handleChange = (key: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // Live preview updates immediately in Document tree
        updateCSSVariables({ [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await updateSettings(formData);
            setMessage({ text: 'Theme settings published successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Failed to publish theme settings.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
                <p className="text-red-600 dark:text-red-300">You must be a Developer or Super Admin to access Theme Manager.</p>
            </div>
        );
    }

    const resetColors = () => {
        handleChange('primary_color', '#1B365D');
        handleChange('secondary_color', '#C8A962');
        handleChange('accent_color', '#2E8B57');
        handleChange('light_bg', '#F8F9FA');
        handleChange('dark_bg', '#0F172A');
        handleChange('heading_font', 'Inter');
        handleChange('body_font', 'Inter');
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <LayoutTemplate className="text-primary" /> Theme Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Control site colors, typography, logos and global design tokens.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={resetColors}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition shadow-sm font-medium"
                    >
                        <Save size={18} />
                        {saving ? 'Publishing...' : 'Publish Theme'}
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 mb-6 rounded-lg font-medium text-sm border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SETTINGS PANELS */}
                <div className="lg:col-span-2 space-y-8">

                    {/* SECTION 1: Colors */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 pb-2 border-b dark:border-gray-800">Color Palette</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { key: 'primary_color', label: 'Primary Brand' },
                                { key: 'secondary_color', label: 'Secondary / UI' },
                                { key: 'accent_color', label: 'Accent / Success' },
                                { key: 'light_bg', label: 'Light Background' },
                                { key: 'dark_bg', label: 'Dark Background' },
                            ].map(item => (
                                <div key={item.key}>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{item.label}</label>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <input
                                            type="color"
                                            value={formData[item.key as keyof typeof formData]}
                                            onChange={(e) => handleChange(item.key as keyof typeof formData, e.target.value)}
                                            className="w-10 h-10 p-0 rounded cursor-pointer border-none bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData[item.key as keyof typeof formData]}
                                            onChange={(e) => handleChange(item.key as keyof typeof formData, e.target.value)}
                                            className="flex-1 w-24 bg-transparent border-none focus:ring-0 font-mono text-sm uppercase p-0 m-0 text-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 2: Typography */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 pb-2 border-b dark:border-gray-800">Typography</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Headings Font</label>
                                <select
                                    value={formData.heading_font}
                                    onChange={(e) => handleChange('heading_font', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-700 mb-4 font-medium"
                                    style={{ fontFamily: `"${formData.heading_font}", sans-serif` }}
                                >
                                    {FONTS.map(font => <option key={font} value={font} style={{ fontFamily: `'${font}', sans-serif` }}>{font}</option>)}
                                </select>
                                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h1 className="text-2xl font-bold mb-2 tracking-tight" style={{ fontFamily: `"${formData.heading_font}", sans-serif`, color: 'var(--color-primary)' }}>Hero Heading Title</h1>
                                    <h3 className="text-lg font-medium" style={{ fontFamily: `"${formData.heading_font}", sans-serif`, color: 'var(--color-secondary)' }}>Section Subtitle H3</h3>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Body Font</label>
                                <select
                                    value={formData.body_font}
                                    onChange={(e) => handleChange('body_font', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-700 mb-4 font-medium"
                                    style={{ fontFamily: `"${formData.body_font}", sans-serif` }}
                                >
                                    {FONTS.map(font => <option key={font} value={font} style={{ fontFamily: `'${font}', sans-serif` }}>{font}</option>)}
                                </select>
                                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm leading-relaxed" style={{ fontFamily: `"${formData.body_font}", sans-serif`, color: 'var(--color-text-light)' }}>
                                        This is a preview of the body typography. The quick brown fox jumps over the lazy dog. Good design is obvious, great design is transparent.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Logos */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 pb-2 border-b dark:border-gray-800">Media Assets</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Light Mode Logo (For Dark Backgrounds)</label>
                                <ImageUploader
                                    value={formData.logo_light}
                                    onUpload={(url: string) => handleChange('logo_light', url)}
                                    folder="logos"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Dark Mode Logo (For Light Backgrounds)</label>
                                <ImageUploader
                                    value={formData.logo_dark}
                                    onUpload={(url: string) => handleChange('logo_dark', url)}
                                    folder="logos"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Favicon (.ico or .png)</label>
                                <ImageUploader
                                    value={formData.favicon}
                                    onUpload={(url: string) => handleChange('favicon', url)}
                                    folder="logos"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Social Card (OG Image)</label>
                                <ImageUploader
                                    value={formData.og_image}
                                    onUpload={(url: string) => handleChange('og_image', url)}
                                    folder="logos"
                                />
                                <p className="text-xs text-gray-400 mt-2">Recommended: 1200x630px JPG.</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* SECTION 4: Live Preview Sticky Dashboard */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col h-[800px]">
                        <div className="bg-gray-100 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 relative">
                            <div className="flex gap-1.5 absolute left-4">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="w-full text-center text-xs font-medium text-gray-500 font-mono tracking-wider">LIVE PREVIEW</div>
                        </div>

                        <div className="flex-1 overflow-y-auto w-full custom-scrollbar" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                            {/* Simulator Canvas */}
                            <div className="w-full relative min-h-full">

                                {/* Header Preview */}
                                <div className="h-16 w-full shadow-sm flex items-center justify-between px-6" style={{ backgroundColor: 'var(--color-primary)' }}>
                                    <div className="font-bold text-lg" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>Brand.</div>
                                    <div className="flex gap-4">
                                        <div className="h-2 w-8 bg-white/30 rounded"></div>
                                        <div className="h-2 w-8 bg-white/30 rounded"></div>
                                        <div className="h-2 w-12 bg-white/30 rounded"></div>
                                    </div>
                                </div>

                                {/* Banner Preview */}
                                <div className="w-full py-16 px-6 text-center" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block"
                                        style={{ backgroundColor: 'var(--color-secondary)', color: '#fff' }}
                                    >
                                        New Collection
                                    </span>
                                    <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-sm max-w-sm mx-auto" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                        Elevate Your Style.
                                    </h1>
                                    <p className="text-sm mb-8 opacity-80 max-w-xs mx-auto text-gray-700" style={{ fontFamily: 'var(--font-body)' }}>
                                        Discover the latest premium garments crafted with perfection and ethical sustainability.
                                    </p>
                                    <button className="px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)' }}>
                                        Browse Catalog <ArrowRight size={16} />
                                    </button>
                                </div>

                                {/* Product Card Preview */}
                                <div className="px-6 pb-12 w-full max-w-sm mx-auto">
                                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-transform hover:-translate-y-1">
                                        <div className="aspect-[4/3] bg-gray-200 w-full flex items-center justify-center">
                                            <div className="h-24 w-24 bg-gray-300 rounded-lg opacity-50"></div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Classic T-Shirt</h3>
                                                <span className="font-bold" style={{ color: 'var(--color-secondary)' }}>$29</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-4" style={{ fontFamily: 'var(--font-body)' }}>100% Organic Cotton • Breathable</p>
                                            <button className="w-full py-2.5 rounded text-sm font-bold border-2 transition-colors hover:bg-opacity-5" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                                Request Quote
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
