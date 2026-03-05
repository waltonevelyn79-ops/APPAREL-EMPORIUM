import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const forms = await prisma.customForm.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        return NextResponse.json({ success: true, forms });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch custom forms" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const form = await prisma.customForm.create({
            data: {
                name: body.name,
                slug: body.slug,
                fields: JSON.stringify(body.fields || []),
                submitEmail: body.submitEmail || null,
                successMessage: body.successMessage || null,
                isActive: body.isActive !== false
            }
        });

        return NextResponse.json({ success: true, form });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create custom form" }, { status: 500 });
    }
}
