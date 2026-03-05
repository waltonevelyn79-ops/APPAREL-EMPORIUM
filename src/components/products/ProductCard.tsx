import Link from 'next/link';
import { Product } from '@/types';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    // Parse specifications safely
    let specs: any = {};
    try {
        if (typeof product.specifications === 'string') {
            specs = JSON.parse(product.specifications);
        } else {
            specs = product.specifications;
        }
    } catch (e) {
        console.error('Failed to parse specs', e);
    }

    // Handle images
    let image = '/images/placeholder-product.svg';
    try {
        if (product.images) {
            const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                image = parsedImages[0];
            }
        }
    } catch (e) { }

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group flex flex-col bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
        >
            {/* Target Image Frame */}
            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {image.endsWith('.svg') ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="text-4xl text-gray-300">{product.name.charAt(0)}</span>
                    </div>
                ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                )}

                {/* Category Badge overlay */}
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider text-primary dark:text-gray-200">
                        {product.category?.name || 'Category'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                    {product.shortDescription}
                </p>

                {/* Specs highlight */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider">MOQ</span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate" title={specs['MOQ'] || '500 pcs'}>
                            {specs['MOQ'] || '500 pcs'}
                        </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider">Fabric</span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate" title={specs['Fabric'] || 'Cotton'}>
                            {specs['Fabric'] || 'Cotton'}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center text-primary dark:text-gray-300 font-bold group-hover:text-secondary transition-colors">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
}
