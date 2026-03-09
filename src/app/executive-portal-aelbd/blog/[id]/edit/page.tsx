'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImagePicker from '@/components/admin/ImagePicker';
import { Save, Eye, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface BlogFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    isPublished: boolean;
    isFeatured: boolean;
    tags: string;
    seoTitle: string;
    seoDescription: string;
}

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [originalSlug, setOriginalSlug] = useState('');

    const [form, setForm] = useState<BlogFormData>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        isPublished: false,
        isFeatured: false,
        tags: '',
        seoTitle: '',
        seoDescription: '',
    });

    // Fetch existing post data
    useEffect(() => {
        if (!id) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`);
                if (!res.ok) { setNotFound(true); return; }
                const data = await res.json();
                const post = data.post || data.blog;
                if (!post) { setNotFound(true); return; }

                setOriginalSlug(post.slug);
                setForm({
                    title: post.title || '',
                    slug: post.slug || '',
                    excerpt: post.excerpt || '',
                    content: post.content || '',
                    coverImage: post.coverImage || '',
                    isPublished: post.isPublished || false,
                    isFeatured: post.isFeatured || false,
                    tags: post.tags || '',
                    seoTitle: post.seoTitle || '',
                    seoDescription: post.seoDescription || '',
                });
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const update = (field: keyof BlogFormData, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSave = async (publish?: boolean) => {
        if (!form.title.trim()) {
            setMessage({ text: 'Title is required.', type: 'error' });
            return;
        }
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const payload: any = { ...form };
            if (publish !== undefined) {
                payload.isPublished = publish;
                if (publish) payload.publishedAt = new Date().toISOString();
            }

            const res = await fetch(`/api/blog/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success || data.id) {
                setMessage({ text: '✅ Post saved successfully.', type: 'success' });
                // Update slug state if it changed
                if (data.slug) setOriginalSlug(data.slug);
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: data.error || 'Save failed.', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Post Not Found</h2>
                <p className="text-gray-500">The blog post you&apos;re trying to edit does not exist.</p>
                <Link href="/executive-portal-aelbd/blog" className="text-primary font-bold hover:underline">
                    ← Back to Blog List
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24">

            {/* ── HEADER ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/executive-portal-aelbd/blog"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Edit Article</h1>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/blog/{originalSlug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href={`/blog/${originalSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Eye size={15} /> Preview
                    </a>
                    {form.isPublished ? (
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 border border-orange-300 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                            Revert to Draft
                        </button>
                    ) : (
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                            Publish
                        </button>
                    )}
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary hover:text-primary transition-colors shadow-md disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Status message */}
            {message.text && (
                <div className={`mb-6 px-5 py-4 rounded-xl text-sm font-semibold border-l-4 ${message.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-500'
                    : 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-500'}`}
                >
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── LEFT: Main Content ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Title */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                            Article Title *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => update('title', e.target.value)}
                            className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-0 outline-none placeholder-gray-300 dark:placeholder-gray-600"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                            Short Excerpt
                        </label>
                        <textarea
                            value={form.excerpt}
                            onChange={e => update('excerpt', e.target.value)}
                            rows={3}
                            placeholder="2–3 sentence summary shown on the blog listing card..."
                            className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 resize-none placeholder-gray-400"
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                            Article Content *
                        </label>
                        <RichTextEditor
                            value={form.content}
                            onChange={html => update('content', html)}
                            placeholder="Write your article content here..."
                            minHeight="480px"
                        />
                    </div>
                </div>

                {/* ── RIGHT: Settings Sidebar ────────────────────────── */}
                <div className="space-y-6">

                    {/* Publication status */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Publication</h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Published</span>
                                <div
                                    onClick={() => update('isPublished', !form.isPublished)}
                                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${form.isPublished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Featured</span>
                                <div
                                    onClick={() => update('isFeatured', !form.isFeatured)}
                                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${form.isFeatured ? 'bg-secondary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Cover Image</h3>
                        <ImagePicker value={form.coverImage} onChange={url => update('coverImage', url)} />
                    </div>

                    {/* Slug */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">URL Slug</h3>
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-400 font-mono whitespace-nowrap">/blog/</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                className="flex-1 bg-transparent text-xs font-mono text-gray-800 dark:text-gray-200 outline-none min-w-0"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Tags</h3>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={e => update('tags', e.target.value)}
                            placeholder="sourcing, sustainability, bangladesh"
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-primary"
                        />
                        <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                    </div>

                    {/* SEO */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">SEO Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={form.seoTitle}
                                    onChange={e => update('seoTitle', e.target.value)}
                                    placeholder={form.title}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className={`text-xs mt-1 block ${form.seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {form.seoTitle.length}/60
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Description</label>
                                <textarea
                                    value={form.seoDescription}
                                    onChange={e => update('seoDescription', e.target.value)}
                                    rows={3}
                                    placeholder={form.excerpt || 'SEO description...'}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none resize-none focus:ring-1 focus:ring-primary"
                                />
                                <span className={`text-xs mt-1 block ${form.seoDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {form.seoDescription.length}/160
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom save */}
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-secondary hover:text-primary transition-colors shadow-md disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>

                    <Link
                        href="/executive-portal-aelbd/blog"
                        className="block text-center text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        ← Back to Blog List
                    </Link>
                </div>
            </div>
        </div>
    );
}
