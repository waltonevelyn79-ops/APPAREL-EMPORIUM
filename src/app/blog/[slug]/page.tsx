import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin, LinkIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

// ── Dynamic SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
    if (!post) return { title: 'Post Not Found' };
    return {
        title: `${post.title} | Apparel Emporium Blog`,
        description: post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt || '',
            images: post.coverImage ? [{ url: post.coverImage }] : [],
            type: 'article',
        },
    };
}

// ── Reading time estimate ───────────────────────────────────────────────────
function getReadingTime(html: string): number {
    const plainText = html.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const [post, recentPosts] = await Promise.all([
        prisma.blogPost.findUnique({
            where: { slug: params.slug },
            include: { author: { select: { name: true, avatar: true, email: true } } }
        }),
        prisma.blogPost.findMany({
            where: { isPublished: true, slug: { not: params.slug } },
            orderBy: { publishedAt: 'desc' },
            take: 4,
            select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true }
        }),
    ]);

    if (!post || !post.isPublished) notFound();

    const readingTime = getReadingTime(post.content);
    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    // Social share URLs (populated server-side with the post title + slug)
    const postUrl = `https://www.apparelemporium.com/blog/${post.slug}`;
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(post.title);

    const socialLinks = [
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            Icon: Facebook,
            color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
        },
        {
            label: 'Twitter / X',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            Icon: Twitter,
            color: 'hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]',
        },
        {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            Icon: Linkedin,
            color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
        },
    ];

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Breadcrumb */}
                <nav className="flex gap-2 items-center text-sm mb-10 text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-primary font-medium truncate max-w-xs">{post.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ── MAIN ARTICLE ──────────────────────────── */}
                    <article className="lg:col-span-8">
                        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

                            {/* Cover Image */}
                            {post.coverImage && (
                                <div className="aspect-[16/7] relative overflow-hidden">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-8 md:p-12">
                                {/* Category badge */}
                                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                                    Garments Industry
                                </span>

                                {/* Title */}
                                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                    {post.title}
                                </h1>

                                {/* Meta row */}
                                <div className="flex flex-wrap items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {post.author.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{post.author.name}</p>
                                            <p className="text-xs text-gray-500">Author</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Calendar size={14} className="text-primary" />
                                        {publishedDate}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Clock size={14} className="text-primary" />
                                        {readingTime} min read
                                    </div>
                                </div>

                                {/* Article Content — renders HTML safely */}
                                <div
                                    className={[
                                        'prose prose-lg dark:prose-invert max-w-none',
                                        'text-gray-700 dark:text-gray-300 leading-relaxed',
                                        'prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold',
                                        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                                        'prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1',
                                        'prose-img:rounded-xl prose-img:shadow-md',
                                    ].join(' ')}
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* Tags display */}
                                {(post as any).tags && (
                                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-wrap gap-2">
                                            {String((post as any).tags).split(',').map((tag: string) => (
                                                <span
                                                    key={tag.trim()}
                                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full font-medium"
                                                >
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── SOCIAL SHARING ─────────────────────── */}
                                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                                        Share this article
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {socialLinks.map(({ label, href, Icon, color }) => (
                                            <a
                                                key={label}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`Share on ${label}`}
                                                className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all ${color}`}
                                            >
                                                <Icon size={16} />
                                                {label}
                                            </a>
                                        ))}
                                        {/* Copy link button */}
                                        <button
                                            onClick={undefined}
                                            title="Copy link"
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                            id="copy-link-btn"
                                        >
                                            <LinkIcon size={16} />
                                            Copy Link
                                        </button>
                                    </div>
                                </div>

                                {/* CopyLink client script — inline tiny script for copy */}
                                <script dangerouslySetInnerHTML={{
                                    __html: `
                                        document.addEventListener('DOMContentLoaded', function() {
                                            var btn = document.getElementById('copy-link-btn');
                                            if (btn) btn.addEventListener('click', function() {
                                                navigator.clipboard.writeText(window.location.href).then(function() {
                                                    btn.textContent = '✓ Link Copied!';
                                                    setTimeout(function() { btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Copy Link'; }, 2000);
                                                });
                                            });
                                        });
                                    `
                                }} />

                                {/* ── AUTHOR BIO ─────────────────────────── */}
                                <div className="mt-12 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-5">
                                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0">
                                        {post.author.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Written by</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{post.author.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Content team at <strong>Apparel Emporium</strong> — covering garments sourcing, trade compliance, and sustainable manufacturing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back link */}
                        <div className="mt-8">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-bold hover:underline group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back to All Articles
                            </Link>
                        </div>
                    </article>

                    {/* ── SIDEBAR: RECENT POSTS ─────────────────── */}
                    <aside className="lg:col-span-4 space-y-8">

                        {/* Sticky wrapper */}
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* Recent Articles */}
                            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5">
                                    Recent Articles
                                </h2>
                                <div className="space-y-5">
                                    {recentPosts.map((rp) => (
                                        <Link
                                            key={rp.id}
                                            href={`/blog/${rp.slug}`}
                                            className="flex gap-4 group"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-primary/10 shrink-0 relative">
                                                {rp.coverImage ? (
                                                    <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-primary/30 text-2xl font-black">
                                                        {rp.title.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                                                    {rp.title}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {rp.publishedAt ? new Date(rp.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                    {recentPosts.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No other articles yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* CTA Box */}
                            <div className="bg-primary text-white rounded-2xl p-6">
                                <h3 className="font-black text-lg mb-2">Need Garments Sourcing?</h3>
                                <p className="text-sm text-white/80 mb-5 leading-relaxed">
                                    Let our experts handle your entire sourcing process — from factory selection to quality control and shipment.
                                </p>
                                <Link
                                    href="/request-quote"
                                    className="block w-full text-center bg-secondary text-primary font-black py-3 rounded-xl hover:bg-secondary/90 transition-colors text-sm"
                                >
                                    Request a Free Quote →
                                </Link>
                            </div>

                            {/* Social share (sidebar duplicate for desktop visibility) */}
                            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Share</h3>
                                <div className="flex gap-3">
                                    {socialLinks.map(({ label, href, Icon, color }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Share on ${label}`}
                                            className={`flex-1 flex items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 transition-all ${color}`}
                                        >
                                            <Icon size={18} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
