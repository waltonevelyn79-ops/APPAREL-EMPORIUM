import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
    const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Product</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Create a new product listing in your catalog.</p>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <ProductForm categories={categories} />
            </div>
        </div>
    );
}
