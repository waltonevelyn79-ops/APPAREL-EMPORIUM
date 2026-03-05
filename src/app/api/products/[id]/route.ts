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
            include: { category: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                shortDescription: body.shortDescription,
                categoryId: body.categoryId,
                images: JSON.stringify(body.images || []),
                specifications: JSON.stringify(body.specifications || {}),
                isFeatured: body.isFeatured,
                isActive: body.isActive,
                tags: body.tags || '',
                variants: JSON.stringify(body.variants || [])
            }
        });

        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.product.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
