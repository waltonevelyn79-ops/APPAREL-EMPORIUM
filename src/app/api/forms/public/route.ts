import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    try {
        const form = await prisma.customForm.findUnique({
            where: { slug, isActive: true },
            select: {
                id: true,
                name: true,
                fields: true,
                successMessage: true
            }
        });

        if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

        return NextResponse.json({ success: true, form });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

