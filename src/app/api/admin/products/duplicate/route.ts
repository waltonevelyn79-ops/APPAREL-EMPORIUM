import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';
import { hasPermission } from '@/lib/permissions';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const role = (session.user as any).role;
        if (!hasPermission(role, 'products.create')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { id } = await req.json();
        const sourceProduct = await prisma.product.findUnique({ where: { id } });

        if (!sourceProduct) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        // Generate unique slug
        let newSlug = `${sourceProduct.slug}-copy`;
        const existingCount = await prisma.product.count({ where: { slug: { startsWith: newSlug } } });
        if (existingCount > 0) newSlug = `${newSlug}-${existingCount + 1}`;

        const clonedProduct = await prisma.product.create({
            data: {
                name: `${sourceProduct.name} (Copy)`,
                slug: newSlug,
                description: sourceProduct.description,
                shortDescription: sourceProduct.shortDescription,
                categoryId: sourceProduct.categoryId,
                images: sourceProduct.images,
                specifications: sourceProduct.specifications,
                isFeatured: false,
                isActive: false, // Clone as inactive by default
                tags: sourceProduct.tags,
                variants: sourceProduct.variants
            }
        });

        await logActivity({
            userId: (session.user as any).id,
            action: 'CREATE',
            entity: 'Product',
            entityId: clonedProduct.id,
            details: `Duplicated product ${sourceProduct.name} to ${clonedProduct.name}`,
            request: req as any
        });

        return NextResponse.json({ success: true, product: clonedProduct });
    } catch (error: any) {
        console.error("Duplicate Project Error:", error);
        return NextResponse.json({ error: 'Duplication failed' }, { status: 500 });
    }
}

