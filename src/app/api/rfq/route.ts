import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        const params: any = { orderBy: { createdAt: 'desc' }, include: { product: true } };
        if (limit) params.take = parseInt(limit);

        const rfqs = await prisma.rFQ.findMany(params);
        const total = await prisma.rFQ.count();

        return NextResponse.json({ success: true, rfqs, total });
    } catch (error) {
        console.error("Failed to fetch RFQs:", error);
        return NextResponse.json({ error: "Failed to fetch RFQs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rfq = await prisma.rFQ.create({
            data: {
                productId: body.productId || null,
                productName: body.productName || null,
                buyerName: body.buyerName,
                buyerEmail: body.buyerEmail,
                buyerCompany: body.buyerCompany || null,
                buyerPhone: body.buyerPhone || null,
                buyerCountry: body.buyerCountry || null,
                quantity: parseInt(body.quantity) || 0,
                targetPrice: body.targetPrice || null,
                deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
                shippingTo: body.shippingTo || null,
                specialRequirements: body.specialRequirements || null,
            }
        });
        return NextResponse.json({ success: true, rfq });
    } catch (error) {
        console.error("Failed to submit RFQ:", error);
        return NextResponse.json({ error: "Failed to submit RFQ" }, { status: 500 });
    }
}

