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
        const { ids, action, value } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        switch (action) {
            case 'DELETE':
                if (!hasPermission(role, 'products.delete')) return NextResponse.json({ error: 'No permission' }, { status: 403 });
                await prisma.product.deleteMany({ where: { id: { in: ids } } });
                break;
            case 'STATUS':
                if (!hasPermission(role, 'products.update')) return NextResponse.json({ error: 'No permission' }, { status: 403 });
                await prisma.product.updateMany({
                    where: { id: { in: ids } },
                    data: { isActive: Boolean(value) }
                });
                break;
            case 'CATEGORY':
                if (!hasPermission(role, 'products.update')) return NextResponse.json({ error: 'No permission' }, { status: 403 });
                await prisma.product.updateMany({
                    where: { id: { in: ids } },
                    data: { categoryId: String(value) }
                });
                break;
            case 'FEATURED':
                if (!hasPermission(role, 'products.update')) return NextResponse.json({ error: 'No permission' }, { status: 403 });
                await prisma.product.updateMany({
                    where: { id: { in: ids } },
                    data: { isFeatured: Boolean(value) }
                });
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await logActivity({
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'Product',
            details: `Performed bulk action ${action} on ${ids.length} products`,
            request: req as any
        });

        return NextResponse.json({ success: true, message: `Action ${action} completed for ${ids.length} products` });
    } catch (error: any) {
        console.error("Bulk Action Error:", error);
        return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
    }
}

