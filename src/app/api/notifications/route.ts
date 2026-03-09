import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';


// Helper for generic session/role parsing internally
async function getUser() {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return null;
    return await prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function GET(req: NextRequest) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const unread = searchParams.get('unread') === 'true';
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');

        const where: any = { userId: user.id };
        if (unread) where.isRead = false;
        if (type && type !== 'ALL') where.type = type;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit
            }),
            prisma.notification.count({ where })
        ]);

        return NextResponse.json({ success: true, notifications, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, isRead } = await req.json();

        await prisma.notification.update({
            where: { id, userId: user.id }, // Security constraint bounding mutator only against owner
            data: { isRead }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const id = new URL(req.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.notification.delete({
            where: { id, userId: user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Internal programmatic proxy to create notifications explicitly bound from internal Node streams (e.g. from /api/rfq payload ingestion mapping internally to valid admin accounts) 
export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only internal microservices / Admins can trigger these manually
    if (!['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
        return NextResponse.json({ error: 'System Access Denied' }, { status: 403 });
    }

    try {
        const { targetUserId, type, title, message } = await req.json();
        const notification = await prisma.notification.create({
            data: { userId: targetUserId, type, title, message }
        });
        return NextResponse.json({ success: true, notification });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

