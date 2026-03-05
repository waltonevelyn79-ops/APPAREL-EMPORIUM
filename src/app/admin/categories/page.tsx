import { prisma } from '@/lib/prisma';
import { Tags, Edit2, Trash2 } from 'lucide-react';

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: {
            _count: { select: { products: true } }
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your product categories.</p>
                </div>
                <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                    + Add Category
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden max-w-5xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                <th className="p-5 font-semibold">Category Name</th>
                                <th className="p-5 font-semibold">Slug</th>
                                <th className="p-5 font-semibold text-center">Total Products</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-5 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Tags className="w-4 h-4" />
                                        </div>
                                        {category.name}
                                    </td>
                                    <td className="p-5 text-gray-500 dark:text-gray-400">
                                        {category.slug}
                                    </td>
                                    <td className="p-5 text-center font-bold text-gray-900 dark:text-gray-100">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                                            {category._count.products}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {category.isActive ? (
                                            <span className="text-green-600 dark:text-green-500 font-medium">Active</span>
                                        ) : (
                                            <span className="text-red-500 font-medium">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right space-x-3">
                                        <button className="text-primary hover:text-secondary transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4 inline-block" />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No categories found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
