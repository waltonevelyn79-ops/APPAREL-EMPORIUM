'use client';

import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsForm({ initialData }: { initialData: any }) {
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Settings updated successfully!');
            } else {
                setMessage(data.error || 'Failed to update settings');
            }
        } catch (err) {
            setMessage('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 max-w-4xl">
            {message && (
                <div className={`p-4 mb-6 rounded-lg font-medium text-sm ${message.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Company Name</label>
                        <input name="company_name" type="text" value={formData.company_name || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Tagline</label>
                        <input name="company_short_description" type="text" value={formData.company_short_description || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email Address</label>
                        <input name="company_email" type="email" value={formData.company_email || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Phone Number</label>
                        <input name="company_phone" type="text" value={formData.company_phone || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Address</label>
                        <textarea name="company_address" rows={2} value={formData.company_address || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Facebook Link</label>
                        <input name="facebook_url" type="url" value={formData.facebook_url || ''} placeholder="https://facebook.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">LinkedIn Link</label>
                        <input name="linkedin_url" type="url" value={formData.linkedin_url || ''} placeholder="https://linkedin.com/..." onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button disabled={loading} type="submit" className="px-8 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

