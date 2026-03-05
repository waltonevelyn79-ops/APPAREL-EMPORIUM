import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        const params: any = { orderBy: { createdAt: 'desc' }, include: { author: true } };
        if (limit) params.take = parseInt(limit);

        // Public pages only see published blogs
        if (!req.url.includes('/admin/')) {
            params.where = { isPublished: true };
        }

        const blogs = await prisma.blogPost.findMany(params);
        const total = await prisma.blogPost.count(params.where ? { where: params.where } : undefined);

        return NextResponse.json({ success: true, blogs, total });
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }
}
