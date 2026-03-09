'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImagePicker from '@/components/admin/ImagePicker';
import { Save, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BlogFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    isPublished: boolean;
    seoTitle: string;
    seoDescription: string;
}

export default function NewBlogPostPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [form, setForm] = useState<BlogFormData>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        isPublished: false,
        seoTitle: '',
        seoDescription: '',
    });

    // Auto-generate slug from title
    useEffect(() => {
        if (form.title && !form.slug) {
            setForm(prev => ({
                ...prev,
                slug: form.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .substring(0, 80)
            }));
        }
    }, [form.title]);

    const update = (field: keyof BlogFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (publish: boolean) => {
        if (!form.title.trim()) {
            setMessage({ text: 'Title is required.', type: 'error' });
            return;
        }
        if (!form.content.trim() || form.content === '<br>') {
            setMessage({ text: 'Content cannot be empty.', type: 'error' });
            return;
        }
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    isPublished: publish,
                    publishedAt: publish ? new Date().toISOString() : null,
                }),
            });
            const data = await res.json();
            if (data.success || data.id) {
                router.push('/executive-portal-aelbd/blog');
                router.refresh();
            } else {
                setMessage({ text: data.error || 'Failed to save post.', type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/executive-portal-aelbd/blog" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Compose New Article</h1>
                        <p className="text-sm text-gray-500">Create a new blog post or industry insight</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-secondary hover:text-primary transition-colors shadow-md disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                        Publish Now
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 px-5 py-4 rounded-xl text-sm font-semibold border-l-4 ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-500' : 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-500'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── MAIN CONTENT COLUMN ───────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Title */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Article Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => update('title', e.target.value)}
                            placeholder="e.g. Top 5 Sustainable Fabric Trends in 2025"
                            className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-0 outline-none placeholder-gray-300 dark:placeholder-gray-600"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Short Excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={e => update('excerpt', e.target.value)}
                            rows={3}
                            placeholder="2-3 sentence summary shown on the blog listing card..."
                            className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 resize-none placeholder-gray-400"
                        />
                    </div>

                    {/* Rich Content Editor */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Article Content *</label>
                        <RichTextEditor
                            value={form.content}
                            onChange={html => update('content', html)}
                            placeholder="Start writing your article here. Use the toolbar to add headings, bold text, lists, quotes, and links..."
                            minHeight="480px"
                        />
                    </div>
                </div>

                {/* ── SETTINGS SIDEBAR ──────────────────────────────── */}
                <div className="space-y-6">

                    {/* Publish status */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Publication</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                onClick={() => update('isPublished', !form.isPublished)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-7' : 'translate-x-1'}`} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {form.isPublished ? '✅ Published' : '📝 Draft'}
                            </span>
                        </label>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Cover Image</h3>
                        <ImagePicker value={form.coverImage} onChange={url => update('coverImage', url)} />
                    </div>

                    {/* Slug */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">URL Slug</h3>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-400 font-mono">/blog/</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                className="flex-1 bg-transparent text-xs font-mono text-gray-800 dark:text-gray-200 outline-none"
                                placeholder="auto-generated-from-title"
                            />
                        </div>
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
                                    placeholder={form.title || 'SEO title...'}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className={`text-xs mt-1 block ${form.seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {form.seoTitle.length}/60 chars
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
                                    {form.seoDescription.length}/160 chars
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Save buttons repeated */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-secondary hover:text-primary transition-colors shadow-md disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                            Publish Article
                        </button>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
                        >
                            <Save size={16} />
                            Save Draft
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
