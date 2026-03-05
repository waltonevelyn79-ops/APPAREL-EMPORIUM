import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import Link from 'next/link';
import { Mail, CheckCircle, Truck, Package, Factory, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default async function ProductDetailPage({
    params
}: {
    params: { id: string }
}) {
    const product = await prisma.product.findUnique({
        where: { slug: params.id },
        include: { category: true }
    });

    if (!product) {
        notFound();
    }

    // Parse images and specs
    let images = ['/images/placeholder-product.svg'];
    try {
        if (typeof product.images === 'string') {
            images = JSON.parse(product.images);
            if (!Array.isArray(images) || images.length === 0) images = ['/images/placeholder-product.svg'];
        }
    } catch (e) { }

    let specs: any = {};
    try {
        if (typeof product.specifications === 'string') {
            specs = JSON.parse(product.specifications);
        }
    } catch (e) { }

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-12">
            <div className="container mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex gap-2 items-center text-sm mb-8 text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                    <span>/</span>
                    <Link href={`/products?category=${product.category?.slug}`} className="hover:text-primary transition-colors">{product.category?.name}</Link>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-xs">{product.name}</span>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Left: Gallery */}
                        <div>
                            <ProductImageGallery images={images} />
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col">
                            <div className="mb-4">
                                <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {product.category?.name}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                {product.shortDescription}
                            </p>

                            {/* Key Highlights */}
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

                            {/* Specifications Table */}
                            <div className="mb-10">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" /> Product Specifications
                                </h3>
                                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
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
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="mt-auto bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Interested in this product?</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact us to request tech pack, custom sample, or bulk pricing.</p>
                                </div>
                                <Link
                                    href={`/contact?product=${encodeURIComponent(product.name)}`}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-4 rounded-full font-bold transition-all shadow-md shrink-0"
                                >
                                    <Mail className="w-5 h-5" /> Request Quote
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* Full Description */}
                    <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Description</h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            {product.description.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-4">{paragraph}</p>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
