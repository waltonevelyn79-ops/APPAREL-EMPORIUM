'use client';

import { useEffect } from 'react';

/**
 * Record a visit to a piece of content (product or blog) in localStorage.
 * Used for "Recently Viewed" sections.
 * 
 * @param type The content type (e.g. 'product', 'blog')
 * @param id   The content ID
 */
export function useRecordVisit(id: string) {
    useEffect(() => {
        if (!id) return;

        const STORAGE_KEY = 'recently_viewed';
        const MAX_HISTORY = 12;

        try {
            // Get current history
            const historyString = localStorage.getItem(STORAGE_KEY);
            let history: string[] = historyString ? JSON.parse(historyString) : [];

            // Remove if already exists (move to front)
            history = history.filter(i => i !== id);

            // Add to front
            history.unshift(id);

            // Limit history
            if (history.length > MAX_HISTORY) {
                history = history.slice(0, MAX_HISTORY);
            }

            // Save back
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Failed to record visit", e);
        }
    }, [id]);
}

