import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const category = await prisma.category.update({
            where: { id: params.id },
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                image: body.image,
                parentId: body.parentId || null,
                order: body.order || 0,
                isActive: body.isActive
            }
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.category.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        // Handle constraint violations (e.g. Products still attached)
        return NextResponse.json({ error: "Failed to delete category. Ensure no products are attached." }, { status: 500 });
    }
}
