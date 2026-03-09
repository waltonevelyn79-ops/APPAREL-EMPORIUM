import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePreflight, withCors } from '../cors';

// ─── PREFLIGHT ────────────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

// ─── GET: Return full category tree — NO auth required ───────────────────────
// This is read-only public data. The uploader tool uses this to populate its
// category dropdown without needing to hardcode anything.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'tree'; // 'tree' or 'flat'

        if (format === 'flat') {
            // Flat list of all leaf categories (the ones you actually assign products to)
            const categories = await prisma.category.findMany({
                where: { isActive: true },
                orderBy: [{ order: 'asc' }, { name: 'asc' }],
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    parentId: true,
                    parent: {
                        select: {
                            name: true,
                            parent: { select: { name: true } }
                        }
                    }
                }
            });

            // Build breadcrumb label
            const flat = categories.map(c => {
                const grandparent = c.parent?.parent?.name;
                const parent = c.parent?.name;
                const breadcrumb = [grandparent, parent, c.name]
                    .filter(Boolean)
                    .join(' → ');
                return {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    breadcrumb,
                    hasParent: !!c.parentId
                };
            });

            return withCors(req, NextResponse.json({
                success: true,
                count: flat.length,
                categories: flat
            }));
        }

        // ── Tree format (default) ──────────────────────────────────────────────
        const roots = await prisma.category.findMany({
            where: { parentId: null, isActive: true },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                children: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        children: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });

        return withCors(req, NextResponse.json({
            success: true,
            count: roots.length,
            megaMenus: roots.map(root => ({
                megaMenu: root.name,
                slug: root.slug,
                sections: root.children.map(section => ({
                    section: section.name,
                    slug: section.slug,
                    categories: section.children.map(cat => ({
                        name: cat.name,
                        slug: cat.slug,
                        id: cat.id
                    }))
                }))
            }))
        }));

    } catch (error: any) {
        console.error('[External API] GET /categories error:', error);
        return withCors(req, NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 }));
    }
}
