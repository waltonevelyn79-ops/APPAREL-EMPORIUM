import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { Database, Image as ImageIcon, Users, ShoppingBag, FileText, AlertTriangle, MonitorPlay, MessageSquare } from 'lucide-react';
import { redirect } from 'next/navigation';

function getFolderSize(folderPath: string): number {
    let size = 0;
    try {
        if (!fs.existsSync(folderPath)) return 0;
        const stats = fs.statSync(folderPath);
        if (stats.isFile()) return stats.size;
        if (stats.isDirectory()) {
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                size += getFolderSize(path.join(folderPath, file));
            }
        }
    } catch (e) { }
    return size;
}

function findLargeImages(folderPath: string, minSize: number = 1024 * 1024): { path: string, size: number }[] {
    let largeFiles: { path: string, size: number }[] = [];
    try {
        if (!fs.existsSync(folderPath)) return [];
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            const fullPath = path.join(folderPath, file);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                largeFiles = largeFiles.concat(findLargeImages(fullPath, minSize));
            } else if (stats.isFile() && stats.size > minSize) {
                if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
                    largeFiles.push({ path: fullPath.split('public')[1] || fullPath, size: stats.size });
                }
            }
        }
    } catch (e) { }
    return largeFiles;
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default async function PerformanceDashboard() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    // Only DEVELOPER allowed
    if (role !== 'DEVELOPER') {
        redirect('/admin');
    }

    // Database size
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    let dbSize = 0;
    try { dbSize = fs.statSync(dbPath).size; } catch (e) { }

    // Upload folder size
    const uploadPath = path.join(process.cwd(), 'public', 'uploads');
    const uploadSize = getFolderSize(uploadPath);
    const largeImages = findLargeImages(uploadPath);

    // Queries
    const [
        totalProducts,
        activeProducts,
        totalImages,
        usersByRole,
        totalPosts,
        draftPosts,
        totalInquiries,
        totalRFQs,
        recentErrors
    ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.mediaFile.count(),
        prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
        prisma.blogPost.count(),
        prisma.blogPost.count({ where: { isPublished: false } }),
        prisma.contactInquiry.groupBy({ by: ['status'], _count: { status: true } }),
        prisma.rFQ.groupBy({ by: ['status'], _count: { status: true } }),
        prisma.activityLog.findMany({
            where: { action: 'ERROR' },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    const sitemapSetting = await prisma.siteSetting.findUnique({ where: { key: 'sitemap_last_generated' } });

    // Optimization Tips Logic
    const tips = [];
    if (largeImages.length > 0) tips.push(`${largeImages.length} images are over 1MB — consider compressing them.`);
    if (totalProducts - activeProducts > 5) tips.push(`${totalProducts - activeProducts} products are inactive. Archive or delete them if no longer needed.`);
    if (draftPosts > 0) tips.push(`${draftPosts} blog posts are in draft. Publish them to improve SEO.`);
    if (!sitemapSetting) tips.push("Sitemap has never been manually generated.");

    return (
        <div className="max-w-6xl pb-12 space-y-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <MonitorPlay className="w-8 h-8 text-primary" /> Performance Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">System health, storage metrics, and optimization checks for developers.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                    Developer View
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                        <Database className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Database Size</p>
                    <h3 className="text-2xl font-bold">{formatBytes(dbSize)}</h3>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Uploads Folder</p>
                    <h3 className="text-2xl font-bold">{formatBytes(uploadSize)}</h3>
                    <p className="text-xs text-gray-400 mt-1">{totalImages} Media Library Items</p>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Total Products</p>
                    <h3 className="text-2xl font-bold">{totalProducts}</h3>
                    <p className="text-xs text-gray-400 mt-1">{activeProducts} Active</p>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Total Users</p>
                    <h3 className="text-2xl font-bold">{usersByRole.reduce((acc: number, curr: any) => acc + curr._count.role, 0)}</h3>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Breakdowns */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 line-clamp-2 min-h-[160px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gray-400" /> Interaction Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-500">Inquiries</h4>
                                <ul className="mt-2 space-y-1">
                                    {totalInquiries.map((i: any) => (
                                        <li key={i.status} className="flex justify-between text-sm font-medium"><span>{i.status}:</span> <span>{i._count.status}</span></li>
                                    ))}
                                    {totalInquiries.length === 0 && <li className="text-xs text-gray-400">No data</li>}
                                </ul>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-500">RFQs</h4>
                                <ul className="mt-2 space-y-1">
                                    {totalRFQs.map((r: any) => (
                                        <li key={r.status} className="flex justify-between text-sm font-medium"><span>{r.status}:</span> <span>{r._count.status}</span></li>
                                    ))}
                                    {totalRFQs.length === 0 && <li className="text-xs text-gray-400">No data</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Optimization Tips */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 p-6 line-clamp-2">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">💡 Optimization Tips</h3>
                        <ul className="space-y-3">
                            {tips.length > 0 ? tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <span className="mt-0.5 min-w-[12px] h-[12px] rounded-full bg-primary/20 border border-primary/50 block"></span>
                                    {tip}
                                </li>
                            )) : (
                                <li className="text-sm font-medium text-green-600">Looks great! No immediate optimizations needed.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Large Images & Errors */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-red-50 dark:bg-red-900/10">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400"><AlertTriangle className="w-5 h-5 text-red-500" /> Large Images Warning ( &gt; 1MB )</h3>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto">
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {largeImages.map((img, i) => (
                                    <li key={i} className="p-4 flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <span className="truncate font-mono text-gray-600 dark:text-gray-300 pr-4">{img.path}</span>
                                        <span className="font-bold text-red-500 whitespace-nowrap">{formatBytes(img.size)}</span>
                                    </li>
                                ))}
                                {largeImages.length === 0 && <li className="p-6 text-center text-sm font-medium text-gray-500">No large images found. Excellent!</li>}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden line-clamp-2">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" /> Recent App Errors</h3>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800 h-[250px] overflow-y-auto bg-gray-50/50 dark:bg-dark-surface">
                            {recentErrors.map((err: any) => (
                                <li key={err.id} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="font-bold text-red-600 dark:text-red-400">ERROR</span>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(err.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="font-mono text-gray-600 dark:text-gray-300 text-xs break-all">{err.details}</p>
                                </li>
                            ))}
                            {recentErrors.length === 0 && <li className="p-6 text-center text-sm font-medium text-gray-500">No recent errors logged.</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
