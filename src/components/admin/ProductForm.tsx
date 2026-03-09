'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/ui/RichTextEditor';

import {
    Upload, X, Loader2, Save, Image as ImageIcon, Tag, FileText,
    Search, ChevronDown, ChevronUp, Star, Eye, Package, Plus, Trash2,
    Globe, AlertCircle, CheckCircle2, GripVertical, Info, FolderTree,
    Check,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import MediaLibraryModal from './MediaLibraryModal';

/* ─── helpers ─── */
function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function countWords(str: string) {
    return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

/* ─── SEO character-count bar ─── */
function SeoBar({ count, min, max, label }: { count: number; min: number; max: number; label: string }) {
    const pct = Math.min((count / max) * 100, 100);
    const ok = count >= min && count <= max;
    const low = count > 0 && count < min;
    return (
        <div className="mt-1.5">
            <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span className={ok ? 'text-green-600' : low ? 'text-amber-500' : count === 0 ? 'text-gray-400' : 'text-red-500'}>
                    {count} / {max} chars {ok ? '✓ Ideal' : low ? '(too short)' : count === 0 ? '' : '(too long)'}
                </span>
                <span className="text-gray-400">Ideal: {min}–{max}</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${ok ? 'bg-green-500' : low ? 'bg-amber-400' : count === 0 ? 'bg-gray-300' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

/* ─── Image drop zone ─── */
function ImageDropZone({ onUpload, onLibraryOpen, uploading }: { onUpload: (f: File[]) => void; onLibraryOpen: () => void; uploading: boolean }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: useCallback((f: File[]) => onUpload(f), [onUpload]),
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
        maxFiles: 10,
        disabled: uploading,
    });
    return (
        <div className="space-y-3">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none
                    ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-300 dark:border-gray-700 hover:border-primary/60 hover:bg-gray-50 dark:hover:bg-primary/5'}
                    ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {uploading
                        ? <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        : <ImageIcon className={`w-10 h-10 transition-colors ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
                    }
                    <div>
                        <p className="font-bold text-gray-700 dark:text-gray-200">
                            {uploading ? 'Uploading…' : isDragActive ? 'Drop images here' : 'Drag & drop product images'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            or <span className="text-primary font-semibold">click to browse</span> · JPG, PNG, WebP · up to 10 at once
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLibraryOpen(); }}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-all group"
            >
                <Search size={16} className="group-hover:scale-110 transition-transform" />
                Browse from Media Library
            </button>
        </div>
    );
}

/* ─── Collapsible section ─── */
function Section({ icon, label, badge, children, defaultOpen = true }: {
    icon: React.ReactNode; label: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        // NOTE: no overflow-hidden — allows child dropdowns / portals to escape the box
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors rounded-2xl"
            >
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">{label}</span>
                    {badge && <span className="text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
                {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {open && <div className="px-5 pb-6 md:px-6 space-y-5 border-t border-gray-100 dark:border-gray-800 pt-5">{children}</div>}
        </div>
    );
}

/* ══════════════════════════════════════════════════
   HIERARCHICAL MULTI-CATEGORY PICKER (inline tree)
══════════════════════════════════════════════════ */
type Cat = { id: string; name: string; children?: Cat[] };

function CategoryPicker({
    categories,
    primaryId,
    onPrimaryChange,
    additionalIds,
    onAdditionalChange,
}: {
    categories: Cat[];
    primaryId: string;
    onPrimaryChange: (id: string) => void;
    additionalIds: string[];
    onAdditionalChange: (ids: string[]) => void;
}) {
    const findName = (id: string, cats: Cat[]): string => {
        for (const c of cats) {
            if (c.id === id) return c.name;
            if (c.children) { const f = findName(id, c.children); if (f) return f; }
        }
        return '';
    };

    const toggleAdditional = (id: string) => {
        if (id === primaryId) return;
        onAdditionalChange(
            additionalIds.includes(id) ? additionalIds.filter(x => x !== id) : [...additionalIds, id]
        );
    };

    const setPrimary = (id: string) => {
        onPrimaryChange(id);
        onAdditionalChange(additionalIds.filter(x => x !== id));
    };

    const renderRow = (cat: Cat, depth = 0): React.ReactNode => (
        <div key={cat.id} className={depth > 0 ? 'ml-5 border-l-2 border-gray-100 dark:border-gray-700 pl-3' : ''}>
            {/* Row */}
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${cat.id === primaryId
                ? 'bg-primary/8 dark:bg-primary/15'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                }`}>

                {/* ○ Primary radio button */}
                <button
                    type="button"
                    onClick={() => setPrimary(cat.id)}
                    aria-label={`Set ${cat.name} as primary`}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${cat.id === primaryId
                        ? 'border-primary bg-primary shadow-sm shadow-primary/30'
                        : 'border-gray-300 dark:border-gray-500 hover:border-primary'
                        }`}
                >
                    {cat.id === primaryId && <span className="w-2 h-2 rounded-full bg-white block" />}
                </button>

                {/* Name */}
                <button
                    type="button"
                    onClick={() => setPrimary(cat.id)}
                    className={`flex-1 text-left text-sm transition-colors ${cat.id === primaryId
                        ? 'font-bold text-primary dark:text-blue-400'
                        : 'font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    {cat.name}
                    {depth === 0 && cat.children && cat.children.length > 0 && (
                        <span className="ml-2 text-[10px] text-gray-400 font-normal">{cat.children.length} sub</span>
                    )}
                </button>

                {/* Badges */}
                {cat.id === primaryId && (
                    <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full shrink-0">PRIMARY</span>
                )}
                {additionalIds.includes(cat.id) && (
                    <span className="text-[10px] bg-secondary/20 text-secondary font-bold px-2 py-0.5 rounded-full shrink-0">ALSO IN</span>
                )}

                {/* □ Additional checkbox */}
                {cat.id !== primaryId && (
                    <button
                        type="button"
                        onClick={() => toggleAdditional(cat.id)}
                        aria-label={`Toggle ${cat.name} as additional`}
                        title={additionalIds.includes(cat.id) ? 'Remove from additional' : 'Add as additional category'}
                        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${additionalIds.includes(cat.id)
                            ? 'border-secondary bg-secondary shadow-sm'
                            : 'border-gray-300 dark:border-gray-500 hover:border-secondary'
                            }`}
                    >
                        {additionalIds.includes(cat.id) && <Check className="w-3 h-3 text-white" />}
                    </button>
                )}
            </div>

            {/* Subcategory rows */}
            {cat.children && cat.children.length > 0 && (
                <div className="mt-0.5 mb-1">
                    {cat.children.map(child => renderRow(child, depth + 1))}
                </div>
            )}
        </div>
    );

    const additionalNames = additionalIds.map(id => findName(id, categories)).filter(Boolean);

    return (
        <div className="space-y-3">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
                <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                    Click circle → set as Primary
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md border-2 border-secondary bg-secondary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                    Tick box → add as Additional
                </span>
            </div>

            {/* Inline tree panel — always visible, no dropdown */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="max-h-80 overflow-y-auto p-3 space-y-0.5 custom-scrollbar bg-gray-50 dark:bg-gray-800/30">
                    {categories.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No categories found.</p>
                    ) : (
                        categories.map(cat => renderRow(cat, 0))
                    )}
                </div>
            </div>

            {/* Selection summary */}
            {(primaryId || additionalNames.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {primaryId && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            Primary: {findName(primaryId, categories)}
                        </span>
                    )}
                    {additionalNames.map((name, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-secondary/10 text-secondary font-semibold px-2.5 py-1.5 rounded-full border border-secondary/20">
                            {name}
                            <button type="button" onClick={() => onAdditionalChange(additionalIds.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function ProductForm({
    categories,
    initialData,
}: {
    categories: Cat[];
    initialData?: any;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    /* Parse initial additionalCategories */
    const parseAdditional = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch { return []; }
    };

    /* ── core fields ── */
    const [formData, setFormData] = useState<any>(initialData ? {
        ...initialData,
        priceDisplay: initialData.priceDisplay ?? true,
        isFeatured: initialData.isFeatured ?? false,
        isActive: initialData.isActive ?? true,
    } : {
        name: '', sku: '', categoryId: '', shortDescription: '',
        description: '', isFeatured: false, isActive: true,
        tags: '', priceDisplay: true, minOrder: '', priceRange: '',
        seoTitle: '', seoDescription: '', seoKeywords: '', ogImage: '',
    });

    /* ── category state ── */
    const firstCatId = categories[0]?.id || '';
    const [primaryCatId, setPrimaryCatId] = useState<string>(
        initialData?.categoryId || firstCatId
    );
    const [additionalCatIds, setAdditionalCatIds] = useState<string[]>(
        parseAdditional(initialData?.additionalCategories)
    );

    /* ── tiers ── */
    const [tiers, setTiers] = useState<Array<{ min: string; max: string; price: string }>>(
        initialData?.tieredPricing ? (() => { try { return JSON.parse(initialData.tieredPricing); } catch { return []; } })() : []
    );

    /* ── specs ── */
    const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(
        initialData?.specifications
            ? (() => { try { return Object.entries(JSON.parse(initialData.specifications)).map(([k, v]) => ({ key: k, value: String(v) })); } catch { return []; } })()
            : [
                { key: 'Fabric', value: '100% Cotton' },
                { key: 'GSM', value: '140' },
                { key: 'MOQ', value: '500 pcs' },
                { key: 'Lead Time', value: '45-60 Days' },
                { key: 'Colors', value: 'Multiple' },
                { key: 'Sizes', value: 'S, M, L, XL' },
            ]
    );

    /* ── images ── */
    const [images, setImages] = useState<Array<{ url: string; alt: string }>>(
        initialData?.images
            ? (() => {
                try {
                    const p = JSON.parse(initialData.images);
                    return p.map((img: any) => typeof img === 'string' ? { url: img, alt: '' } : img);
                } catch { return []; }
            })()
            : []
    );
    const [uploadingImage, setUploadingImage] = useState(false);
    const [primaryIdx, setPrimaryIdx] = useState(0);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    /* ── field helpers ── */
    const handle = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((p: any) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const autoFill = () => {
        setFormData((p: any) => ({
            ...p,
            sku: !p.sku && p.name ? p.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').substring(0, 20) : p.sku,
            seoTitle: !p.seoTitle && p.name ? `${p.name} | Premium Garments` : p.seoTitle,
        }));
    };

    /* ── image upload ── */
    const handleImageUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploadingImage(true);
        const results: Array<{ url: string; alt: string }> = [];
        for (const file of files) {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'products');
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.file) {
                    results.push({ url: data.file.filePath, alt: formData.name || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') });
                }
            } catch { /* silent */ }
        }
        setImages(prev => [...prev, ...results]);
        setUploadingImage(false);
    };

    /* ── submit ── */
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!primaryCatId) { setError('Please select a primary category.'); return; }

        setLoading(true);
        setError('');

        try {
            const ordered = [...images];
            if (primaryIdx > 0 && ordered.length > 1) {
                const [p] = ordered.splice(primaryIdx, 1);
                ordered.unshift(p);
            }

            const formattedSpecs = specs.reduce((acc, curr) => {
                if (curr.key && curr.value) acc[curr.key] = curr.value;
                return acc;
            }, {} as any);

            const payload = {
                name: formData.name,
                slug: slugify(formData.name) + '-' + Math.random().toString(36).substring(2, 6),
                sku: formData.sku || null,
                shortDescription: formData.shortDescription || '',
                description: formData.description || '',
                categoryId: primaryCatId,
                additionalCategories: additionalCatIds,
                images: JSON.stringify(ordered),
                specifications: JSON.stringify(formattedSpecs),
                tieredPricing: JSON.stringify(tiers),
                variants: '[]',
                isFeatured: formData.isFeatured ?? false,
                isActive: formData.isActive ?? true,
                priceDisplay: formData.priceDisplay ?? true,
                tags: formData.tags || '',
                minOrder: formData.minOrder || null,
                priceRange: formData.priceRange || null,
                seoTitle: formData.seoTitle || null,
                seoDescription: formData.seoDescription || null,
                seoKeywords: formData.seoKeywords || null,
                ogImage: formData.ogImage || null,
            };

            const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to save product');

            setSuccess(true);
            setTimeout(() => router.push('/executive-portal-aelbd/products'), 800);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    /* ═══════════════ RENDER ═══════════════ */
    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-10">

            {/* Error / success */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Save Failed</p>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-5 h-5 shrink-0" /> Product saved! Redirecting…
                </div>
            )}

            {/* ══ SECTION 1 — Identity ══ */}
            <Section icon={<Package className="w-5 h-5" />} label="Product Identity" badge="Required">

                {/* Name */}
                <div>
                    <label className="label-form">Product Name <span className="text-red-500">*</span></label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handle}
                        onBlur={autoFill}
                        required
                        placeholder="e.g. Men's Heavyweight Crew-Neck T-Shirt"
                        className="input-form"
                    />
                </div>

                {/* SKU */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-form">SKU / Product Code</label>
                        <input name="sku" value={formData.sku || ''} onChange={handle} placeholder="e.g. MHT-CRW-BLK-001" className="input-form font-mono" />
                    </div>
                    <div>
                        <label className="label-form">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                        <input name="tags" value={formData.tags} onChange={handle} placeholder="e.g. cotton, t-shirt, menswear" className="input-form" />
                    </div>
                </div>

                {/* Short description */}
                <div>
                    <label className="label-form">Short Description / Excerpt</label>
                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handle} rows={2} maxLength={300} placeholder="Concise one-liner shown on product cards (max 300 chars)" className="input-form resize-none" />
                    <p className="text-[11px] text-gray-400 mt-1">{(formData.shortDescription || '').length} / 300 characters</p>
                </div>

                {/* Full description — Rich Text Editor */}
                <div>
                    <label className="label-form">Full Product Description</label>
                    <RichTextEditor
                        value={formData.description || ''}
                        onChange={html => setFormData((p: any) => ({ ...p, description: html }))}
                        placeholder="Detailed description, features, certifications, care instructions…"
                        minHeight="280px"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                        {countWords((formData.description || '').replace(/<[^>]*>/g, ''))} words — aim for 150+ for good SEO.
                    </p>
                </div>
            </Section>

            {/* ══ SECTION 2 — Categories ══ */}
            <Section icon={<FolderTree className="w-5 h-5" />} label="Category Assignment" badge="Required">
                <div className="space-y-3">
                    <div>
                        <label className="label-form">
                            Primary & Additional Categories
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            <strong>Click the circle</strong> to set a primary category · <strong>Tick the checkbox</strong> to add it as an additional category. A product can appear under multiple categories.
                        </p>
                        {categories.length === 0 ? (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 text-amber-700 dark:text-amber-400 text-sm">
                                No categories found. <a href="/executive-portal-aelbd/categories" className="underline font-bold">Create categories first →</a>
                            </div>
                        ) : (
                            <CategoryPicker
                                categories={categories}
                                primaryId={primaryCatId}
                                onPrimaryChange={setPrimaryCatId}
                                additionalIds={additionalCatIds}
                                onAdditionalChange={setAdditionalCatIds}
                            />
                        )}
                    </div>

                    {/* Summary */}
                    {primaryCatId && (
                        <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 text-xs text-gray-600 dark:text-gray-300">
                            <span className="font-bold text-primary">Primary:</span> {/* name shown in picker */} This product will appear in the primary category's listing and filter.
                            {additionalCatIds.length > 0 && (
                                <span className="ml-2 font-bold text-secondary">+{additionalCatIds.length} additional</span>
                            )}
                        </div>
                    )}
                </div>
            </Section>

            {/* ══ SECTION 3 — Images ══ */}
            <Section icon={<ImageIcon className="w-5 h-5" />} label="Product Images & Media">
                <ImageDropZone
                    onUpload={handleImageUpload}
                    onLibraryOpen={() => setIsLibraryOpen(true)}
                    uploading={uploadingImage}
                />

                <MediaLibraryModal
                    isOpen={isLibraryOpen}
                    onClose={() => setIsLibraryOpen(false)}
                    onSelect={(url) => setImages(prev => [...prev, { url, alt: formData.name }])}
                    folder="products"
                />

                {images.length > 0 && (
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {images.length} image{images.length !== 1 ? 's' : ''}
                                <span className="text-gray-400 font-normal ml-2">· ⭐ = set as primary / thumbnail</span>
                            </p>
                            <button type="button" onClick={() => setImages([])} className="text-xs text-red-400 hover:text-red-600 font-semibold">Clear all</button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className={`group relative rounded-xl overflow-hidden border-2 transition-all ${idx === primaryIdx ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'}`}>
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                                        <img src={img.url} alt={img.alt || 'Product'} className="w-full h-full object-cover" />
                                        {idx === primaryIdx && (
                                            <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-white" /> Primary
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {idx !== primaryIdx && (
                                            <button type="button" onClick={() => setPrimaryIdx(idx)} className="w-7 h-7 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow text-amber-500 hover:bg-amber-500 hover:text-white transition-colors">
                                                <Star className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button type="button" onClick={() => { setImages(prev => prev.filter((_, i) => i !== idx)); if (primaryIdx >= idx && primaryIdx > 0) setPrimaryIdx(p => p - 1); }} className="w-7 h-7 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="p-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                                        <input type="text" value={img.alt} onChange={e => setImages(prev => prev.map((im, i) => i === idx ? { ...im, alt: e.target.value } : im))} placeholder="Alt text for SEO" className="w-full text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-1 focus:ring-primary/40" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Fill in <strong>Alt Text</strong> for every image — e.g. <em>"Men's navy cotton crew-neck t-shirt, front view"</em>. This is the most impactful on-page image SEO signal.
                            </p>
                        </div>
                    </div>
                )}
            </Section>

            {/* ══ SECTION 4 — Specs ══ */}
            <Section icon={<FileText className="w-5 h-5" />} label="Specifications & Technical Details">
                <div className="space-y-3">
                    {specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-150">
                            <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                            <input type="text" value={spec.key} onChange={e => { const s = [...specs]; s[idx].key = e.target.value; setSpecs(s); }} placeholder="Spec name" className="w-36 shrink-0 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200" />
                            <span className="text-gray-300">:</span>
                            <input type="text" value={spec.value} onChange={e => { const s = [...specs]; s[idx].value = e.target.value; setSpecs(s); }} placeholder="Value" className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                            <button type="button" onClick={() => setSpecs(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])} className="mt-2 flex items-center gap-2 text-sm text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-lg border border-dashed border-primary/40 transition-colors">
                        <Plus className="w-4 h-4" /> Add Specification
                    </button>
                </div>
            </Section>

            {/* ══ SECTION 5 — Pricing ══ */}
            <Section icon={<span className="text-sm font-bold">$</span>} label="Pricing & MOQ">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Price range shown on product pages.</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" name="priceDisplay" checked={!!formData.priceDisplay} onChange={handle} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Show Price on Site</span>
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-form">Price Range</label>
                        <input name="priceRange" value={formData.priceRange || ''} onChange={handle} type="text" className="input-form font-mono" placeholder="$0.00 – $0.00" />
                    </div>
                    <div>
                        <label className="label-form">Minimum Order Quantity</label>
                        <input name="minOrder" value={formData.minOrder || ''} onChange={handle} type="text" className="input-form" placeholder="e.g. 500 pieces" />
                    </div>
                </div>

                {/* Tiered pricing */}
                <div className="mt-2">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Tiered Pricing Model</p>
                        <button type="button" onClick={() => setTiers(t => [...t, { min: '', max: '', price: '' }])} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">+ Add Tier</button>
                    </div>
                    <div className="space-y-3">
                        {tiers.map((tier, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-3 items-center group">
                                <div className="col-span-3"><input type="text" placeholder="Min Qty" value={tier.min} onChange={e => { const nt = [...tiers]; nt[idx].min = e.target.value; setTiers(nt); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-mono outline-none" /></div>
                                <div className="col-span-3"><input type="text" placeholder="Max Qty" value={tier.max} onChange={e => { const nt = [...tiers]; nt[idx].max = e.target.value; setTiers(nt); }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-mono outline-none" /></div>
                                <div className="col-span-4"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input type="text" placeholder="Price" value={tier.price} onChange={e => { const nt = [...tiers]; nt[idx].price = e.target.value; setTiers(nt); }} className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-bold font-mono text-primary outline-none" /></div></div>
                                <div className="col-span-2 flex justify-end"><button type="button" onClick={() => setTiers(t => t.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button></div>
                            </div>
                        ))}
                        {tiers.length === 0 && <div className="text-center py-5 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl"><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">No Tiered Pricing Defined</p></div>}
                    </div>
                </div>
            </Section>

            {/* ══ SECTION 6 — SEO ══ */}
            <Section icon={<Search className="w-5 h-5" />} label="SEO & Search Optimization" badge="Recommended" defaultOpen={false}>
                {/* SERP preview */}
                <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Google Search Preview</p>
                    <p className="text-[15px] font-medium text-blue-600 leading-snug line-clamp-1">{formData.seoTitle || formData.name || 'Product Title · Your Site Name'}</p>
                    <p className="text-xs text-green-700 dark:text-green-500 my-0.5">yoursite.com › products › {slugify(formData.name || 'product-name')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{formData.seoDescription || formData.shortDescription || 'Your meta description will appear here…'}</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="label-form flex items-center justify-between">
                            <span>SEO / Meta Title</span>
                            <button type="button" onClick={() => setFormData((p: any) => ({ ...p, seoTitle: `${p.name} | Premium Garments & Apparel` }))} className="text-[11px] text-primary font-semibold hover:underline">Auto-generate</button>
                        </label>
                        <input name="seoTitle" value={formData.seoTitle || ''} onChange={handle} placeholder="e.g. Men's T-Shirt | Premium Cotton Garments" className="input-form" />
                        <SeoBar count={(formData.seoTitle || '').length} min={40} max={60} label="Title" />
                    </div>
                    <div>
                        <label className="label-form flex items-center justify-between">
                            <span>Meta Description</span>
                            <button type="button" onClick={() => setFormData((p: any) => ({ ...p, seoDescription: (p.shortDescription || p.description || '').substring(0, 155) }))} className="text-[11px] text-primary font-semibold hover:underline">Auto-fill</button>
                        </label>
                        <textarea name="seoDescription" value={formData.seoDescription || ''} onChange={handle} rows={3} placeholder="120–160 characters that summarise the product…" className="input-form resize-none" />
                        <SeoBar count={(formData.seoDescription || '').length} min={120} max={160} label="Description" />
                    </div>
                    <div>
                        <label className="label-form">Focus Keywords</label>
                        <input name="seoKeywords" value={formData.seoKeywords || ''} onChange={handle} placeholder="e.g. cotton t-shirt manufacturer, bulk menswear MOQ 500" className="input-form" />
                        <p className="text-[11px] text-gray-400 mt-1">Comma-separated. Use 3–8 phrases buyers would search for.</p>
                    </div>
                    <div>
                        <label className="label-form flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /> Social / OG Image URL</label>
                        <div className="flex gap-3">
                            <input name="ogImage" value={formData.ogImage || ''} onChange={handle} placeholder="Leave blank to use primary product image" className="input-form flex-1" />
                            {images.length > 0 && (
                                <button type="button" onClick={() => setFormData((p: any) => ({ ...p, ogImage: images[primaryIdx]?.url || images[0]?.url }))} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors shrink-0 whitespace-nowrap">Use Primary Image</button>
                            )}
                        </div>
                        {formData.ogImage && <img src={formData.ogImage} alt="OG preview" className="mt-3 h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />}
                    </div>
                </div>
            </Section>

            {/* ══ SECTION 7 — Visibility ══ */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> Visibility & Display</h3>
                <div className="flex flex-wrap gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="isFeatured" checked={!!formData.isFeatured} onChange={handle} className="w-5 h-5 rounded text-primary border-gray-300 cursor-pointer" />
                        <div>
                            <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> Feature on Homepage</span>
                            <p className="text-xs text-gray-400">Shown in featured products section</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="isActive" checked={!!formData.isActive} onChange={handle} className="w-5 h-5 rounded text-primary border-gray-300 cursor-pointer" />
                        <div>
                            <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Active (Publicly Visible)</span>
                            <p className="text-xs text-gray-400">Uncheck to hide from catalog</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* ── Sticky action bar ── */}
            <div className="sticky bottom-4 flex justify-end">
                <div className="flex gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg px-4 py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2.5 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading || success} className="px-8 py-2.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading
                            ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                            : <><Save className="w-5 h-5" /> {initialData ? 'Update Product' : 'Publish Product'}</>
                        }
                    </button>
                </div>
            </div>

        </form>
    );
}
