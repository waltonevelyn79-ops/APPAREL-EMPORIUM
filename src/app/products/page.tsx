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
        include: {
            parent: { select: { name: true, slug: true } },
            children: { where: { isActive: true }, select: { id: true, name: true, slug: true } },
            _count: { select: { products: true } }
        },
        orderBy: { order: 'asc' }
    });

    // Popular root categories for top quick pills
    const topPills = [
        { label: 'All Items', slug: '' },
        ...categories
            .filter(c => !c.parentId)
            .slice(0, 7)
            .map(c => ({ label: c.name, slug: c.slug }))
    ];

    // Build the query object
    const where: any = { isActive: true };

    if (category) {
        // Match category directly or its subcategories
        const targetCategory = categories.find(c => c.slug === category);
        if (targetCategory && targetCategory.children && targetCategory.children.length > 0) {
            const childSlugs = targetCategory.children.map(ch => ch.slug);
            where.category = { slug: { in: [category, ...childSlugs] } };
        } else {
            where.category = { slug: category };
        }
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

    // Helper for pill links
    const buildPillLink = (pillSlug: string) => {
        const params = new URLSearchParams();
        if (pillSlug) params.set('category', pillSlug);
        if (q) params.set('q', q);
        if (fabric) params.set('fabric', fabric);
        if (moq) params.set('moq', moq);
        return `/products?${params.toString()}`;
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen">
            {/* Page Header — pt-20 or pt-24 offsets the fixed nav (h ~64-80px) */}
            <div className="bg-primary text-white pt-28 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cross-stripes.png')] opacity-20"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Manufacturer Catalog</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto font-medium opacity-90">
                        Explore our world-class garment sourcing options. We bridge the gap between Bangladeshi excellence and global brands.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* ── Top Horizontal Category Pills Bar (Amazon / Modern E-Commerce Style) ── */}
                <div className="mb-8 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex items-center gap-2 min-w-max">
                        {topPills.map((pill) => {
                            const isPillActive = (!category && !pill.slug) || (category === pill.slug);
                            return (
                                <Link
                                    key={pill.slug || 'all'}
                                    href={buildPillLink(pill.slug)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${isPillActive
                                        ? 'bg-primary text-white scale-105 shadow-md shadow-primary/20'
                                        : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    <span>{pill.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-72 shrink-0">
                        <ProductFilter categories={categories as any} />
                    </div>

                    {/* Product Marketplace */}
                    <div className="flex-grow">
                        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-gray-700 gap-4">
                            <div>
                                <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1">Live Results</h2>
                                <p className="text-gray-900 dark:text-white font-bold">
                                    Showing <span className="text-primary dark:text-blue-400">{products.length > 0 ? skip + 1 : 0}-{Math.min(skip + limit, totalProducts)}</span> of {totalProducts} items matching your criteria
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <label htmlFor="product-sort-select" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Sort By</label>
                                <select
                                    id="product-sort-select"
                                    aria-label="Sort garments by criteria"
                                    className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold p-2 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="latest">Latest Arrival</option>
                                    <option value="name">Name (A-Z)</option>
                                    <option value="moq">Low MOQ First</option>
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

