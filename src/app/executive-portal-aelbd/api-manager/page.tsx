'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, RefreshCw, Send, CheckCircle2, AlertCircle, Code, ShieldCheck, Terminal, Layers, UploadCloud, Loader2 } from 'lucide-react';

export default function ApiManagerPage() {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'docs' | 'tester'>('docs');
    const [categories, setCategories] = useState<any[]>([]);

    // Test form state
    const [testForm, setTestForm] = useState({
        name: 'Organic Cotton Polo Shirt (API Test)',
        categorySlug: '',
        description: 'Premium combed organic cotton polo shirt uploaded via remote external API tool.',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=380&fit=crop&q=80',
        minOrder: '500 pcs',
        priceRange: '$3.50 - $4.80'
    });

    const fetchApiKey = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.settings?.api_external_key) {
                setApiKey(data.settings.api_external_key);
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/external/categories?format=flat');
            const data = await res.json();
            if (data.categories && Array.isArray(data.categories)) {
                setCategories(data.categories);
                if (data.categories.length > 0 && !testForm.categorySlug) {
                    setTestForm(prev => ({ ...prev, categorySlug: data.categories[0].slug }));
                }
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchApiKey();
        fetchCategories();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleRegenerateKey = async () => {
        if (!confirm('Are you sure you want to regenerate the API key? Any external tools using the previous key will need to be updated.')) return;

        setRegenerating(true);
        const newKey = `ae_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_external_key: newKey })
            });
            if (res.ok) {
                setApiKey(newKey);
                alert('New API Key generated and saved successfully!');
            }
        } catch (e) {
            alert('Failed to regenerate key');
        } finally {
            setRegenerating(false);
        }
    };

    const runApiTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setTestLoading(true);
        setTestResult(null);

        try {
            const res = await fetch('/api/external/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    name: testForm.name,
                    categorySlug: testForm.categorySlug,
                    description: testForm.description,
                    images: [testForm.imageUrl],
                    minOrder: testForm.minOrder,
                    priceRange: testForm.priceRange,
                    specifications: {
                        Fabric: '100% Combed Organic Cotton',
                        GSM: '220 GSM',
                        Compliance: 'GOTS, OEKO-TEX Standard 100'
                    }
                })
            });

            const data = await res.json();
            setTestResult({ status: res.status, ok: res.ok, data });
        } catch (err: any) {
            setTestResult({ status: 500, ok: false, data: { error: err.message } });
        } finally {
            setTestLoading(false);
        }
    };

    const samplePython = `import requests

API_KEY = "${apiKey || 'YOUR_API_KEY'}"
BASE_URL = "https://aelbd.net"

# 1. Fetch available categories
cats = requests.get(f"{BASE_URL}/api/external/categories?format=flat").json()
print(f"Found {cats.get('count')} categories")

# 2. Upload a single product
product_data = {
    "name": "Men's Classic Pique Polo",
    "categorySlug": "mens-polo",
    "description": "Premium 100% combed cotton pique polo shirt with custom branding.",
    "images": ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"],
    "minOrder": "500 pcs",
    "priceRange": "$3.80 - $5.20",
    "specifications": {
        "Fabric": "100% Combed Cotton Pique",
        "GSM": "220 GSM",
        "MOQ": "500 Pcs"
    }
}
prod_res = requests.post(
    f"{BASE_URL}/api/external/products",
    headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
    json=product_data
)
print("Product Upload:", prod_res.json())

# 3. Upload a Blog Post
blog_data = {
    "title": "Top Trends in Sustainable Knitwear for 2026",
    "content": "<h2>Sustainable Sourcing</h2><p>Overview of organic cotton and eco-friendly dyeing techniques for global buyers.</p>",
    "excerpt": "Discover modern eco-friendly apparel manufacturing and export trends.",
    "tags": ["Sustainable", "Knitwear", "Export"],
    "coverImage": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    "isPublished": True,
    "seoTitle": "Sustainable Knitwear Sourcing | Apparel Emporium",
    "seoDescription": "Learn key trends in sustainable knitwear manufacturing."
}
blog_res = requests.post(
    f"{BASE_URL}/api/external/blog",
    headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
    json=blog_data
)
print("Blog Upload:", blog_res.json())

# 4. Upload a Recent Delivery Update (Live Feed)
delivery_data = {
    "title": "15,000 Pcs Organic Pique Polo Exported",
    "category": "Polo Shirt",
    "buyer": "European Apparel Brand",
    "buyerCountry": "Germany",
    "quantity": "15,000 Pcs",
    "status": "COMPLETED",
    "description": "Shipped to Hamburg port with GOTS certified combed organic cotton.",
    "imageUrl": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"
}
delivery_res = requests.post(
    f"{BASE_URL}/api/external/delivery-feed",
    headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
    json=delivery_data
)
print("Delivery Feed Upload:", delivery_res.json())
`;

    const sampleCurl = `# 1. Upload Product
curl -X POST "https://aelbd.net/api/external/products" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Organic Cotton Crewneck Tee",
    "categorySlug": "mens-tshirt",
    "description": "Pre-shrunk organic cotton t-shirt with ribbed collar.",
    "images": ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"],
    "minOrder": "1000 pcs"
  }'

# 2. Upload Blog Post
curl -X POST "https://aelbd.net/api/external/blog" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Sustainable Apparel Trends",
    "content": "<p>Article content here...</p>",
    "isPublished": true
  }'

# 3. Upload Recent Delivery Update
curl -X POST "https://aelbd.net/api/external/delivery-feed" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "10,000 Pcs Polo Shipped",
    "category": "Polo Shirt",
    "buyerCountry": "Germany",
    "quantity": "10,000 Pcs"
  }'`;

    return (
        <div className="space-y-8 max-w-6xl pb-16">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <KeyRound size={22} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-heading">
                            Developer API &amp; Remote Upload Center
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            Manage API credentials, test remote automated upload tools, and inspect endpoint documentation.
                        </p>
                    </div>
                </div>
            </div>

            {/* API Key Card */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/40 text-green-600 border border-green-200 dark:border-green-800 mb-2">
                            <ShieldCheck size={14} /> Production API Key Active
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">External Integration Key</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Include this key in the <code className="font-mono text-primary font-bold">x-api-key</code> HTTP header with every request.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRegenerateKey}
                            disabled={regenerating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
                        >
                            <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                            Regenerate Key
                        </button>
                    </div>
                </div>

                {/* Key Display & Copy */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <KeyRound size={18} className="text-primary shrink-0 ml-1" />
                    <input
                        type="text"
                        readOnly
                        value={loading ? 'Loading...' : apiKey}
                        className="bg-transparent font-mono text-sm font-bold text-gray-900 dark:text-gray-100 w-full outline-none select-all"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
                <button
                    onClick={() => setActiveTab('docs')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'docs'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <Code size={15} /> Endpoints &amp; Documentation
                </button>
                <button
                    onClick={() => setActiveTab('tester')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'tester'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                >
                    <Terminal size={15} /> Live Remote Upload Tester
                </button>
            </div>

            {/* TAB 1: Documentation */}
            {activeTab === 'docs' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Endpoints Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400">POST</span>
                                <span className="text-[11px] font-mono text-gray-400">Auth: x-api-key</span>
                            </div>
                            <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">/api/external/products</p>
                            <p className="text-xs text-gray-500">Upload a single garment product with images, specifications, and SKU.</p>
                        </div>

                        <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400">POST</span>
                                <span className="text-[11px] font-mono text-gray-400">Auth: x-api-key</span>
                            </div>
                            <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">/api/external/products/bulk</p>
                            <p className="text-xs text-gray-500">Bulk upload an array of 50-100 products in one single request.</p>
                        </div>

                        <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">GET</span>
                                <span className="text-[11px] font-mono text-gray-400">Public (No Auth)</span>
                            </div>
                            <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">/api/external/categories?format=flat</p>
                            <p className="text-xs text-gray-500">Returns list of valid category slugs to map products accurately.</p>
                        </div>

                        <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400">POST</span>
                                <span className="text-[11px] font-mono text-gray-400">Auth: x-api-key</span>
                            </div>
                            <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">/api/external/delivery-feed</p>
                            <p className="text-xs text-gray-500">Upload live production and shipping updates with photos.</p>
                        </div>
                    </div>

                    {/* Code Snippets */}
                    <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Python Automation Tool Example</h3>
                            <p className="text-xs text-gray-500">Use this script template in your custom scraper or ERP sync tool.</p>
                        </div>
                        <div className="relative bg-[#0F172A] text-slate-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto">
                            <pre>{samplePython}</pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">cURL Command</h3>
                        </div>
                        <div className="relative bg-[#0F172A] text-slate-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto">
                            <pre>{sampleCurl}</pre>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Live Remote Upload Tester */}
            {activeTab === 'tester' && (
                <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 animate-in fade-in duration-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Remote API Upload Tester</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Simulate an external tool making an authenticated HTTP request to verify end-to-end API upload functionality.
                        </p>
                    </div>

                    <form onSubmit={runApiTest} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label-form">Product Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={testForm.name}
                                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                                    className="input-form"
                                />
                            </div>

                            <div>
                                <label className="label-form">Category *</label>
                                <select
                                    value={testForm.categorySlug}
                                    onChange={(e) => setTestForm({ ...testForm, categorySlug: e.target.value })}
                                    className="input-form"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.slug}>
                                            {c.breadcrumb || c.name} ({c.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label-form">Description *</label>
                            <textarea
                                rows={2}
                                required
                                value={testForm.description}
                                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                                className="input-form"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="label-form">Product Image URL</label>
                                <input
                                    type="url"
                                    value={testForm.imageUrl}
                                    onChange={(e) => setTestForm({ ...testForm, imageUrl: e.target.value })}
                                    className="input-form"
                                />
                            </div>

                            <div>
                                <label className="label-form">Min Order (MOQ)</label>
                                <input
                                    type="text"
                                    value={testForm.minOrder}
                                    onChange={(e) => setTestForm({ ...testForm, minOrder: e.target.value })}
                                    className="input-form"
                                />
                            </div>

                            <div>
                                <label className="label-form">Price Range</label>
                                <input
                                    type="text"
                                    value={testForm.priceRange}
                                    onChange={(e) => setTestForm({ ...testForm, priceRange: e.target.value })}
                                    className="input-form"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={testLoading}
                                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all text-sm flex items-center gap-2"
                            >
                                {testLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                <span>Send Test Upload via API</span>
                            </button>
                        </div>
                    </form>

                    {/* Test Results Output */}
                    {testResult && (
                        <div className={`mt-6 p-5 rounded-2xl border ${testResult.ok ? 'bg-green-50/70 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                {testResult.ok ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`font-bold text-sm ${testResult.ok ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                    HTTP Status {testResult.status}: {testResult.ok ? 'Product Uploaded Successfully!' : 'Upload Error'}
                                </p>
                            </div>
                            <pre className="bg-white dark:bg-[#0F172A] p-4 rounded-xl font-mono text-xs text-gray-800 dark:text-slate-200 overflow-x-auto border border-gray-100 dark:border-gray-800">
                                {JSON.stringify(testResult.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
