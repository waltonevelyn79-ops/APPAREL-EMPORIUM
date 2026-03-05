'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Save } from 'lucide-react';

export default function ProductForm({ categories, initialData }: { categories: any[], initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState(initialData || {
        name: '',
        categoryId: categories[0]?.id || '',
        shortDescription: '',
        description: '',
        isFeatured: false,
        isActive: true,
        tags: '',
    });

    // Specs as dynamic KV pairs
    const [specs, setSpecs] = useState<Array<{ key: string, value: string }>>(
        initialData && initialData.specifications
            ? Object.entries(JSON.parse(initialData.specifications)).map(([key, value]) => ({ key, value: String(value) }))
            : [
                { key: 'Fabric', value: '100% Cotton' },
                { key: 'GSM', value: '140' },
                { key: 'MOQ', value: '500 pcs' },
                { key: 'Lead Time', value: '45-60 Days' },
                { key: 'Colors', value: 'Multiple' },
                { key: 'Sizes', value: 'S, M, L, XL' },
            ]
    );

    // Images 
    const [images, setImages] = useState<string[]>(
        initialData && initialData.images
            ? JSON.parse(initialData.images)
            : []
    );

    const [uploadingImage, setUploadingImage] = useState(false);

    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const addSpec = () => {
        setSpecs(prev => [...prev, { key: '', value: '' }]);
    };

    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = val;
        setSpecs(newSpecs);
    };

    const removeSpec = (index: number) => {
        setSpecs(prev => prev.filter((_, i) => i !== index));
    };

    // Handle Image Upload
    const handleImageUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.url) {
                setImages(prev => [...prev, data.url]);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Format specs back to JSON
            const formattedSpecs = specs.reduce((acc, curr) => {
                if (curr.key && curr.value) acc[curr.key] = curr.value;
                return acc;
            }, {} as any);

            const payload = {
                ...formData,
                slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
                images: JSON.stringify(images),
                specifications: JSON.stringify(formattedSpecs)
            };

            const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save product');
            }

            router.push('/admin/products');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold mb-2">Product Name *</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" placeholder="e.g. Premium Cotton Shirt" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Category *</label>
                    <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none cursor-pointer">
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Short Description *</label>
                    <textarea required name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none resize-none" placeholder="Brief summary of the product (visible on cards)"></textarea>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Full Description *</label>
                    <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none resize-none" placeholder="Detailed product description..."></textarea>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Specifications */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Specifications</h3>
                    <button type="button" onClick={addSpec} className="text-sm border border-gray-300 py-1 px-3 rounded hover:bg-gray-50 font-medium">
                        + Add Field
                    </button>
                </div>

                <div className="space-y-3">
                    {specs.map((spec, idx) => (
                        <div key={idx} className="flex gap-3">
                            <input type="text" placeholder="Key (e.g. Fabric)" value={spec.key} onChange={(e) => updateSpec(idx, 'key', e.target.value)} className="w-1/3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                            <input type="text" placeholder="Value (e.g. 100% Cotton)" value={spec.value} onChange={(e) => updateSpec(idx, 'value', e.target.value)} className="flex-grow px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none" />
                            <button type="button" onClick={() => removeSpec(idx)} className="text-gray-400 hover:text-red-500 p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {specs.length === 0 && <p className="text-sm text-gray-500">No specifications added.</p>}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Images */}
            <div>
                <h3 className="text-lg font-bold mb-4">Product Images</h3>
                <div className="flex flex-wrap gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group">
                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <label className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Upload className="w-6 h-6 text-gray-400 mb-2" />}
                        <span className="text-xs text-gray-500">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Settings */}
            <div className="flex flex-wrap gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Active (Visible to public)</span>
                </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 min-w-[150px] disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Product</>}
                </button>
            </div>

        </form>
    )
}
