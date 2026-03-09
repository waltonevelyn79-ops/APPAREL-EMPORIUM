import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dynamic route — must not be cached
export const dynamic = 'force-dynamic';

function extractFirstImage(images: string | null | undefined): string {
    if (!images) return '';
    try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
            const first = parsed[0];
            if (typeof first === 'string') return first;
            if (typeof first === 'object' && first?.url) return first.url;
        }
    } catch {
        if (typeof images === 'string' && (images.startsWith('/') || images.startsWith('http'))) {
            return images;
        }
    }
    return '';
}

function safeParseSpec(spec: string | null | undefined): Record<string, string> {
    if (!spec) return {};
    try { return JSON.parse(spec); } catch { return {}; }
}

/**
 * GET /api/catalog/generate?ids=id1,id2,id3
 * Returns a JSON payload suitable for client-side jsPDF rendering.
 * The actual PDF is generated on the client to avoid server-side canvas dependency issues.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids');
    const catParam = url.searchParams.get('category');

    try {
        // Get company settings
        const settingsRecords = await prisma.siteSetting.findMany({
            where: { group: { in: ['general', 'theme'] } }
        });
        const settings: Record<string, string> = {};
        settingsRecords.forEach(s => { settings[s.key] = s.value; });

        // Build product query
        const where: any = { isActive: true };
        if (idsParam) {
            where.id = { in: idsParam.split(',').map(id => id.trim()) };
        } else if (catParam) {
            const cat = await prisma.category.findFirst({ where: { slug: catParam } });
            if (cat) where.categoryId = cat.id;
        } else {
            where.isFeatured = true; // Default: featured products only
        }

        const products = await prisma.product.findMany({
            where,
            include: { category: { select: { name: true } } },
            take: 50, // Max 50 products per catalog
            orderBy: { name: 'asc' }
        });

        const catalogData = {
            company: {
                name: settings.company_name || 'Apparel Emporium',
                tagline: settings.company_tagline || 'Your Trusted Garments Sourcing Partner in Bangladesh',
                email: settings.company_email || 'info@apparelemporium.com',
                phone: settings.company_phone || '',
                address: settings.company_address || 'Dhaka, Bangladesh',
                website: settings.website_url || 'www.apparelemporium.com',
                logo: settings.logo_light || '/images/logo.png',
            },
            generatedAt: new Date().toISOString(),
            productCount: products.length,
            products: products.map(p => {
                const prod = p as any;
                return {
                    id: prod.id,
                    name: prod.name,
                    sku: prod.sku || '',
                    category: prod.category?.name || '',
                    shortDescription: prod.shortDescription,
                    image: extractFirstImage(prod.images),
                    specifications: safeParseSpec(prod.specifications),
                    minOrder: prod.minOrder || '',
                    priceRange: prod.priceRange || 'On Request',
                    tags: prod.tags || '',
                };
            })

        };

        return NextResponse.json({ success: true, catalog: catalogData });
    } catch (error: any) {
        console.error('Catalog generation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
