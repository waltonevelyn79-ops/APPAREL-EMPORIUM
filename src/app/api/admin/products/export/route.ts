import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const role = (session.user as any).role;
        if (!hasPermission(role, 'products.view')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });

        const exportData = products.map(p => ({
            ID: p.id,
            Name: p.name,
            Slug: p.slug,
            Category: p.category?.name || 'Uncategorized',
            Description: p.shortDescription || p.description?.substring(0, 100),
            Status: p.isActive ? 'Active' : 'Inactive',
            Featured: p.isFeatured ? 'Yes' : 'No',
            CreatedAt: p.createdAt.toISOString()
        }));

        return NextResponse.json({ success: true, data: exportData });
    } catch (error: any) {
        console.error("Export Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch export data' }, { status: 500 });
    }
}

