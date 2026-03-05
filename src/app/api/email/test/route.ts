import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getTransporter } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !['DEVELOPER', 'SUPER_ADMIN'].includes(user.role)) {
        return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
    }

    try {
        const { to } = await req.json();
        if (!to) return NextResponse.json({ error: 'Target email required' }, { status: 400 });

        // First attempt a hard verify of the connection
        const transporter = await getTransporter();
        await transporter.verify();

        const subject = "GlobalStitch: SMTP Connection Successful";
        const html = `
            <h2>System Test Passed</h2>
            <p>Your SMTP credentials configured via the Admin panel are working correctly.</p>
            <hr />
            <p><small>Timestamp: ${new Date().toISOString()}</small></p>
        `;

        await sendEmail(to, subject, html);
        return NextResponse.json({ success: true, message: "Connection verified and test email dispatched." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
