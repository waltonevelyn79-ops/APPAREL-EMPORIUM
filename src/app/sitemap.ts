import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


 // revalidate every hour natively

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.globalstitch.com';

    // Static Routes
    const staticRoutes = ['', '/products', '/about', '/contact', '/blog', '/request-quote'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === '' ? 'daily' : 'weekly') as any,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic Database Entities
    const [products, blogs, categories] = await Promise.all([
        prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
        prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
        prisma.category.findMany({ where: { isActive: true }, select: { slug: true } })
    ]);

    const productRoutes = products.map((post) => ({
        url: `${baseUrl}/products/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as any,
        priority: 0.9,
    }));

    const blogRoutes = blogs.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as any,
        priority: 0.7,
    }));

    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/products?category=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as any,
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes, ...categoryRoutes];
}
