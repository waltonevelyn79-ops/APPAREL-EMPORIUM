import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';
import { hasPermission } from '@/lib/permissions';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const settings = await prisma.siteSetting.findMany();
        const cfg = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ success: true, settings: cfg });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;

        if (!session || (!hasPermission(role, 'settings.update') && !['SUPER_ADMIN', 'DEVELOPER'].includes(role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await req.json();

        for (const [key, value] of Object.entries(data)) {
            await prisma.siteSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        }

        await logActivity({
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'SiteSetting',
            details: `Updated general settings`,
            request: req as any
        });

        return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    } catch (error: any) {
        console.error("Settings POST Error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
