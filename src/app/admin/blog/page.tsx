import { prisma } from '@/lib/prisma';
import { Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default async function AdminBlogPage() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Blog Posts</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage news and articles.</p>
                </div>
                <Link href="/admin/blog/new" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                    + New Post
                </Link>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                <th className="p-5 font-semibold">Title</th>
                                <th className="p-5 font-semibold">Author</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold">Date</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-5 font-bold text-gray-900 dark:text-white">
                                        {post.title}
                                    </td>
                                    <td className="p-5 text-gray-600 dark:text-gray-300">
                                        {post.author?.name || '-'}
                                    </td>
                                    <td className="p-5">
                                        {post.isPublished ? (
                                            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">Published</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Draft</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-gray-500 dark:text-gray-400">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-5 text-right space-x-3">
                                        <button className="text-primary hover:text-secondary transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4 inline-block" />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {posts.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No blog posts found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
