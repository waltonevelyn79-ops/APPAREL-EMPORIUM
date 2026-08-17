import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── GET: Fetch single delivery update ───────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const item = await prisma.deliveryUpdate.findUnique({
            where: { id: params.id },
        });

        if (!item) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, item });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ─── PUT / PATCH: Update delivery update ─────────────────────────────────────
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const apiKey = req.headers.get('x-api-key');

        let isAuthorized = false;
        if (session && (session.user as any)?.role) {
            isAuthorized = true;
        } else if (apiKey) {
            const validKeySetting = await prisma.siteSetting.findUnique({
                where: { key: 'api_external_key' }
            });
            if (validKeySetting && apiKey === validKeySetting.value) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            title,
            description,
            category,
            buyer,
            buyerCountry,
            quantity,
            status,
            imageUrl,
            isActive,
            sortOrder
        } = body;

        const updated = await prisma.deliveryUpdate.update({
            where: { id: params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(category !== undefined && { category }),
                ...(buyer !== undefined && { buyer }),
                ...(buyerCountry !== undefined && { buyerCountry }),
                ...(quantity !== undefined && { quantity }),
                ...(status !== undefined && { status }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(isActive !== undefined && { isActive }),
                ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
            }
        });

        return NextResponse.json({ success: true, item: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to update delivery update' }, { status: 500 });
    }
}

// ─── DELETE: Delete delivery update ──────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const apiKey = req.headers.get('x-api-key');

        let isAuthorized = false;
        if (session && (session.user as any)?.role) {
            isAuthorized = true;
        } else if (apiKey) {
            const validKeySetting = await prisma.siteSetting.findUnique({
                where: { key: 'api_external_key' }
            });
            if (validKeySetting && apiKey === validKeySetting.value) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.deliveryUpdate.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete delivery update' }, { status: 500 });
    }
}
