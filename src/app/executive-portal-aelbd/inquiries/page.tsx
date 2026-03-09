import { prisma } from '@/lib/prisma';
import { Mail, CheckCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default async function AdminInquiriesPage() {
    const inquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Inquiries</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">View and manage messages from your potential buyers.</p>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {inquiries.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No inquiries found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Name / Company</th>
                                    <th className="p-4">Product Interest</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Message Preview</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {inquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-gray-500">
                                            {new Date(inquiry.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {inquiry.name}
                                            <span className="block text-xs text-gray-500 font-normal">{inquiry.company || '-'}</span>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">
                                            {inquiry.productInterest || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${inquiry.status === 'NEW' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    inquiry.status === 'READ' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {inquiry.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                                {inquiry.status}
                                            </span>
                                        </td>
                                        <td className="p-4 max-w-xs truncate text-gray-600 dark:text-gray-400" title={inquiry.message}>
                                            {inquiry.message}
                                        </td>
                                        <td className="p-4">
                                            <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                                                <Mail className="w-4 h-4" /> Reply
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

