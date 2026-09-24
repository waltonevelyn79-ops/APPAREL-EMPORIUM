'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw, Home } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Client error caught by ErrorBoundary:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-light-bg dark:bg-dark-bg">
            <div className="max-w-md w-full text-center bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <RotateCw className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Temporary Display Issue
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                    A temporary browser cache or network mismatch occurred. Please click below to reload the page with the latest version.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.location.reload();
                            } else {
                                reset();
                            }
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition-all shadow-md"
                    >
                        <RotateCw size={16} />
                        Reload Page
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <Home size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
