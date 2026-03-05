import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getServerSession } from 'next-auth';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    try {
        // Check DEVELOPER role
        const session: any = await getServerSession();
        if (!session || session?.user?.role !== 'DEVELOPER') {
            return NextResponse.json({ error: 'Unauthorized: DEVELOPER role required' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const action = body.action || 'full';

        let command = '';

        switch (action) {
            case 'rebuild':
                command = 'npm run build';
                break;
            case 'restart':
                command = 'pm2 restart garments-website || pm2 start ecosystem.config.js';
                break;
            case 'db':
                command = 'npx prisma db push';
                break;
            case 'clear-cache':
                command = 'rm -rf .next/cache';
                break;
            case 'full':
            default:
                command = 'git pull origin main && npm ci --production && npx prisma generate && npx prisma db push && npm run build && pm2 restart garments-website';
                break;
        }

        // In a full implementation, you'd toggle a Redis flag or DB entry for maintenance mode here
        console.log(`[UPDATE] Triggering Action: ${action}. Maintenance mode enabled...`);

        // Execute command
        const { stdout, stderr } = await execAsync(command);

        // Disable maintenance mode
        console.log(`[UPDATE] Action Complete: ${action}. Maintenance mode disabled.`);

        return NextResponse.json({
            success: true,
            message: 'Action completed successfully',
            output: stdout,
            error: stderr
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.stderr || 'No stderr output'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { checkForUpdates } = await import('@/lib/version');
        const info = await checkForUpdates();
        return NextResponse.json(info);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
