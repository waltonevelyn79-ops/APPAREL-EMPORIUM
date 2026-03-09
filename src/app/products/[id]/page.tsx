import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import RelatedProducts from '@/components/products/RelatedProducts';
import RecentlyViewedProducts from '@/components/products/RecentlyViewedProducts';
import RecordProductVisit from '@/components/products/RecordProductVisit';
import Link from 'next/link';
import { Mail, CheckCircle, Truck, Package, Factory, Info } from 'lucide-react';
import { extractProductImages } from '@/lib/utils';
import DownloadCatalogButton from '@/components/shared/DownloadCatalogButton';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
    params
}: {
    params: { id: string }
}) {
    // Current folder is [id], but we treat the 'id' as 'slug' in the query
    const product = (await prisma.product.findUnique({
        where: { slug: params.id },
        include: { category: true }
    })) as any;

    if (!product) {
        notFound();
    }

    // Parse images using shared utility
    const allImages = (product.images && typeof product.images === 'string')
        ? (JSON.parse(product.images) || [])
        : (product.images || []);
    const images = extractProductImages(product.images);
    const imageAlts = Array.isArray(allImages) && allImages.length > 0
        ? allImages.map((img: any) => typeof img === 'object' ? (img.alt || product.name) : product.name)
        : [product.name];

    let specs: any = {};
    try {
        if (typeof product.specifications === 'string') {
            specs = JSON.parse(product.specifications);
        }
    } catch (e) { }

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-12">
            {/* Record this visit for "Recently Viewed" */}
            <RecordProductVisit id={product.id} />

            <div className="container mx-auto px-4">

                {/* Breadcrumb Navigation */}
                <nav className="flex gap-2 items-center text-sm mb-8 text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary transition-colors">
                                {product.category.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-xs text-primary">{product.name}</span>
                </nav>

                <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Left Column: Product Image Gallery */}
                        <div>
                            <ProductImageGallery images={images} alts={imageAlts} />
                        </div>

                        {/* Right Column: Key Details & Actions */}
                        <div className="flex flex-col">
                            <div className="mb-4">
                                <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {product.category?.name || 'Garments'}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                {product.shortDescription}
                            </p>

                            {/* Pricing Display */}
                            {product.priceDisplay && (
                                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <span className="text-4xl md:text-5xl font-black text-primary dark:text-blue-400 font-mono tracking-tighter">
                                            {product.priceRange || '$7.15-$7.85'}
                                        </span>
                                        <span className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                            USD / Piece
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-6 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Min. Order: <span className="text-gray-900 dark:text-white">{product.minOrder || '500 pieces'}</span>
                                    </p>

                                    {/* Tiered Pricing Table */}
                                    {product.tieredPricing && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {JSON.parse(product.tieredPricing).map((tier: any, idx: number) => (
                                                <div key={idx} className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-primary">
                                                    <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 group-hover:text-primary transition-colors">
                                                        {tier.max ? `${tier.min}-${tier.max} pcs` : `>= ${tier.min} pcs`}
                                                    </span>
                                                    <span className="text-xl font-black text-gray-900 dark:text-white font-mono">
                                                        ${tier.price}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Key Highlights (MOQ, Lead Time, Capacity) */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-3">
                                    <Package className="text-primary w-6 h-6" />
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase font-bold">MOQ</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{specs['MOQ'] || '500 pcs'}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-3">
                                    <Truck className="text-primary w-6 h-6" />
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase font-bold">Lead Time</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{specs['Lead Time'] || '45-60 Days'}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-3">
                                    <Factory className="text-primary w-6 h-6" />
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase font-bold">Capacity</span>
                                        <span className="font-bold text-gray-900 dark:text-white">High Volume</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Specifications Table */}
                            <div className="mb-10">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" /> Product Specifications
                                </h3>
                                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <tbody>
                                            {Object.entries(specs).map(([key, value], idx) => (
                                                <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-white dark:bg-transparent'}>
                                                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 w-1/3 border-r">
                                                        {key}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                                        {value as string}
                                                    </td>
                                                </tr>
                                            ))}
                                            {Object.keys(specs).length === 0 && (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-4 text-center text-gray-400 italic">No specific specs listed.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Contact/Quote CTA Block */}
                            <div className="mt-auto bg-primary/5 dark:bg-primary/10 p-8 rounded-[2rem] border border-primary/20 flex flex-col gap-4 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                                <div className="relative z-10">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-xl mb-1">Scale your production?</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Request tech packs, custom samples, or direct factory pricing.</p>
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href={`/contact?product=${encodeURIComponent(product.name)}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl hover:shadow-primary/20"
                                    >
                                        <Mail className="w-5 h-5" /> Request Quotation
                                    </Link>
                                    <DownloadCatalogButton
                                        productId={product.id}
                                        label="Download PDF"
                                        variant="outline"
                                        className="flex-1 justify-center py-4 rounded-2xl"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Detailed Product Description Section */}
                    <div className="mt-20 pt-20 border-t border-gray-100 dark:border-gray-800">
                        <div className="max-w-4xl">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-heading">Product Overview & Manufacturing Details</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                {product.description.split('\n').map((paragraph: string, idx: number) => (
                                    <p key={idx} className="mb-6">{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cross-Sell Related Products */}
                    <RelatedProducts categoryId={product.categoryId} excludeProductId={product.id} />

                    {/* User Browsing History */}
                    <RecentlyViewedProducts />

                </div>
            </div>
        </div>
    );
}
