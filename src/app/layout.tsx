import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import TrackingScripts from '@/components/layout/TrackingScripts';
import CookieConsent from '@/components/layout/CookieConsent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
    title: 'Apparel Emporium | A Windows of Fashion',
    description: '100% Export Oriented Readymade Garments, Home Textiles, Footwear and Accessories Buying House',
    icons: {
        icon: '/logo.jpg'
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
                            <main className="flex-grow">
                                {children}
                            </main>
                            <Footer />
                            <CookieConsent />
                        </AuthProvider>
                    </ThemeProvider>
                </SettingsProvider>
            </body>
        </html>
    );
}
