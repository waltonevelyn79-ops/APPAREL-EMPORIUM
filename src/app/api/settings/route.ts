import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group');

        // Allow public read access to settings for branding/ui
        const settings = await prisma.siteSetting.findMany({
            ...(group ? { where: { group } } : {})
        });

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
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group') || 'general';

        for (const [key, value] of Object.entries(data)) {
            await prisma.siteSetting.upsert({
                where: { key },
                update: { value: String(value), group },
                create: { key, value: String(value), group }
            });
        }

        await logActivity({
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'SiteSetting',
            details: `Updated ${group} settings`,
            request: req as any
        });

        return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    } catch (error: any) {
        console.error("Settings POST Error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
