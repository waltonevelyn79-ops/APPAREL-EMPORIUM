import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── GET: Fetch single post by ID or slug ────────────────────────────────────
export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        // Detect if it looks like a CUID (starts with 'c' and is ~25 chars) or UUID
        const looksLikeId = /^[a-z0-9]{20,36}$/.test(params.slug) && !params.slug.includes('-blog-');

        const post = await prisma.blogPost.findFirst({
            where: looksLikeId
                ? { OR: [{ id: params.slug }, { slug: params.slug }] }
                : { slug: params.slug },
            include: { author: { select: { name: true, email: true, avatar: true } } }
        });

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        return NextResponse.json({ success: true, post, blog: post });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// ── PATCH: Update a blog post (edit + publish toggle) ───────────────────────
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const {
            title, slug, excerpt, content, coverImage,
            isPublished, publishedAt, seoTitle, seoDescription
        } = body;

        // Find the post (accepting ID or slug)
        const existing = await prisma.blogPost.findFirst({
            where: { OR: [{ id: params.slug }, { slug: params.slug }] }
        });
        if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (slug !== undefined) updateData.slug = slug.trim();
        if (excerpt !== undefined) updateData.excerpt = excerpt?.trim() || null;
        if (content !== undefined) updateData.content = content.trim();
        if (coverImage !== undefined) updateData.coverImage = coverImage || null;
        if (seoTitle !== undefined) updateData.seoTitle = seoTitle?.trim() || null;
        if (seoDescription !== undefined) updateData.seoDescription = seoDescription?.trim() || null;

        if (isPublished !== undefined) {
            updateData.isPublished = isPublished;
            if (isPublished && !existing.publishedAt) {
                updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
            } else if (!isPublished) {
                updateData.publishedAt = null;
            }
        }

        const updated = await prisma.blogPost.update({
            where: { id: existing.id },
            data: updateData,
            include: { author: { select: { name: true } } }
        });

        return NextResponse.json({ success: true, id: updated.id, slug: updated.slug, post: updated });
    } catch (error: any) {
        console.error('Blog PATCH error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already in use by another post' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// ── DELETE: Remove a blog post ────────────────────────────────────────────
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.blogPost.deleteMany({
            where: { OR: [{ id: params.slug }, { slug: params.slug }] }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Blog DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
