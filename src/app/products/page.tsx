import { prisma } from '@/lib/prisma';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';

export const dynamic = 'force-dynamic';


 // Revalidate page every 60 seconds

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { category?: string; q?: string; page?: string }
}) {
    const { category, q, page } = searchParams;

    // Fetch categories for sidebar
    const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' }
    });

    // Build query
    const whereClause: any = { isActive: true };
    if (category) {
        whereClause.category = { slug: category };
    }
    if (q) {
        whereClause.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
        ];
    }

    // Pagination args
    const limit = 12;
    const currentPage = parseInt(page || '1');
    const skip = (currentPage - 1) * limit;

    // Fetch products
    const products = await prisma.product.findMany({
        where: whereClause,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    const totalProducts = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalProducts / limit);

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen">
            {/* Page Header */}
            <div className="bg-primary text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto">
                        Explore our extensive catalog of high-quality garments. Filter by category to find exactly what you need for your brand.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <ProductFilter categories={categories} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="mb-6 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Showing {products.length > 0 ? skip + 1 : 0} to {Math.min(skip + limit, totalProducts)} of {totalProducts} Products</p>
                        </div>

                        <ProductGrid products={products as any} />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <a
                                        key={i}
                                        href={`/products?page=${i + 1}${category ? `&category=${category}` : ''}${q ? `&q=${q}` : ''}`}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === i + 1
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {i + 1}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
