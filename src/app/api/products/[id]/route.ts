import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: { category: true },
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Product GET Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();

        if (!body.name || !body.categoryId) {
            return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
        }

        /* additionalCategories comes from the form as a string[] array */
        const additionalCats = Array.isArray(body.additionalCategories)
            ? JSON.stringify(body.additionalCategories)
            : (body.additionalCategories || null);

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name: body.name,
                slug: body.slug,
                sku: body.sku || null,
                description: body.description || '',
                shortDescription: body.shortDescription || '',
                categoryId: body.categoryId,
                additionalCategories: additionalCats,
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
        console.error('Product PUT Error:', error?.message || error);
        return NextResponse.json({ error: error?.message || 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.product.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Product DELETE Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
