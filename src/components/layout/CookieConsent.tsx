'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function CookieConsent() {
    const { settings } = useSettings();
    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Cookie Toggles state for modal
    const [toggles, setToggles] = useState({
        analytics: true,
        marketing: true
    });

    useEffect(() => {
        // Delay slight to ensure animation
        const timer = setTimeout(() => {
            const consent = localStorage.getItem('cookieConsentData');
            if (!consent && settings.cookie_banner_enabled === 'true') {
                setShowBanner(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [settings.cookie_banner_enabled]);

    const saveOptions = (options: { necessary: boolean; analytics: boolean; marketing: boolean }) => {
        localStorage.setItem('cookieConsentData', JSON.stringify(options));
        setShowBanner(false);
        setShowModal(false);
        window.location.reload(); // Force reload to ensure scripts inject cleanly based on consent
    };

    const handleAcceptAll = () => saveOptions({ necessary: true, analytics: true, marketing: true });

    const handleRejectAll = () => saveOptions({ necessary: true, analytics: false, marketing: false });

    const handleSavePreferences = () => saveOptions({ necessary: true, analytics: toggles.analytics, marketing: toggles.marketing });

    if (!showBanner && !showModal) return null;

    return (
        <>
            {/* Banner sliding from bottom */}
            {showBanner && !showModal && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom duration-500">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">Cookie Preferences</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {settings.cookie_banner_text || "We use cookies to improve your experience on our site. By using our site, you consent to cookies."}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-5 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition"
                            >
                                Customize
                            </button>
                            <button
                                onClick={handleRejectAll}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
                            >
                                {settings.cookie_reject_text || "Reject All"}
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition shadow-sm"
                            >
                                {settings.cookie_accept_text || "Accept All"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customize Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b dark:border-gray-800">
                            <h2 className="text-xl font-bold">Customize Cookie Preferences</h2>
                        </div>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Necessary */}
                            <div className="flex justify-between items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Strictly Necessary</h4>
                                    <p className="text-sm text-gray-500 mt-1 pb-1">Required for the website to function properly. Cannot be disabled.</p>
                                </div>
                                <div className="text-sm font-bold text-gray-400">Always On</div>
                            </div>

                            {/* Analytics */}
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Analytics Cookies</h4>
                                    <p className="text-sm text-gray-500 mt-1">Help us understand how visitors interact with our website to improve user experience.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={toggles.analytics}
                                        onChange={(e) => setToggles({ ...toggles, analytics: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {/* Marketing */}
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Marketing & Tracking</h4>
                                    <p className="text-sm text-gray-500 mt-1">Used to deliver relevant advertisements and track ad campaigns across the web.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={toggles.marketing}
                                        onChange={(e) => setToggles({ ...toggles, marketing: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>

                        <div className="p-4 border-t dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
                            <button
                                onClick={handleSavePreferences}
                                className="px-5 py-2 font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition shadow-sm w-full md:w-auto"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
