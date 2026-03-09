'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { usePermission } from '@/hooks/usePermission';
import {
    Save, AlertTriangle, ArrowRight, LayoutTemplate, Loader2,
    Monitor, Moon, Globe, Image as ImageIcon, Palette, Type
} from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

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
        // Shared logos (legacy)
        logo_light: '',
        logo_dark: '',
        // Separate header logos
        header_logo_light: '',
        header_logo_dark: '',
        // Separate footer logo
        footer_logo: '',
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
                header_logo_light: settings.header_logo_light || '',
                header_logo_dark: settings.header_logo_dark || '',
                footer_logo: settings.footer_logo || '',
                favicon: settings.favicon || '',
                og_image: settings.og_image || ''
            });
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
        updateCSSVariables({ [key]: value });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            await updateSettings(formData);
            setMessage({ text: 'Theme settings published successfully!', type: 'success' });
        } catch {
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
    };

    /* ─── Reusable label ─── */
    const Label = ({ children }: { children: React.ReactNode }) => (
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{children}</label>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <LayoutTemplate className="text-primary" /> Theme Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Control site colours, fonts, logos and branding assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={resetColors}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        Reset Colours
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition shadow-sm font-medium disabled:opacity-60">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
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
                <div className="lg:col-span-2 space-y-8">

                    {/* ── COLORS ─────────────────────────────────── */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 pb-2 border-b dark:border-gray-800 flex items-center gap-2">
                            <Palette size={18} className="text-primary" /> Colour Palette
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { key: 'primary_color', label: 'Primary Brand' },
                                { key: 'secondary_color', label: 'Secondary / Gold' },
                                { key: 'accent_color', label: 'Accent / Success' },
                                { key: 'light_bg', label: 'Light Background' },
                                { key: 'dark_bg', label: 'Dark Background' },
                            ].map(item => (
                                <div key={item.key}>
                                    <Label>{item.label}</Label>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <input type="color"
                                            value={formData[item.key as keyof typeof formData]}
                                            onChange={(e) => handleChange(item.key as keyof typeof formData, e.target.value)}
                                            className="w-10 h-10 p-0 rounded cursor-pointer border-none bg-transparent"
                                        />
                                        <input type="text"
                                            value={formData[item.key as keyof typeof formData]}
                                            onChange={(e) => handleChange(item.key as keyof typeof formData, e.target.value)}
                                            className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm uppercase text-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── TYPOGRAPHY ─────────────────────────────── */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 pb-2 border-b dark:border-gray-800 flex items-center gap-2">
                            <Type size={18} className="text-primary" /> Typography
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <Label>Headings Font</Label>
                                <select value={formData.heading_font} onChange={(e) => handleChange('heading_font', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-700 mb-4 font-medium"
                                    style={{ fontFamily: `"${formData.heading_font}", sans-serif` }}>
                                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>)}
                                </select>
                                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h1 className="text-2xl font-bold mb-1 tracking-tight" style={{ fontFamily: `"${formData.heading_font}", sans-serif`, color: 'var(--color-primary)' }}>Hero Heading Title</h1>
                                    <h3 className="text-lg font-medium" style={{ fontFamily: `"${formData.heading_font}", sans-serif`, color: 'var(--color-secondary)' }}>Section Subtitle H3</h3>
                                </div>
                            </div>
                            <div>
                                <Label>Body Font</Label>
                                <select value={formData.body_font} onChange={(e) => handleChange('body_font', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-dark-bg dark:border-gray-700 mb-4 font-medium"
                                    style={{ fontFamily: `"${formData.body_font}", sans-serif` }}>
                                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>)}
                                </select>
                                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm leading-relaxed" style={{ fontFamily: `"${formData.body_font}", sans-serif` }}>
                                        The quick brown fox jumps over the lazy dog. Good design is obvious, great design is transparent.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── HEADER LOGO ───────────────────────────── */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <Monitor size={18} className="text-primary" /> Header (Nav Bar) Logo
                        </h2>
                        <p className="text-xs text-gray-400 mb-6">These logos appear in the sticky top navigation bar. Upload separate versions for light & dark modes.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <Label>
                                    <span className="flex items-center gap-1.5"><Moon size={14} className="text-indigo-400" /> Dark Mode Header Logo</span>
                                </Label>
                                <p className="text-xs text-gray-400 mb-2">Shown on dark/navy backgrounds. Use a light-coloured or white logo.</p>
                                <ImagePicker
                                    value={formData.header_logo_light}
                                    onChange={(url: string) => handleChange('header_logo_light', url)}
                                    folder="logos"
                                />
                                {formData.header_logo_light && (
                                    <div className="mt-3 p-3 bg-gray-900 rounded-lg flex items-center justify-center h-16">
                                        <img src={formData.header_logo_light} alt="Header logo dark mode" className="max-h-12 max-w-full object-contain" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label>
                                    <span className="flex items-center gap-1.5"><Monitor size={14} className="text-yellow-500" /> Light Mode Header Logo</span>
                                </Label>
                                <p className="text-xs text-gray-400 mb-2">Shown on white/light backgrounds. Use a dark-coloured logo.</p>
                                <ImagePicker
                                    value={formData.header_logo_dark}
                                    onChange={(url: string) => handleChange('header_logo_dark', url)}
                                    folder="logos"
                                />
                                {formData.header_logo_dark && (
                                    <div className="mt-3 p-3 bg-white rounded-lg border flex items-center justify-center h-16">
                                        <img src={formData.header_logo_dark} alt="Header logo light mode" className="max-h-12 max-w-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-blue-500 mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            💡 If you leave these blank, the website will use the shared logos below as a fallback.
                        </p>
                    </div>

                    {/* ── FOOTER LOGO ───────────────────────────── */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <ImageIcon size={18} className="text-primary" /> Footer Logo
                        </h2>
                        <p className="text-xs text-gray-400 mb-6">This logo appears in the website footer on the dark navy background. Ideally a white/light version of your logo.</p>
                        <div className="max-w-sm">
                            <ImagePicker
                                value={formData.footer_logo}
                                onChange={(url: string) => handleChange('footer_logo', url)}
                                folder="logos"
                            />
                            {formData.footer_logo && (
                                <div className="mt-3 p-4 bg-[#1A202C] rounded-lg flex items-center justify-center h-20">
                                    <img src={formData.footer_logo} alt="Footer logo preview" className="max-h-14 max-w-full object-contain" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-blue-500 mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            💡 If left blank, the footer will use the shared &ldquo;Light Mode Logo&rdquo; below.
                        </p>
                    </div>

                    {/* ── SHARED / FALLBACK LOGOS ───────────────── */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <Globe size={18} className="text-primary" /> Shared Fallback Logos
                        </h2>
                        <p className="text-xs text-gray-400 mb-6">Used as a fallback everywhere the specific header/footer logos above are not set.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                            <div>
                                <Label>Light Version (For Dark Backgrounds)</Label>
                                <ImagePicker value={formData.logo_light} onChange={(url: string) => handleChange('logo_light', url)} folder="logos" />
                            </div>
                            <div>
                                <Label>Dark Version (For Light Backgrounds)</Label>
                                <ImagePicker value={formData.logo_dark} onChange={(url: string) => handleChange('logo_dark', url)} folder="logos" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <Label>Favicon (.ico or .png)</Label>
                                <ImagePicker value={formData.favicon} onChange={(url: string) => handleChange('favicon', url)} folder="logos" />
                            </div>
                            <div>
                                <Label>Social Card (OG Image)</Label>
                                <ImagePicker value={formData.og_image} onChange={(url: string) => handleChange('og_image', url)} folder="logos" />
                                <p className="text-xs text-gray-400 mt-2">Recommended: 1200×630px JPG.</p>
                            </div>
                        </div>
                    </div>

                    {/* Save button at bottom */}
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSubmit} disabled={saving}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition shadow-lg font-bold text-sm uppercase tracking-wider disabled:opacity-60">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                            {saving ? 'Publishing...' : 'Save & Publish All Changes'}
                        </button>
                    </div>
                </div>

                {/* ── LIVE PREVIEW ──────────────────────────────── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col" style={{ height: '820px' }}>
                        <div className="bg-gray-100 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 relative">
                            <div className="flex gap-1.5 absolute left-4">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="w-full text-center text-xs font-medium text-gray-500 font-mono tracking-wider">LIVE PREVIEW</div>
                        </div>

                        <div className="flex-1 overflow-y-auto w-full" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                            <div className="w-full relative min-h-full">
                                {/* Header Preview */}
                                <div className="h-14 w-full shadow-sm flex items-center justify-between px-4" style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {formData.header_logo_light || formData.logo_light ? (
                                        <img src={formData.header_logo_light || formData.logo_light} alt="logo" className="h-8 object-contain" />
                                    ) : (
                                        <div className="font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>BRAND</div>
                                    )}
                                    <div className="flex gap-3">
                                        <div className="h-2 w-8 bg-white/30 rounded"></div>
                                        <div className="h-2 w-8 bg-white/30 rounded"></div>
                                        <div className="h-2 w-12 bg-white/30 rounded"></div>
                                    </div>
                                </div>

                                {/* Banner */}
                                <div className="w-full py-12 px-4 text-center" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block"
                                        style={{ backgroundColor: 'var(--color-secondary)', color: '#fff' }}>New Collection</span>
                                    <h1 className="text-3xl font-extrabold mb-3 leading-tight tracking-tight" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                                        Elevate Your Style.
                                    </h1>
                                    <p className="text-xs mb-6 opacity-80 max-w-xs mx-auto text-gray-700" style={{ fontFamily: 'var(--font-body)' }}>
                                        Premium garments crafted with perfection and ethical sustainability.
                                    </p>
                                    <button className="px-5 py-2 rounded-full font-bold shadow-lg text-sm flex items-center gap-2 mx-auto"
                                        style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontFamily: 'var(--font-body)' }}>
                                        Browse Catalog <ArrowRight size={14} />
                                    </button>
                                </div>

                                {/* Product Card */}
                                <div className="px-4 pb-8 max-w-xs mx-auto">
                                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                                        <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                                            <div className="h-16 w-16 bg-gray-300 rounded-lg opacity-50"></div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-base" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Classic T-Shirt</h3>
                                                <span className="font-bold" style={{ color: 'var(--color-secondary)' }}>$29</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>100% Organic Cotton</p>
                                            <button className="w-full py-2 rounded text-xs font-bold border-2"
                                                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>Request Quote</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Preview */}
                                <div className="p-4 mt-4" style={{ backgroundColor: '#1A202C' }}>
                                    {formData.footer_logo || formData.logo_light ? (
                                        <div className="mb-3 bg-white/10 rounded-lg p-2 inline-block">
                                            <img src={formData.footer_logo || formData.logo_light} alt="footer logo" className="h-8 object-contain" />
                                        </div>
                                    ) : (
                                        <div className="text-white font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>BRAND FOOTER</div>
                                    )}
                                    <div className="flex gap-2">
                                        {['About', 'Products', 'Contact'].map(l => (
                                            <div key={l} className="text-xs text-gray-400">{l}</div>
                                        ))}
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
