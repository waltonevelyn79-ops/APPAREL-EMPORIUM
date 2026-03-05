import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';


export default async function EditProductPage({ params }: { params: { id: string } }) {
    const [categories, product] = await Promise.all([
        prisma.category.findMany({ orderBy: { order: 'asc' } }),
        prisma.product.findUnique({ where: { id: params.id } })
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Product</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Update existing product listing.</p>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <ProductForm categories={categories} initialData={product} />
            </div>
        </div>
    );
}
