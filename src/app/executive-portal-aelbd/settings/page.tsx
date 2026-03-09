'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Facebook, Linkedin, Instagram, Twitter, Youtube, MapPin, Building, Phone, Mail, Clock, DollarSign, Image as ImageIcon } from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

export default function SettingsPage() {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFormData(data.settings);
                }
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSave = async (section: string) => {
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`${section} updated successfully!`);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || 'Failed to update settings');
            }
        } catch (err) {
            setMessage('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-5xl space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">General Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your company core information and preferences here.</p>
            </div>

            {/* SECTION 0: Branding & Logos */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><ImageIcon className="w-5 h-5 text-primary" /> Branding & Identity</h2>
                        <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">Logo Management</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload your company logos. Changes apply site-wide immediately after saving.</p>
                </div>
                <div className="p-6 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Light Mode Logo */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-white">Primary Website Logo</label>
                                <p className="text-xs text-gray-500 mt-0.5">Displayed in the header and footer. Works best on light/white backgrounds.</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                                {/* Live preview if an image URL is set from DB but not yet re-uploaded */}
                                {formData.logo_light && !formData.logo_light.startsWith('/uploads/') && (
                                    <div className="mb-2 bg-white p-3 rounded-lg flex justify-center border border-gray-100">
                                        <img src={formData.logo_light} alt="Current Light Logo" className="max-h-16 object-contain" />
                                        <div className="ml-3 flex flex-col justify-center">
                                            <p className="text-xs text-gray-500">Current logo path:</p>
                                            <code className="text-[10px] text-primary font-mono break-all">{formData.logo_light}</code>
                                        </div>
                                    </div>
                                )}
                                <ImagePicker
                                    value={formData.logo_light || ''}
                                    onChange={(url: string) => setFormData({ ...formData, logo_light: url })}
                                    folder="logos"
                                />
                                <p className="text-[11px] text-gray-400">Recommended: PNG with transparent background, min 300px wide.</p>
                            </div>
                        </div>

                        {/* Dark Mode Logo */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-white">Dark Mode Logo <span className="font-normal text-gray-400">(optional)</span></label>
                                <p className="text-xs text-gray-500 mt-0.5">Used on dark backgrounds in dark mode. White/light version of your logo works best.</p>
                            </div>
                            <div className="p-4 bg-slate-900/5 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                                {formData.logo_dark && !formData.logo_dark.startsWith('/uploads/') && (
                                    <div className="mb-2 bg-slate-900 p-3 rounded-lg flex justify-center border border-white/10">
                                        <img src={formData.logo_dark} alt="Current Dark Logo" className="max-h-16 object-contain" />
                                    </div>
                                )}
                                <ImagePicker
                                    value={formData.logo_dark || ''}
                                    onChange={(url: string) => setFormData({ ...formData, logo_dark: url })}
                                    folder="logos"
                                />
                                <p className="text-[11px] text-gray-400">If left empty, the primary logo is used in dark mode too.</p>
                            </div>
                        </div>
                    </div>

                    {/* Favicon row */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-white">Favicon</h3>
                            <span className="text-xs text-gray-400">The small icon shown in browser tabs</span>
                        </div>
                        <div className="max-w-xs">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                                <ImagePicker
                                    value={formData.favicon || ''}
                                    onChange={(url: string) => setFormData({ ...formData, favicon: url })}
                                    folder="logos"
                                />
                                <p className="text-[11px] text-gray-400">Recommended: 32×32 or 64×64 PNG/ICO file.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button disabled={saving} onClick={() => handleSave('Branding')} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Logos & Branding
                        </button>
                    </div>
                </div>
            </section>

            {message && (
                <div className={`p-4 rounded-lg font-medium text-sm animate-in fade-in slide-in-from-top-4 ${message.includes('successfully') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message}
                </div>
            )}

            {/* SECTION 1: Company Information */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Building className="w-5 h-5 text-primary" /> Company Information</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Company Name</label>
                            <input name="company_name" type="text" value={formData.company_name || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Tagline</label>
                            <input name="company_tagline" type="text" value={formData.company_tagline || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Founded Year</label>
                            <input name="founded_year" type="text" value={formData.founded_year || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> Website URL</label>
                            <input name="website_url" type="url" value={formData.website_url || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Phone Number</label>
                            <input name="company_phone" type="text" value={formData.company_phone || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> WhatsApp Number</label>
                            <input name="whatsapp_number" type="text" value={formData.whatsapp_number || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> Email Address</label>
                            <input name="company_email" type="email" value={formData.company_email || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Working Hours</label>
                            <input name="working_hours" type="text" placeholder="Mon-Fri, 9am - 6pm" value={formData.working_hours || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Address</label>
                            <textarea name="company_address" rows={2} value={formData.company_address || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">Google Maps Embed Code</label>
                            <textarea name="google_maps_embed" rows={3} placeholder="<iframe src='...'></iframe>" value={formData.google_maps_embed || ''} onChange={handleChange} className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button disabled={saving} onClick={() => handleSave('Company Information')} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Company Info
                        </button>
                    </div>
                </div>
            </section>

            {/* SECTION 2: Social Media Links */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Globe className="w-5 h-5 text-primary" /> Social Media Links</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook URL</label>
                            <input name="social_facebook" type="url" value={formData.social_facebook || ''} placeholder="https://facebook.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn URL</label>
                            <input name="social_linkedin" type="url" value={formData.social_linkedin || ''} placeholder="https://linkedin.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-600" /> Instagram URL</label>
                            <input name="social_instagram" type="url" value={formData.social_instagram || ''} placeholder="https://instagram.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Twitter className="w-4 h-4 text-blue-400" /> Twitter (X) URL</label>
                            <input name="social_twitter" type="url" value={formData.social_twitter || ''} placeholder="https://twitter.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /> YouTube URL</label>
                            <input name="social_youtube" type="url" value={formData.social_youtube || ''} placeholder="https://youtube.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-red-700" /> Pinterest URL</label>
                            <input name="social_pinterest" type="url" value={formData.social_pinterest || ''} placeholder="https://pinterest.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button disabled={saving} onClick={() => handleSave('Social Media Links')} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Social Links
                        </button>
                    </div>
                </div>
            </section>

            {/* SECTION 3: Currency Settings */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><DollarSign className="w-5 h-5 text-primary" /> Currency Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Default Currency</label>
                            <select name="default_currency" value={formData.default_currency || 'USD'} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow">
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="BDT">BDT (৳)</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="show_currency_symbol" checked={formData.show_currency_symbol === 'true'} onChange={e => handleChange({ target: { name: e.target.name, type: 'checkbox', checked: e.target.checked } } as any)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-300">Show Currency Symbol</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button disabled={saving} onClick={() => handleSave('Currency Settings')} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Currency Settings
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

