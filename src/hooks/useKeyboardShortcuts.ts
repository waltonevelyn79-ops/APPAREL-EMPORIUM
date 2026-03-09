'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Avoid triggering when user is typing in inputs or textareas, EXCEPT for escaping or saving
            const activeTag = document.activeElement?.tagName.toLowerCase();
            const isInputFocus = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

            if (e.key === 'Escape') {
                window.dispatchEvent(new CustomEvent('admin-close-modals'));
                return;
            }

            // Ctrl/Cmd shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'k':
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('admin-quick-search-toggle'));
                        break;
                    case 'n':
                        e.preventDefault();
                        router.push('/executive-portal-aelbd/products');
                        break;
                    case 's':
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('admin-save-shortcut'));
                        break;
                }
            } else if (e.key === '?' && !isInputFocus && !e.shiftKey) {
                // Just pressing '?' opens help modal (wait, usually Shift+/ is '?')
                // Let's account for both
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('admin-help-shortcuts'));
            } else if (e.key === '?' && e.shiftKey && !isInputFocus) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('admin-help-shortcuts'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);
}

