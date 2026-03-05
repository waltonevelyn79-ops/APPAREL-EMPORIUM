import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');
        const featured = searchParams.get('featured');
        const category = searchParams.get('category');

        const params: any = { where: { isActive: true }, include: { category: true }, orderBy: { createdAt: 'desc' } };

        if (limit) params.take = parseInt(limit);
        if (featured === 'true') params.where.isFeatured = true;
        if (category) params.where.category = { slug: category };

        const products = await prisma.product.findMany(params);
        const total = await prisma.product.count({ where: params.where });

        return NextResponse.json({ success: true, products, total });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const product = await prisma.product.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                shortDescription: body.shortDescription,
                categoryId: body.categoryId,
                images: JSON.stringify(body.images || []),
                specifications: JSON.stringify(body.specifications || {}),
                isFeatured: body.isFeatured || false,
                isActive: body.isActive !== false,
                tags: body.tags || '',
                variants: JSON.stringify(body.variants || [])
            }
        });
        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
