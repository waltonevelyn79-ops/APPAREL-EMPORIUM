import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar, User, Clock, ArrowRight, Rss } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Blog & Industry Insights | Apparel Emporium',
    description: 'Read the latest articles on garments sourcing, sustainable manufacturing, trade compliance, and Bangladesh textile industry news from Apparel Emporium.',
    openGraph: {
        title: 'Blog & Industry Insights | Apparel Emporium',
        description: 'Stay ahead with expert sourcing insights and garments industry news.',
        type: 'website',
    },
};

function getReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        include: { author: { select: { name: true } } }
    });

    const featured = posts[0];
    const rest = posts.slice(1);

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen">

            {/* ── PAGE HERO ───────────────────────────────────────── */}
            <div className="bg-primary text-white py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Rss className="w-5 h-5 text-secondary" />
                        <span className="text-secondary text-xs font-black uppercase tracking-widest">Apparel Emporium</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                        Insights &amp; Industry <br className="hidden md:block" />
                        <span className="text-secondary">News</span>
                    </h1>
                    <p className="text-lg text-white/75 max-w-xl leading-relaxed">
                        Expert perspectives on garments sourcing, sustainable manufacturing,
                        trade compliance, and Bangladesh textile industry trends.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-16">

                {posts.length === 0 ? (
                    <div className="py-24 text-center bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No articles yet</p>
                        <p className="text-gray-500">Check back soon for garments industry insights.</p>
                    </div>
                ) : (
                    <>
                        {/* ── FEATURED POST (Hero Card) ──────────────── */}
                        {featured && (
                            <Link
                                href={`/blog/${featured.slug}`}
                                className="group block mb-16 bg-white dark:bg-dark-surface rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Image */}
                                    <div className="aspect-video lg:aspect-auto relative overflow-hidden bg-primary/10 min-h-[320px]">
                                        {featured.coverImage ? (
                                            <img
                                                src={featured.coverImage}
                                                alt={featured.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-7xl font-black text-primary/20">{featured.title.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-secondary text-primary text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="p-8 md:p-12 flex flex-col justify-center">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                                            <span className="flex items-center gap-1.5">
                                                <User size={12} className="text-primary" />
                                                {featured.author?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-primary" />
                                                {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-primary" />
                                                {getReadingTime(featured.content)} min read
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors leading-tight">
                                            {featured.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 line-clamp-4">
                                            {featured.excerpt || featured.content.replace(/<[^>]*>/g, '')}
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                                            Read Full Article <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* ── REST OF POSTS ─────────────────────────── */}
                        {rest.length > 0 && (
                            <>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-8 h-1 bg-primary rounded-full inline-block" />
                                    More Articles
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {rest.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/blog/${post.slug}`}
                                            className="group flex flex-col bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-[16/9] relative overflow-hidden bg-primary/10">
                                                {post.coverImage ? (
                                                    <img
                                                        src={post.coverImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                                                        <span className="text-5xl font-black">{post.title.charAt(0)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card body */}
                                            <div className="p-6 flex flex-col flex-1">
                                                {/* Meta */}
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={11} />
                                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={11} />
                                                        {getReadingTime(post.content)} min
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-3 flex-1">
                                                    {post.title}
                                                </h3>

                                                {/* Excerpt */}
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-5">
                                                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120)}
                                                </p>

                                                {/* Author + CTA */}
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                            {post.author?.name?.charAt(0) || 'A'}
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            {post.author?.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                                        Read <ArrowRight size={12} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* ── NEWSLETTER CTA ─────────────────────────────── */}
                <div className="mt-24 bg-primary rounded-3xl p-10 md:p-16 text-center text-white">
                    <h2 className="text-3xl font-black mb-3">Stay Ahead of the Industry</h2>
                    <p className="text-white/75 mb-8 max-w-lg mx-auto">
                        Get the latest sourcing insights, sustainability news, and factory compliance updates delivered to your inbox.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-secondary text-primary font-black px-8 py-4 rounded-2xl hover:bg-secondary/90 transition-colors shadow-lg"
                    >
                        Get in Touch <ArrowRight size={18} />
                    </Link>
                </div>

            </div>
        </div>
    );
}
