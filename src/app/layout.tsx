import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import TrackingScripts from '@/components/layout/TrackingScripts';
import CookieConsent from '@/components/layout/CookieConsent';
import CompareTray from '@/components/products/CompareTray';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
    title: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh',
    description: '100% Export Oriented Readymade Garments, Home Textiles, Footwear and Accessories Buying House in Bangladesh. ISO 9001, BSCI, OEKO-TEX Certified.',
    icons: {
        icon: '/favicon.png'
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans min-h-screen flex flex-col transition-colors duration-300 dark:bg-dark-bg`} suppressHydrationWarning>
                <SettingsProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <TrackingScripts />
                            <Header />
                            <main className="flex-grow relative">
                                {children}
                            </main>
                            <Footer />
                            <CompareTray />
                            <CookieConsent />
                        </AuthProvider>
                    </ThemeProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}

