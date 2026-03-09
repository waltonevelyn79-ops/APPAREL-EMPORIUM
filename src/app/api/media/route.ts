import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder');
        const limit = searchParams.get('limit');
        const search = searchParams.get('search');

        const params: any = {
            orderBy: { createdAt: 'desc' },
            where: {}
        };

        if (folder && folder !== 'all') {
            params.where.folder = folder;
        }

        if (search) {
            params.where.OR = [
                { fileName: { contains: search } },
                { originalName: { contains: search } }
            ];
        }

        if (limit) {
            params.take = parseInt(limit);
        }

        const files = await prisma.mediaFile.findMany(params);
        return NextResponse.json({ success: true, files });
    } catch (error) {
        console.error("Failed to fetch media:", error);
        return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }
}
