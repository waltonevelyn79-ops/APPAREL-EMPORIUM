import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '12');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const q = searchParams.get('q');
        const featured = searchParams.get('featured');
        const category = searchParams.get('category');
        const categoryId = searchParams.get('category_id');
        const includeAll = searchParams.get('include_all') === 'true';
        const ids = searchParams.get('ids');

        const where: any = {};

        if (!includeAll) where.isActive = true;
        if (featured === 'true') where.isFeatured = true;
        if (category) where.category = { slug: category };
        if (categoryId) where.categoryId = categoryId;
        if (ids) where.id = { in: ids.split(',') };

        if (q) {
            where.OR = [
                { name: { contains: q } },
                { description: { contains: q } },
                { tags: { contains: q } },
                { slug: { contains: q } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({ success: true, products, total });
    } catch (error: any) {
        console.error('Products GET Error:', error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        /* ── Validate required fields ── */
        if (!body.name || !body.categoryId) {
            return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name: body.name,
                slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                sku: body.sku || null,
                description: body.description || '',
                shortDescription: body.shortDescription || '',
                categoryId: body.categoryId,
                additionalCategories: body.additionalCategories ? JSON.stringify(body.additionalCategories) : null,
                images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
                specifications: typeof body.specifications === 'string' ? body.specifications : JSON.stringify(body.specifications || {}),
                variants: typeof body.variants === 'string' ? body.variants : JSON.stringify(body.variants || []),
                tieredPricing: typeof body.tieredPricing === 'string' ? body.tieredPricing : JSON.stringify(body.tieredPricing || []),
                isFeatured: body.isFeatured ?? false,
                isActive: body.isActive ?? true,
                priceDisplay: body.priceDisplay ?? true,
                tags: body.tags || '',
                minOrder: body.minOrder || null,
                priceRange: body.priceRange || null,
                seoTitle: body.seoTitle || null,
                seoDescription: body.seoDescription || null,
                seoKeywords: body.seoKeywords || null,
                ogImage: body.ogImage || null,
            },
        });

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Products POST Error:', error?.message || error);
        return NextResponse.json({ error: error?.message || 'Creation failed' }, { status: 500 });
    }
}
