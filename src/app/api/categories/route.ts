import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true, parentId: null },
            include: {
                _count: {
                    select: { products: true }
                },
                children: true
            },
            orderBy: { order: 'asc' }
        });

        // Match the frontend expectation of an array of categories
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const category = await prisma.category.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                image: body.image,
                parentId: body.parentId || null,
                order: body.order || 0,
                isActive: body.isActive !== false,
            }
        });
        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
