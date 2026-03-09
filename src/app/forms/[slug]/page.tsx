import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import FormRenderer from '@/components/shared/FormRenderer';
import { Layout } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StandaloneFormPage({ params }: { params: { slug: string } }) {
    const form = await prisma.customForm.findUnique({
        where: { slug: params.slug },
    });

    if (!form || !form.isActive) {
        notFound();
    }

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-20 relative overflow-hidden">
            {/* Dynamic background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-50/50 dark:bg-blue-900/5 blur-[120px] rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-purple-50/50 dark:bg-purple-900/5 blur-[120px] rounded-full translate-y-20 -translate-x-20" />

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <div className="bg-white dark:bg-dark-surface rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-16">

                    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Layout size={32} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{form.name}</h1>
                            <p className="text-gray-500 font-medium text-lg max-w-lg">{form.description || "Please fill in the information below our sourcing team will get back to you shortly."}</p>
                        </div>
                    </div>

                    <div className="p-1 px-2">
                        <FormRenderer key={form.slug} slug={form.slug} />
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800/50 text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Secured by Apparel Emporium Manufacturer Authentication</p>
                        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">By submitting this form, you agree to our privacy policy and consent to our sourcing team contacting you regarding your manufacturing requirements.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
