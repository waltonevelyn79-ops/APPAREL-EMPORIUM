import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
        include: { author: true }
    });

    if (!post || !post.isPublished) {
        notFound();
    }

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/blog" className="inline-block text-primary font-semibold mb-8 hover:underline">
                    ← Back to Blog
                </Link>

                <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex justify-center items-center font-bold text-lg">
                            {post.author.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{post.author.name}</p>
                            <p className="text-sm text-gray-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                        </div>
                    </div>

                    {post.coverImage && (
                        <div className="rounded-2xl overflow-hidden mb-10 border border-gray-100 dark:border-gray-800">
                            <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
                        </div>
                    )}

                    <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        {post.content.split('\n').map((para, i) => (
                            <p key={i} className="mb-6 leading-relaxed">{para}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
