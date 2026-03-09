export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export function extractProductImages(imagesRaw: any): string[] {
    if (!imagesRaw) return ['/images/placeholder-product.svg'];

    // If it's already an array of something (strings or objects)
    if (Array.isArray(imagesRaw)) {
        return imagesRaw.map((img: any) => {
            if (typeof img === 'string') return img;
            if (typeof img === 'object' && img !== null && img.url) return img.url;
            return null;
        }).filter(Boolean) as string[];
    }

    // Try to parse if it's a string (could be a JSON array or a raw URL)
    if (typeof imagesRaw === 'string') {
        const trimmed = imagesRaw.trim();
        if (trimmed === '') return ['/images/placeholder-product.svg'];

        // If it looks like a JSON array start, try to parse it
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map((img: any) => {
                        if (typeof img === 'string') return img;
                        if (typeof img === 'object' && img !== null && img.url) return img.url;
                        return null;
                    }).filter(Boolean) as string[];
                }
            } catch (e) { }
        }

        // If parsing fails or it's just a raw URL string
        return [trimmed];
    }

    return ['/images/placeholder-product.svg'];
}

export function extractFeaturedImage(imagesRaw: any): string {
    const images = extractProductImages(imagesRaw);
    return images[0] || '/images/placeholder-product.svg';
}

