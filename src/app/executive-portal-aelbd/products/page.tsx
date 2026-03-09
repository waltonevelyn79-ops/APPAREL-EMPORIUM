import { prisma } from '@/lib/prisma';
import ProductManagementTable from '@/components/admin/ProductManagementTable';

export const dynamic = 'force-dynamic';

export default async function ProductsManagementPage() {
    // Fetch categories for bulk category changing logic
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-3">Manufacturer Catalog Sourcing</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Managing the global product portfolio and factory output definitions for APPAREL EMPORIUM.</p>
                </div>
            </div>

            {/* Use the interactive client-side table */}
            <ProductManagementTable categories={categories} />
        </div>
    );
}

