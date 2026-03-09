import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    try {
        // Check DEVELOPER role by passing authOptions
        const session: any = await getServerSession(authOptions);
        if (!session || session?.user?.role !== 'DEVELOPER') {
            return NextResponse.json({ error: 'Unauthorized: DEVELOPER role required' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const action = body.action || 'full';

        console.log(`[UPDATE] Triggering Action: ${action}...`);

        switch (action) {
            case 'rebuild':
                await execAsync('npm run build');
                break;
            case 'restart':
                await execAsync('pm2 restart garments-website || pm2 start ecosystem.config.js');
                break;
            case 'db':
                await execAsync('npx prisma db push');
                break;
            case 'clear-cache':
                const cachePath = path.join(process.cwd(), '.next', 'cache');
                if (fs.existsSync(cachePath)) {
                    fs.rmSync(cachePath, { recursive: true, force: true });
                }
                break;
            case 'db-optimize':
                // Removed 'prisma generate' to avoid EPERM on Windows when client is in use
                await execAsync('npx prisma db push --skip-generate');
                break;
            case 'media-optimize':
                const imagesCachePath = path.join(process.cwd(), '.next', 'cache', 'images');
                if (fs.existsSync(imagesCachePath)) {
                    fs.rmSync(imagesCachePath, { recursive: true, force: true });
                }
                break;
            case 'revalidate-full':
                const fullCachePath = path.join(process.cwd(), '.next', 'cache');
                if (fs.existsSync(fullCachePath)) {
                    fs.rmSync(fullCachePath, { recursive: true, force: true });
                }
                // Only try to restart if PM2 is actually likely to be there
                await execAsync('pm2 restart garments-website || echo "Cache cleared, manual restart may be required if not using PM2"');
                break;
            case 'full':
            default:
                await execAsync('git pull origin main && npm ci --production && npx prisma db push && npm run build && pm2 restart garments-website');
                break;
        }

        return NextResponse.json({
            success: true,
            message: `Action [${action}] completed successfully`,
        });

    } catch (error: any) {
        console.error(`[UPDATE ERROR]`, error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Action failed',
            details: error.stderr || 'No additional details'
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

