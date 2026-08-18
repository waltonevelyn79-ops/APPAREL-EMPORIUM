import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePreflight, withCors } from '../cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

export async function GET(req: NextRequest) {
    try {
        const items = await prisma.deliveryUpdate.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            take: 50
        });

        return withCors(req, NextResponse.json({ success: true, count: items.length, data: items }));
    } catch (error: any) {
        console.error('[External Delivery Feed] GET error:', error);
        return withCors(req, NextResponse.json({ success: true, count: 0, data: [] }));
    }
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get('x-api-key');
        if (!apiKey) {
            return withCors(req, NextResponse.json({ success: false, error: 'x-api-key header missing' }, { status: 401 }));
        }

        const validKey = await prisma.siteSetting.findUnique({ where: { key: 'api_external_key' } });
        if (!validKey || apiKey !== validKey.value) {
            return withCors(req, NextResponse.json({ success: false, error: 'Invalid API key' }, { status: 403 }));
        }

        const body = await req.json();
        const {
            title,
            description = '',
            category,
            buyer = 'International Buyer',
            buyerCountry,
            quantity,
            status = 'COMPLETED',
            imageUrl,
            isActive = true,
            sortOrder = 0
        } = body;

        if (!title || !category || !buyerCountry || !quantity) {
            return withCors(req, NextResponse.json({
                success: false,
                error: 'Required fields missing: title, category, buyerCountry, quantity'
            }, { status: 400 }));
        }

        const item = await prisma.deliveryUpdate.create({
            data: {
                title,
                description,
                category,
                buyer,
                buyerCountry,
                quantity,
                status,
                imageUrl: imageUrl || null,
                isActive: isActive !== false,
                sortOrder: Number(sortOrder) || 0
            }
        });

        return withCors(req, NextResponse.json({ success: true, message: 'Delivery update created successfully', data: item }, { status: 201 }));
    } catch (error: any) {
        return withCors(req, NextResponse.json({ success: false, error: error.message }, { status: 500 }));
    }
}
