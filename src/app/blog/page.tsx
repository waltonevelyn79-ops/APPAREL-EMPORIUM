import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';


export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        include: { author: true }
    });

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Insights & News</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-12">
                    Latest updates from the garments sourcing and manufacturing industry.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col"
                        >
                            <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                                {post.coverImage ? (
                                    <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary/50 group-hover:scale-105 transition-transform duration-500">
                                        <span className="text-4xl font-bold truncate px-4 opacity-30">{post.title}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex justify-between">
                                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                                    <span className="font-medium text-primary">Read More →</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}

                    {posts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-white dark:bg-dark-surface rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                            No articles published yet. Check back soon!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
