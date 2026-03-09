import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── GET: List all blog posts (admin sees all; public sees published only) ────
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');
        const all = searchParams.get('all');

        const session = await getServerSession(authOptions);
        const isAdmin = !!session?.user;

        const where: any = isAdmin && all === '1' ? {} : { isPublished: true };
        const take = limit ? parseInt(limit) : undefined;

        const posts = await prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take,
            include: { author: { select: { name: true, email: true } } }
        });
        const total = await prisma.blogPost.count({ where });

        return NextResponse.json({ success: true, posts, blogs: posts, total });
    } catch (error: any) {
        console.error('Blog GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }
}

// ── POST: Create a new blog post ────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session!.user as any).id as string;

        const body = await req.json();
        const { title, slug, excerpt, content, coverImage, isPublished, publishedAt, seoTitle, seoDescription } = body;

        if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

        // Auto-generate slug from title if not provided
        const finalSlug = (slug?.trim() || title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-'))
            .substring(0, 80);

        // Ensure slug uniqueness by appending timestamp if collision
        const existing = await prisma.blogPost.findFirst({ where: { slug: finalSlug } });
        const uniqueSlug = existing ? `${finalSlug}-${Date.now().toString().slice(-5)}` : finalSlug;

        const post = await (prisma.blogPost as any).create({
            data: {
                title: title.trim(),
                slug: uniqueSlug,
                excerpt: excerpt?.trim() || null,
                content: content.trim(),
                coverImage: coverImage || null,
                isPublished: isPublished === true,
                publishedAt: isPublished && publishedAt ? new Date(publishedAt) : null,
                seoTitle: seoTitle?.trim() || null,
                seoDescription: seoDescription?.trim() || null,
                authorId: userId,
            }
        });

        return NextResponse.json({ success: true, id: post.id, slug: post.slug });
    } catch (error: any) {
        console.error('Blog POST error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists. Please change the URL slug.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
