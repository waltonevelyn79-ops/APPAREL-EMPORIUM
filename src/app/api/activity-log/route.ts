import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

async function isAuthorized() {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return false;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    return user && ['DEVELOPER', 'SUPER_ADMIN'].includes(user.role);
}

export async function GET(req: NextRequest) {
    if (!(await isAuthorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const entity = searchParams.get('entity');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');

        const where: any = {};
        if (action && action !== 'ALL') where.action = action;
        if (entity && entity !== 'ALL') where.entity = entity;

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: { user: { select: { name: true, email: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.activityLog.count({ where })
        ]);

        return NextResponse.json({ success: true, logs, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
