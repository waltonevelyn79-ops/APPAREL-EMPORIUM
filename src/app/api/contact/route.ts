import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        const params: any = { orderBy: { createdAt: 'desc' } };
        if (limit) params.take = parseInt(limit);

        const inquiries = await prisma.contactInquiry.findMany(params);
        const total = await prisma.contactInquiry.count();

        return NextResponse.json({ success: true, inquiries, total });
    } catch (error) {
        console.error("Failed to fetch inquiries:", error);
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const inquiry = await prisma.contactInquiry.create({
            data: {
                name: body.name,
                email: body.email,
                company: body.company || null,
                phone: body.phone || null,
                country: body.country || null,
                message: body.message,
                productInterest: body.productInterest || null,
            }
        });

        // We could trigger an email hook here via src/lib/email.ts

        return NextResponse.json({ success: true, inquiry });
    } catch (error) {
        console.error("Failed to submit inquiry:", error);
        return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
    }
}
