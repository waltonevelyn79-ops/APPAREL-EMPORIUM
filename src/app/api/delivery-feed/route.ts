import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SEED_DATA = [
    {
        id: 'seed-1',
        title: 'Organic Cotton T-Shirts — 50,000 pcs',
        description: 'Bulk order of GOTS-certified organic cotton crew-neck tees shipped to a European retail chain.',
        category: 'Knitwear',
        buyer: 'Nordic Retail Group',
        buyerCountry: 'Sweden',
        quantity: '50,000 pcs',
        status: 'DELIVERED' as const,
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=380&fit=crop&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
        id: 'seed-2',
        title: 'Denim Jackets — In Production',
        description: 'Heavyweight selvedge denim jackets currently in production for a North American brand.',
        category: 'Woven',
        buyer: 'Maple Apparel Co.',
        buyerCountry: 'Canada',
        quantity: '12,000 pcs',
        status: 'IN_PRODUCTION' as const,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=380&fit=crop&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
    {
        id: 'seed-3',
        title: 'Activewear Leggings — Shipped',
        description: 'Moisture-wicking yoga leggings dispatched from Chittagong port to an Australian buyer.',
        category: 'Activewear',
        buyer: 'Southern Fit Pty',
        buyerCountry: 'Australia',
        quantity: '30,000 pcs',
        status: 'SHIPPED' as const,
        imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=380&fit=crop&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
        id: 'seed-4',
        title: 'Kids Polo Shirts — Completed',
        description: 'Pastel polo shirts for a Middle East school uniform program, delivered ahead of schedule.',
        category: 'Kidswear',
        buyer: 'Gulf Uniforms',
        buyerCountry: 'UAE',
        quantity: '80,000 pcs',
        status: 'COMPLETED' as const,
        imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&h=380&fit=crop&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
        id: 'seed-5',
        title: 'Flannel Shirts — In Production',
        description: 'Brushed cotton flannel shirts entering bulk production for a UK high-street label.',
        category: 'Woven',
        buyer: 'Albion Styles',
        buyerCountry: 'United Kingdom',
        quantity: '25,000 pcs',
        status: 'IN_PRODUCTION' as const,
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=380&fit=crop&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
        id: 'seed-6',
        title: 'Hoodies — Delivered',
        description: 'Fleece-lined pullover hoodies completed and delivered to a German distributor.',
        category: 'Knitwear',
        buyer: 'Berlin Trading GmbH',
        buyerCountry: 'Germany',
        quantity: '40,000 pcs',
        status: 'DELIVERED' as const,
        imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=380&fit=crop&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
];

// ─── GET: Fetch delivery feed items ──────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeAll = searchParams.get('all') === 'true';

        const whereClause = includeAll ? {} : { isActive: true };

        const items = await prisma.deliveryUpdate.findMany({
            where: whereClause,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            take: includeAll ? 100 : 20,
        });

        if (items.length === 0 && !includeAll) {
            return NextResponse.json(SEED_DATA);
        }

        const mapped = items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            buyer: item.buyer,
            buyerCountry: item.buyerCountry,
            quantity: item.quantity,
            status: item.status,
            imageUrl: item.imageUrl,
            isActive: item.isActive,
            sortOrder: item.sortOrder,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        return NextResponse.json(SEED_DATA);
    }
}

// ─── POST: Create new delivery update ────────────────────────────────────────
export async function POST(req: NextRequest) {
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
            status = 'COMPLETED',
            imageUrl,
            isActive = true,
            sortOrder = 0
        } = body;

        if (!title || !category || !buyerCountry || !quantity) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: title, category, buyerCountry, and quantity are required.'
            }, { status: 400 });
        }

        const newItem = await prisma.deliveryUpdate.create({
            data: {
                title,
                description: description || '',
                category,
                buyer: buyer || 'International Client',
                buyerCountry,
                quantity,
                status,
                imageUrl: imageUrl || null,
                isActive: isActive !== false,
                sortOrder: Number(sortOrder) || 0,
            }
        });

        return NextResponse.json({ success: true, item: newItem }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create delivery update' }, { status: 500 });
    }
}
