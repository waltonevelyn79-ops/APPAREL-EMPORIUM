'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook to manage adding products to comparison list.
 */
export function useAddToCompare() {
    const [compareList, setCompareList] = useState<any[]>([]);

    const updateState = useCallback(() => {
        try {
            const stored = localStorage.getItem('product_compare');
            if (stored) setCompareList(JSON.parse(stored));
        } catch (e) { }
    }, []);

    useEffect(() => {
        updateState();
        window.addEventListener('compare_updated', updateState);
        return () => window.removeEventListener('compare_updated', updateState);
    }, [updateState]);

    const addToCompare = useCallback((product: any) => {
        try {
            const stored = localStorage.getItem('product_compare');
            let current = stored ? JSON.parse(stored) : [];

            // Check if already in list
            if (current.some((p: any) => p.id === product.id)) return;

            // Limit to 4
            if (current.length >= 4) {
                alert('Maximum 4 products can be compared at once.');
                return;
            }

            current.push({
                id: product.id,
                name: product.name,
                slug: product.slug,
                images: product.images,
                specifications: product.specifications,
                category: product.category
            });

            localStorage.setItem('product_compare', JSON.stringify(current));
            window.dispatchEvent(new Event('compare_updated'));
        } catch (e) { }
    }, []);

    const isInCompare = (id: string) => compareList.some(p => p.id === id);

    return { addToCompare, isInCompare, compareList };
}

