import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'DEVELOPER') {
        return NextResponse.json({ error: 'Permission Denied. DEVELOPER access required for binary cloning.' }, { status: 403 });
    }

    try {
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        if (!fs.existsSync(dbPath)) {
            return NextResponse.json({ error: 'Database ledger file not found on disk at map vector.' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(dbPath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/x-sqlite3',
                'Content-Disposition': `attachment; filename=apparelemporium-backup-${new Date().toISOString().split('T')[0]}.db`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'DEVELOPER') {
        return NextResponse.json({ error: 'Permission Denied. God mode routing required for hardware rollback.' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'No binary payload supplied.' }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        // Critical Section: Ensure Prisma disconnects its pooling before overwriting locked DB file 
        await prisma.$disconnect();

        fs.writeFileSync(dbPath, buffer);

        // Re-establish connection map internally safely
        await prisma.$connect();

        return NextResponse.json({ success: true, message: "Node overwritten. Prisma disconnected and rebooted." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

