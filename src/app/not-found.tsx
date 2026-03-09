import Link from 'next/link';
import { Home, Search, ArrowLeft, Package } from 'lucide-react';

export const metadata = {
    title: '404 — Page Not Found | Apparel Emporium',
    description: 'The page you are looking for does not exist. Return to Apparel Emporium homepage or browse our garments catalog.',
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 py-20">
            <div className="max-w-2xl w-full text-center">

                {/* Large 404 number with gradient */}
                <div className="relative mb-8">
                    <span className="text-[180px] font-black leading-none select-none bg-gradient-to-br from-primary/20 to-secondary/10 bg-clip-text text-transparent block">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-20 h-20 text-primary/30" strokeWidth={1} />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h1>

                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                    The page you&apos;re looking for has moved, been removed, or never existed.
                    Let&apos;s get you back on track.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-secondary hover:shadow-secondary/30 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        <Search className="w-5 h-5" />
                        Browse Products
                    </Link>
                </div>

                {/* Quick links */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <p className="text-sm text-gray-400 mb-4 uppercase font-bold tracking-widest">
                        Popular pages
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { label: 'About Us', href: '/about' },
                            { label: 'Contact', href: '/contact' },
                            { label: 'Request a Quote', href: '/request-quote' },
                            { label: 'Blog', href: '/blog' },
                        ].map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-primary hover:underline px-3 py-1.5 bg-primary/5 rounded-full transition-colors hover:bg-primary/10"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Company tagline */}
                <p className="mt-12 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Apparel Emporium — Your Trusted Garments Sourcing Partner in Bangladesh
                </p>
            </div>
        </div>
    );
}
