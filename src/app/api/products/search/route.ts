import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) return NextResponse.json({ success: true, products: [] });

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { slug: { contains: q } },
                    { tags: { contains: q } }
                ],
                isActive: true
            },
            take: 8,
            select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                category: { select: { name: true } }
            }
        });

        // Parse images for thumbnails
        const formatted = products.map(p => {
            let thumb = '/images/placeholder-product.svg';
            try {
                const imgs = JSON.parse(p.images);
                if (Array.isArray(imgs) && imgs.length > 0) {
                    const first = imgs[0];
                    if (typeof first === 'object' && first !== null && first.url) {
                        thumb = first.url;
                    } else if (typeof first === 'string') {
                        thumb = first;
                    }
                }
            } catch (e) { }
            return { ...p, thumbnail: thumb };
        });

        return NextResponse.json({ success: true, products: formatted });
    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}

