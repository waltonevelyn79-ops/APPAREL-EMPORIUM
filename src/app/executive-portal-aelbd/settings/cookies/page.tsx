'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { usePermission } from '@/hooks/usePermission';
import { Save, AlertTriangle } from 'lucide-react';

export default function CookieSettingsPage() {
    const { settings, updateSettings } = useSettings();
    const { role } = usePermission();

    const [formData, setFormData] = useState({
        cookie_banner_enabled: 'true',
        cookie_banner_text: '',
        cookie_accept_text: '',
        cookie_reject_text: ''
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            setFormData({
                cookie_banner_enabled: settings.cookie_banner_enabled || 'true',
                cookie_banner_text: settings.cookie_banner_text || '',
                cookie_accept_text: settings.cookie_accept_text || '',
                cookie_reject_text: settings.cookie_reject_text || ''
            });
        }
    }, [settings]);

    if (role !== 'DEVELOPER') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
                <p className="text-red-600 dark:text-red-300">This configuration requires DEVELOPER privileges.</p>
            </div>
        );
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, cookie_banner_enabled: prev.cookie_banner_enabled === 'true' ? 'false' : 'true' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await updateSettings(formData);
            setMessage({ text: 'Cookie settings saved successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Failed to save settings.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Cookie Consent Banner</h1>
                    <p className="text-gray-500 text-sm">DEVELOPER ONLY: Configure the GDPR/CCPA cookie consent popup.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 mb-6 rounded-lg font-medium text-sm border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">

                {/* Banner Toggle */}
                <div className="border-b dark:border-gray-800 pb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Enable Banner</h3>
                        <p className="text-sm text-gray-500 mt-1">Show the cookie consent banner to new visitors.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggle}
                        className={`w-14 h-7 rounded-full transition relative flex items-center ${formData.cookie_banner_enabled === 'true' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                        <span className={`w-5 h-5 bg-white rounded-full absolute transition-transform transform ${formData.cookie_banner_enabled === 'true' ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className={`space-y-6 ${formData.cookie_banner_enabled !== 'true' && 'opacity-50 pointer-events-none'}`}>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Consent Description Text</label>
                        <textarea
                            value={formData.cookie_banner_text}
                            onChange={(e) => handleChange('cookie_banner_text', e.target.value)}
                            rows={3}
                            placeholder="We use cookies to improve your experience..."
                            className="w-full px-4 py-3 border rounded-md dark:bg-dark-bg dark:border-gray-700 focus:ring-1 focus:ring-primary"
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-1">This text appears on the main banner.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Accept Button Text</label>
                            <input
                                type="text"
                                value={formData.cookie_accept_text}
                                onChange={(e) => handleChange('cookie_accept_text', e.target.value)}
                                placeholder="e.g. Accept All"
                                className="w-full px-4 py-2 border rounded-md dark:bg-dark-bg dark:border-gray-700 focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Reject Button Text</label>
                            <input
                                type="text"
                                value={formData.cookie_reject_text}
                                onChange={(e) => handleChange('cookie_reject_text', e.target.value)}
                                placeholder="e.g. Reject All"
                                className="w-full px-4 py-2 border rounded-md dark:bg-dark-bg dark:border-gray-700 focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}

