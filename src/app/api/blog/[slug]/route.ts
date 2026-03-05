import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(
    req: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // Allow fetch by ID or slug
        const isId = params.slug.length === 25 || params.slug.length === 36; // CUID or UUID heuristic

        const blog = await prisma.blogPost.findFirst({
            where: isId
                ? { id: params.slug }
                : { slug: params.slug },
            include: { author: true }
        });

        if (!blog) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, blog });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { slug: string } }
) {
    try {
        await prisma.blogPost.deleteMany({
            where: {
                OR: [
                    { id: params.slug },
                    { slug: params.slug }
                ]
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
