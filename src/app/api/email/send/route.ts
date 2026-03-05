import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
        return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
    }

    try {
        const { to, subject, html } = await req.json();

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Missing req properties: {to, subject, html}' }, { status: 400 });
        }

        const result = await sendEmail(to, subject, html);
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
