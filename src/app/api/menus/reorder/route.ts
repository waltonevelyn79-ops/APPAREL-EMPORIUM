import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';


export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;
        // Require SUPER_ADMIN or DEVELOPER array
        if (!session || (!hasPermission(role, 'menus.update') && !['SUPER_ADMIN', 'DEVELOPER'].includes(role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await req.json();
        const { items } = data; // Expected: [{ id: '...', order: 0, parentId: '...' }, ...]

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid data payload" }, { status: 400 });
        }

        const isSuperAdmin = ['SUPER_ADMIN', 'DEVELOPER'].includes(role);
        if (!isSuperAdmin) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        // Use a transaction for bulk update
        await prisma.$transaction(
            items.map((item: any) =>
                prisma.menuItem.update({
                    where: { id: item.id },
                    data: {
                        order: item.order,
                        parentId: item.parentId || null
                    }
                })
            )
        );

        await logActivity({
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'MenuItem',
            details: `Reordered and nested ${items.length} menu items`,
            request: req as any
        });

        return NextResponse.json({ success: true, count: items.length });
    } catch (error: any) {
        console.error("Menus Reorder Error:", error);
        return NextResponse.json({ error: "Failed to reorder menus" }, { status: 500 });
    }
}
