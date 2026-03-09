import React from 'react';
import { prisma } from '@/lib/prisma';
import { Tags, Edit2, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        include: {
            _count: { select: { products: true } }
        },
        orderBy: { order: 'asc' }
    });

    // Build tree structure
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [] }));
    const rootCategories: any[] = [];

    categories.forEach(cat => {
        if (cat.parentId && categoryMap.has(cat.parentId)) {
            categoryMap.get(cat.parentId).children.push(categoryMap.get(cat.id));
        } else {
            rootCategories.push(categoryMap.get(cat.id));
        }
    });

    const renderCategoryRow = (cat: any, depth = 0) => (
        <React.Fragment key={cat.id}>
            <tr className="hover:bg-primary/5 transition-colors group">
                <td className="p-5">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${depth === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            <Tags className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`font-bold truncate ${depth > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {depth > 0 && <span className="text-gray-300 dark:text-gray-600 mr-2">└</span>}
                                {cat.name}
                            </span>
                            <span className={`text-[9px] uppercase font-black tracking-widest ${depth === 0 ? 'text-primary' : depth === 1 ? 'text-blue-500' : 'text-gray-400'}`}>
                                {depth === 0 ? 'Root Level' : depth === 1 ? 'Collection' : 'Sub-Category'}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="p-5 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {cat.slug}
                </td>
                <td className="p-5 text-center">
                    <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
                        {cat._count.products} Products
                    </span>
                </td>
                <td className="p-5 text-xs font-bold">
                    {cat.isActive ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Inactive
                        </div>
                    )}
                </td>
                <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
            {cat.children.map((child: any) => renderCategoryRow(child, depth + 1))}
        </React.Fragment>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter font-heading italic">Brand Taxonomy & Mega Menu</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium italic">Configure the three-tier hierarchy for your Global Navigation and Catalog filters.</p>
                </div>
                <button className="bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black py-3 px-8 rounded-2xl transition-all shadow-xl shadow-primary/20 whitespace-nowrap uppercase tracking-widest text-xs">
                    + Initialise New Category
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">
                                <th className="p-6">Classification Heritage</th>
                                <th className="p-6">Unique Slug</th>
                                <th className="p-6 text-center">SKU Density</th>
                                <th className="p-6">Visibility</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {rootCategories.map((root) => renderCategoryRow(root))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-500 font-medium">
                                        No categories found in the database. Please check your seeding logs.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
