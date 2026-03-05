'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { usePermission } from '@/hooks/usePermission';
import { Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function TrackingPage() {
    const { settings, updateSettings } = useSettings();
    const { role } = usePermission();

    const [formData, setFormData] = useState({
        fb_pixel_id: '',
        fb_pixel_enabled: 'false',
        ga4_measurement_id: '',
        ga4_enabled: 'false',
        gtm_container_id: '',
        gtm_enabled: 'false',
        google_search_console_meta: '',
        clarity_project_id: '',
        clarity_enabled: 'false',
        hotjar_site_id: '',
        hotjar_enabled: 'false',
        tiktok_pixel_id: '',
        tiktok_pixel_enabled: 'false',
        linkedin_partner_id: '',
        linkedin_enabled: 'false',
        pinterest_tag_id: '',
        pinterest_enabled: 'false',
        custom_scripts: '[]' // Will store as JSON string
    });

    const [customScripts, setCustomScripts] = useState<{ name: string, location: string, code: string, active: boolean }[]>([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            setFormData({
                fb_pixel_id: settings.fb_pixel_id || '',
                fb_pixel_enabled: settings.fb_pixel_enabled || 'false',
                ga4_measurement_id: settings.ga4_measurement_id || '',
                ga4_enabled: settings.ga4_enabled || 'false',
                gtm_container_id: settings.gtm_container_id || '',
                gtm_enabled: settings.gtm_enabled || 'false',
                google_search_console_meta: settings.google_search_console_meta || '',
                clarity_project_id: settings.clarity_project_id || '',
                clarity_enabled: settings.clarity_enabled || 'false',
                hotjar_site_id: settings.hotjar_site_id || '',
                hotjar_enabled: settings.hotjar_enabled || 'false',
                tiktok_pixel_id: settings.tiktok_pixel_id || '',
                tiktok_pixel_enabled: settings.tiktok_pixel_enabled || 'false',
                linkedin_partner_id: settings.linkedin_partner_id || '',
                linkedin_enabled: settings.linkedin_enabled || 'false',
                pinterest_tag_id: settings.pinterest_tag_id || '',
                pinterest_enabled: settings.pinterest_enabled || 'false',
                custom_scripts: settings.custom_scripts || '[]'
            });

            try {
                if (settings.custom_scripts) setCustomScripts(JSON.parse(settings.custom_scripts));
            } catch (e) { console.error("Could not parse custom scripts", e); }
        }
    }, [settings]);

    if (role !== 'DEVELOPER') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Requires DEVELOPER privileges.</div>;
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = (field: string) => {
        setFormData(prev => ({ ...prev, [field]: prev[field as keyof typeof prev] === 'true' ? 'false' : 'true' }));
    };

    const addCustomScript = () => {
        setCustomScripts([...customScripts, { name: 'New Script', location: 'head', code: '', active: true }]);
    };

    const updateCustomScript = (index: number, field: string, value: any) => {
        const updated = [...customScripts];
        updated[index] = { ...updated[index], [field]: value };
        setCustomScripts(updated);
    };

    const removeCustomScript = (index: number) => {
        setCustomScripts(customScripts.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const dataToSave = {
                ...formData,
                custom_scripts: JSON.stringify(customScripts)
            };
            await updateSettings(dataToSave);
            setMessage({ text: 'Tracking settings saved successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Failed to save settings.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    const renderSection = (title: string, prefix: string, placeholderStr: string, label: string) => (
        <div className="border-b dark:border-gray-800 pb-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    {title}
                    <button
                        type="button"
                        onClick={() => handleToggle(`${prefix}_enabled`)}
                        className={`w-10 h-6 rounded-full transition relative flex items-center ${formData[`${prefix}_enabled` as keyof typeof formData] === 'true' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                        <span className={`w-4 h-4 bg-white rounded-full absolute transition-transform transform ${formData[`${prefix}_enabled` as keyof typeof formData] === 'true' ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                    {formData[`${prefix}_enabled` as keyof typeof formData] === 'true' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                </h3>
            </div>
            <div className={`w-full md:w-2/3 space-y-4 ${formData[`${prefix}_enabled` as keyof typeof formData] !== 'true' && 'opacity-50 pointer-events-none'}`}>
                <div>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input
                        type="text"
                        value={formData[`${prefix}_id` as keyof typeof formData]}
                        onChange={(e) => handleChange(`${prefix}_id`, e.target.value)}
                        placeholder={placeholderStr}
                        className="w-full px-4 py-2 border rounded-md dark:bg-dark-bg dark:border-gray-700"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">Tracking & Integrations</h1>
                    <p className="text-gray-500 text-sm">DEVELOPER ONLY: Manage third-party analytics pixels and custom scripts.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
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

            {formData.gtm_enabled === 'true' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <p className="ml-3 text-sm text-blue-700">
                            <strong>Google Tag Manager is active.</strong> When GTM is active, you can manage GA4 and FB Pixel through GTM instead of hardcoding them here.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">

                {renderSection("Google Tag Manager", "gtm", "e.g. GTM-XXXXXXX", "Container ID")}
                {renderSection("Google Analytics 4", "ga4", "e.g. G-XXXXXXXXXX", "Measurement ID")}
                {renderSection("Facebook Pixel", "fb_pixel", "e.g. 123456789", "Pixel ID")}

                <div className="border-b dark:border-gray-800 pb-6 flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-1/3">
                        <h3 className="text-lg font-semibold">Google Search Console</h3>
                    </div>
                    <div className="w-full md:w-2/3">
                        <label className="block text-sm font-medium mb-1">Verification Meta Content</label>
                        <input
                            type="text"
                            value={formData.google_search_console_meta}
                            onChange={(e) => handleChange('google_search_console_meta', e.target.value)}
                            placeholder="e.g. XXXXXXXXXXXXXXXXXXXX"
                            className="w-full px-4 py-2 border rounded-md dark:bg-dark-bg dark:border-gray-700"
                        />
                        <p className="text-xs text-gray-400 mt-1">Found in &lt;meta name="google-site-verification" content="..."&gt;</p>
                    </div>
                </div>

                {renderSection("Microsoft Clarity", "clarity", "Project ID string", "Project ID")}
                {renderSection("Hotjar", "hotjar", "Site ID (numbers)", "Site ID")}
                {renderSection("TikTok Pixel", "tiktok_pixel", "Pixel ID", "Pixel ID")}
                {renderSection("LinkedIn Insight", "linkedin", "Partner ID", "Partner ID")}
                {renderSection("Pinterest Tag", "pinterest", "Tag ID", "Tag ID")}

                {/* Custom Scripts Section */}
                <div className="pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Custom Scripts Manager</h3>
                        <button type="button" onClick={addCustomScript} className="flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-md transition font-medium">
                            <Plus size={16} /> Add Script
                        </button>
                    </div>

                    <div className="space-y-6">
                        {customScripts.map((script, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-dark-bg relative">
                                <button type="button" onClick={() => removeCustomScript(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1 rounded transition">
                                    <Trash2 size={18} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Script Name</label>
                                        <input
                                            type="text"
                                            value={script.name}
                                            onChange={(e) => updateCustomScript(index, 'name', e.target.value)}
                                            className="w-full rounded text-sm border-gray-300 dark:border-gray-600 dark:bg-dark-surface px-3 py-1.5 focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                                        <select
                                            value={script.location}
                                            onChange={(e) => updateCustomScript(index, 'location', e.target.value)}
                                            className="w-full rounded text-sm border-gray-300 dark:border-gray-600 dark:bg-dark-surface px-3 py-1.5 focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="head">&lt;head&gt; (Analytics/Verification)</option>
                                            <option value="body-start">Top of &lt;body&gt; (GTM Noscript)</option>
                                            <option value="body-end">End of &lt;body&gt; (Chatbots/Widgets)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex items-end pb-1.5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={script.active}
                                                onChange={(e) => updateCustomScript(index, 'active', e.target.checked)}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                                            />
                                            <span className="text-sm font-medium">Script Active</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Code block</label>
                                    <textarea
                                        value={script.code}
                                        onChange={(e) => updateCustomScript(index, 'code', e.target.value)}
                                        rows={4}
                                        placeholder="<script>console.log('Hello');</script>"
                                        className="w-full font-mono text-xs p-3 rounded border-gray-300 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-gray-300 focus:ring-1 focus:ring-primary"
                                    ></textarea>
                                </div>
                            </div>
                        ))}
                        {customScripts.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">No custom scripts added.</p>}
                    </div>
                </div>
            </form>
        </div>
    );
}
