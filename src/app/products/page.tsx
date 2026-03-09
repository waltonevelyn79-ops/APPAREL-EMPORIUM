import { prisma } from '@/lib/prisma';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';
import { X } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { category?: string; q?: string; page?: string; fabric?: string; moq?: string }
}) {
    const { category, q, page, fabric, moq } = searchParams;

    // Fetch categories for sidebar
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });

    // Build the query object
    const where: any = { isActive: true };

    if (category) {
        where.category = { slug: category };
    }

    if (q) {
        where.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
            { slug: { contains: q } }
        ];
    }

    // Fabric and MOQ - these are stored in specifications JSON string
    // In SQLite, we use contains on the string
    const filters: any[] = [];

    if (fabric) {
        const fabrics = fabric.split(',');
        filters.push({
            OR: fabrics.map(f => ({ specifications: { contains: f } }))
        });
    }

    if (moq) {
        const moqs = moq.split(',');
        filters.push({
            OR: moqs.map(m => ({ specifications: { contains: m } }))
        });
    }

    if (filters.length > 0) {
        where.AND = filters;
    }

    // Pagination logic
    const limit = 12;
    const currentPage = parseInt(page || '1');
    const skip = (currentPage - 1) * limit;

    // Fetch products with the constructed query
    const products = await prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    // Build query string for pagination links
    const buildQueryString = (pageNum: number) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (q) params.set('q', q);
        if (fabric) params.set('fabric', fabric);
        if (moq) params.set('moq', moq);
        params.set('page', pageNum.toString());
        return `/products?${params.toString()}`;
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen">
            {/* Page Header */}
            <div className="bg-primary text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cross-stripes.png')] opacity-20"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Manufacturer Catalog</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto font-medium opacity-90">
                        Explore our world-class garment sourcing options. We bridge the gap between Bangladeshi excellence and global brands.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-72 shrink-0">
                        <ProductFilter categories={categories} />
                    </div>

                    {/* Product Marketplace */}
                    <div className="flex-grow">
                        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Live Results</h4>
                                <p className="text-gray-900 dark:text-white font-bold">
                                    Showing <span className="text-primary">{products.length > 0 ? skip + 1 : 0}-{Math.min(skip + limit, totalProducts)}</span> of {totalProducts} items matching your criteria
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase">Sort By</span>
                                <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold p-2 focus:ring-0">
                                    <option>Latest Arrival</option>
                                    <option>Name (A-Z)</option>
                                    <option>Low MOQ First</option>
                                </select>
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <ProductGrid products={products as any} />
                        ) : (
                            <div className="p-20 text-center bg-white dark:bg-dark-surface rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                    <X size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8">We couldn't find any products matching your current filters. Try broadening your search or clearing filters.</p>
                                <Link href="/products" className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">Clear All Filters</Link>
                            </div>
                        )}

                        {/* Smart Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center gap-3">
                                {currentPage > 1 && (
                                    <a
                                        href={buildQueryString(currentPage - 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        &larr;
                                    </a>
                                )}

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    // Only show pages near current page or start/end
                                    if (totalPages > 7 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                                        if (Math.abs(currentPage - pageNum) === 3) return <span key={i} className="text-gray-400">...</span>;
                                        return null;
                                    }

                                    return (
                                        <a
                                            key={i}
                                            href={buildQueryString(pageNum)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm border ${currentPage === pageNum
                                                ? 'bg-primary text-white border-primary scale-110'
                                                : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800'
                                                }`}
                                        >
                                            {pageNum}
                                        </a>
                                    );
                                })}

                                {currentPage < totalPages && (
                                    <a
                                        href={buildQueryString(currentPage + 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        &rarr;
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

