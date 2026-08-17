import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePreflight, withCors } from '../cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function validateApiKey(req: NextRequest): Promise<{ valid: boolean; authorId?: string }> {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) return { valid: false };

    const keySetting = await prisma.siteSetting.findUnique({ where: { key: 'api_external_key' } });
    if (!keySetting || apiKey !== keySetting.value) return { valid: false };

    // Use the developer account as the author for API-created posts
    const devUser = await prisma.user.findFirst({
        where: { role: { in: ['DEVELOPER', 'SUPER_ADMIN'] } },
        select: { id: true }
    });
    return { valid: true, authorId: devUser?.id };
}

// ─── GET: List recent blog posts ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status'); // 'published' | 'draft' | undefined=all

    const where: any = {};
    if (status === 'published') where.isPublished = true;
    if (status === 'draft') where.isPublished = false;

    const posts = await prisma.blogPost.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            createdAt: true,
            tags: true,
            coverImage: true,
            author: { select: { name: true } }
        }
    });

    return withCors(req, NextResponse.json({
        success: true,
        count: posts.length,
        posts
    }));
}

// ─── POST: Create a new blog post via external tool ──────────────────────────
export async function POST(req: NextRequest) {
    try {
        const auth = await validateApiKey(req);
        if (!auth.valid) {
            return withCors(req, NextResponse.json(
                { success: false, error: 'Unauthorized. Provide a valid x-api-key header.' },
                { status: 401 }
            ));
        }

        const body = await req.json();
        const {
            title,
            content,
            excerpt,
            tags,
            coverImage,
            slug,
            isPublished = false,
            seoTitle,
            seoDescription,
        } = body;

        if (!title || !content) {
            return withCors(req, NextResponse.json({
                success: false,
                error: 'Missing required fields: title and content are required.'
            }, { status: 400 }));
        }

        // Generate slug from title if not provided
        let finalSlug = slug || title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Ensure unique slug
        const existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
        if (existing) finalSlug = `${finalSlug}-${Date.now()}`;

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug: finalSlug,
                content,
                excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200),
                coverImage: coverImage || null,
                tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
                isPublished: Boolean(isPublished),
                authorId: auth.authorId!,
                seoTitle: seoTitle || title,
                seoDescription: seoDescription || (excerpt || '').substring(0, 160),
            }
        });

        return withCors(req, NextResponse.json({
            success: true,
            message: `✅ Blog post "${post.title}" created successfully!`,
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                isPublished: post.isPublished,
                url: `/blog/${post.slug}`
            }
        }, { status: 201 }));

    } catch (error: any) {
        console.error('[External API] POST /blog error:', error);
        return withCors(req, NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 }));
    }
}
