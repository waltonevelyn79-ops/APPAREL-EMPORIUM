import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default async function ProductsManagement({ searchParams }: { searchParams: { page?: string, q?: string } }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 20;
    const skip = (page - 1) * limit;
    const q = searchParams.q || '';

    const where: any = {};
    if (q) {
        where.OR = [
            { name: { contains: q } },
            { slug: { contains: q } }
        ];
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({ where })
    ]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
                <div className="flex gap-4 w-full sm:w-auto">
                    {/* Implement Client-side search next using a separate component, keeping it simple for now */}
                    <Link href="/admin/products/new" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm ml-auto sm:ml-0 whitespace-nowrap">
                        + Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                <th className="p-4 w-16">Image</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Featured</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {products.map((product) => {
                                let img = '/images/placeholder-product.svg';
                                try { img = JSON.parse(product.images)[0] || img; } catch (e) { }

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            {img.endsWith('svg') ? (
                                                <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                                            ) : (
                                                <img src={img} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-200 dark:border-gray-700" />
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {product.name}
                                            <p className="text-xs text-gray-400 font-normal truncate mt-1 w-48" title={product.slug}>{product.slug}</p>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">
                                            {product.category?.name || '-'}
                                        </td>
                                        <td className="p-4">
                                            {product.isActive ? (
                                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500 font-medium">
                                                    <CheckCircle2 className="w-4 h-4" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-500 font-medium">
                                                    <XCircle className="w-4 h-4" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {product.isFeatured ? (
                                                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Featured</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {/* Basic links for edit/delete; actual implementation below */}
                                            <Link href={`/admin/products/${product.id}/edit`} className="inline-flex p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button className="inline-flex p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No products found.
                        </div>
                    )}
                </div>

                {/* Simple Pagination */}
                {total > limit && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 text-sm font-medium">
                        <Link href={`/admin/products?page=${Math.max(1, page - 1)}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Prev</Link>
                        <span className="px-3 py-1">Page {page} of {Math.ceil(total / limit)}</span>
                        <Link href={`/admin/products?page=${Math.min(Math.ceil(total / limit), page + 1)}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Next</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
