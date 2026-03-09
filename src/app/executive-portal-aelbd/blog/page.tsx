'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, FileText, Eye, EyeOff, Plus, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    author: { name: string | null };
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blog');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            await fetch(`/api/blog/${id}`, { method: 'DELETE' });
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            alert('Failed to delete post.');
        } finally {
            setDeleting(null);
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        setToggling(post.id);
        try {
            const res = await fetch(`/api/blog/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isPublished: !post.isPublished,
                    publishedAt: !post.isPublished ? new Date().toISOString() : null
                }),
            });
            const data = await res.json();
            if (data.id) {
                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPublished: !post.isPublished } : p));
            }
        } catch (e) {
            alert('Failed to update publish status.');
        } finally {
            setToggling(null);
        }
    };

    const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.author?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
                        Content &amp; Journalism
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage articles, news, and brand communications. {posts.length} total posts.
                    </p>
                </div>
                <Link
                    href="/executive-portal-aelbd/blog/new"
                    className="flex items-center gap-2 bg-primary hover:bg-secondary text-white hover:text-primary font-bold py-2.5 px-6 rounded-xl transition-all shadow-md whitespace-nowrap"
                >
                    <Plus size={18} /> Compose New Post
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title or author..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">
                                <th className="p-5">Article</th>
                                <th className="p-5">Author</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Date</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-500 font-medium italic">
                                        {search ? 'No articles match your search.' : 'No articles yet. Start writing!'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((post) => (
                                    <tr key={post.id} className="hover:bg-primary/5 transition-all group">
                                        {/* Title + cover */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                    {post.coverImage ? (
                                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileText size={18} className="text-primary" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{post.title}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">/blog/{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Author */}
                                        <td className="p-5 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                            {post.author?.name || '—'}
                                        </td>

                                        {/* Status badge + toggle */}
                                        <td className="p-5">
                                            <button
                                                onClick={() => handleTogglePublish(post)}
                                                disabled={toggling === post.id}
                                                title={post.isPublished ? 'Click to revert to Draft' : 'Click to Publish'}
                                                className={`px-3 py-1 rounded-full uppercase tracking-widest text-[9px] font-black flex items-center gap-1.5 transition-all hover:opacity-80 ${post.isPublished
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                                                    }`}
                                            >
                                                {toggling === post.id ? (
                                                    <Loader2 size={9} className="animate-spin" />
                                                ) : post.isPublished ? (
                                                    <Eye size={9} />
                                                ) : (
                                                    <EyeOff size={9} />
                                                )}
                                                {post.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </td>

                                        {/* Date */}
                                        <td className="p-5 text-gray-500 dark:text-gray-400 font-mono text-xs whitespace-nowrap">
                                            {new Date(post.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Preview */}
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Preview live"
                                                >
                                                    <Eye size={15} />
                                                </a>
                                                {/* Edit */}
                                                <Link
                                                    href={`/executive-portal-aelbd/blog/${post.id}/edit`}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={15} />
                                                </Link>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    disabled={deleting === post.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    {deleting === post.id ? (
                                                        <Loader2 size={15} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={15} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
