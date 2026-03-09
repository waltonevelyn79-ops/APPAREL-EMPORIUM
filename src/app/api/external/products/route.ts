import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handlePreflight, withCors } from '../cors';

// ─── PREFLIGHT (required for browser CORS) ───────────────────────────────────
export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

// ─── POST: Create a new product ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate via API Key
        const apiKey = req.headers.get('x-api-key');
        if (!apiKey) {
            return withCors(req, NextResponse.json(
                { success: false, error: 'API Key is missing. Add header: x-api-key' },
                { status: 401 }
            ));
        }

        const validKeySetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_external_key' }
        });

        if (!validKeySetting || apiKey !== validKeySetting.value) {
            return withCors(req, NextResponse.json(
                { success: false, error: 'Invalid API Key.' },
                { status: 403 }
            ));
        }

        // 2. Parse Body
        const body = await req.json();
        const {
            name,
            slug,
            description,
            shortDescription,
            categorySlug,
            categoryId,
            images,
            specifications,
            isFeatured = false,
            isActive = true,
            sku,
            tags,
            priceDisplay = true,
            minOrder,
            priceRange,
            tieredPricing,
            seoTitle,
            seoDescription,
            seoKeywords
        } = body;

        // 3. Validate required fields
        if (!name || !description || (!categorySlug && !categoryId)) {
            return withCors(req, NextResponse.json({
                success: false,
                error: 'Missing required fields. Need: name, description, and categorySlug (or categoryId).'
            }, { status: 400 }));
        }

        // 4. Resolve Category by slug
        let resolvedCategoryId = categoryId;
        if (!resolvedCategoryId && categorySlug) {
            const category = await prisma.category.findUnique({
                where: { slug: categorySlug }
            });
            if (!category) {
                // Return helpful list of valid slugs
                const allCats = await prisma.category.findMany({
                    select: { slug: true, name: true },
                    where: { isActive: true },
                    take: 60
                });
                return withCors(req, NextResponse.json({
                    success: false,
                    error: `Category slug "${categorySlug}" not found.`,
                    hint: 'Use one of the valid slugs below:',
                    validSlugs: allCats.map(c => ({ name: c.name, slug: c.slug }))
                }, { status: 404 }));
            }
            resolvedCategoryId = category.id;
        }

        // 5. Auto-generate slug from name if not provided
        let finalSlug = slug || name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // 6. Check if slug already exists; append timestamp if so
        const existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
        if (existing) {
            finalSlug = `${finalSlug}-${Date.now()}`;
        }

        // 7. Build tiered pricing string
        let tieredPricingStr = '[]';
        if (tieredPricing) {
            tieredPricingStr = typeof tieredPricing === 'string'
                ? tieredPricing
                : JSON.stringify(tieredPricing);
        }

        // 8. Build auto price range from tiers if priceRange is not given
        let finalPriceRange = priceRange || '';
        if (!finalPriceRange && tieredPricing && Array.isArray(tieredPricing) && tieredPricing.length > 0) {
            const prices = tieredPricing.map((t: any) => parseFloat(t.price)).filter(p => !isNaN(p));
            if (prices.length > 0) {
                const minP = Math.min(...prices);
                const maxP = Math.max(...prices);
                finalPriceRange = minP === maxP ? `$${minP.toFixed(2)}` : `$${minP.toFixed(2)} - $${maxP.toFixed(2)}`;
            }
        }

        // 9. Create Product
        const product = await prisma.product.create({
            data: {
                name,
                slug: finalSlug,
                description,
                shortDescription: shortDescription || description.substring(0, 150),
                categoryId: resolvedCategoryId,
                images: Array.isArray(images) ? JSON.stringify(images) : (images || '[]'),
                specifications: typeof specifications === 'object' && specifications !== null
                    ? JSON.stringify(specifications)
                    : (specifications || '{}'),
                isFeatured,
                isActive,
                sku: sku || `AE-EXT-${Date.now()}`,
                tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
                priceDisplay,
                minOrder: minOrder || '',
                priceRange: finalPriceRange,
                tieredPricing: tieredPricingStr,
                seoTitle: seoTitle || name,
                seoDescription: seoDescription || (shortDescription || '').substring(0, 160),
                seoKeywords: seoKeywords || (Array.isArray(tags) ? tags.join(', ') : (tags || ''))
            },
            include: {
                category: { select: { name: true, slug: true } }
            }
        });

        return withCors(req, NextResponse.json({
            success: true,
            message: `✅ Product "${product.name}" created successfully!`,
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                category: product.category.name,
                categorySlug: product.category.slug,
                priceRange: product.priceRange,
                url: `/products/${product.slug}`
            }
        }, { status: 201 }));

    } catch (error: any) {
        console.error('[External API] POST /products error:', error);
        return withCors(req, NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 }));
    }
}

// ─── GET: List recent products ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    const validKeySetting = await prisma.siteSetting.findUnique({
        where: { key: 'api_external_key' }
    });

    if (!apiKey || !validKeySetting || apiKey !== validKeySetting.value) {
        return withCors(req, NextResponse.json(
            { success: false, error: 'Unauthorized. Provide a valid x-api-key header.' },
            { status: 401 }
        ));
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const categorySlug = searchParams.get('category');

    const where: any = {};
    if (categorySlug) {
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (cat) where.categoryId = cat.id;
    }

    const products = await prisma.product.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            priceRange: true,
            isFeatured: true,
            isActive: true,
            createdAt: true,
            category: { select: { name: true, slug: true } }
        }
    });

    return withCors(req, NextResponse.json({
        success: true,
        count: products.length,
        products
    }));
}
