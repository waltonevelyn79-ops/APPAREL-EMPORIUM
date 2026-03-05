import React from 'react';
import { prisma } from '@/lib/prisma';
import HeroSlider from '@/components/home/HeroSlider';
import StatsCounter from '@/components/home/StatsCounter';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Certifications from '@/components/home/Certifications';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';

export const dynamic = 'force-dynamic';


export const metadata = {
    title: 'Garments Buying House | Premium Sourcing & Manufacturing',
    description: 'Leading global sourcing and manufacturing excellence with a commitment to quality, sustainability, and transparency.',
};

// Revalidate every 60 seconds or on demand


export default async function HomePage() {

    // Directly read DB payload for isomorphic rendering speed
    const settingsRecords = await prisma.siteSetting.findMany({
        where: { key: { startsWith: 'homepage_' } }
    });

    const settingsMap = settingsRecords.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    // Load section order architecture
    let sectionOrder: string[] = [];
    try {
        sectionOrder = JSON.parse(settingsMap['homepage_sections_order'] || '[]');
    } catch (e) { }

    if (sectionOrder.length === 0) {
        // Emergency Fallback
        sectionOrder = [
            'hero_slider',
            'stats_counter',
            'category_grid',
            'featured_products',
            'why_choose_us',
            'certifications',
            'testimonials',
            'cta_section'
        ];
    }

    // Load section visibility architecture
    let visibility: Record<string, boolean> = {};
    try {
        visibility = JSON.parse(settingsMap['homepage_sections_visibility'] || '{}');
    } catch (e) { }

    // Section Component Map
    const sectionComponentMap: Record<string, JSX.Element | null> = {
        'hero_slider': <HeroSlider data={settingsMap['homepage_hero_slider'] || '[]'} key="hero_slider" />,
        'stats_counter': <StatsCounter data={settingsMap['homepage_stats_counter'] || '[]'} key="stats_counter" />,
        'category_grid': <CategoryGrid key="category_grid" />,
        'featured_products': <FeaturedProducts key="featured_products" />,
        'why_choose_us': <WhyChooseUs data={settingsMap['homepage_why_choose_us'] || '[]'} key="why_choose_us" />,
        'certifications': <Certifications data={settingsMap['homepage_certifications'] || '[]'} key="certifications" />,
        'testimonials': <Testimonials data={settingsMap['homepage_testimonials'] || '[]'} key="testimonials" />,
        'cta_section': <CTASection data={settingsMap['homepage_cta_section'] || '{}'} key="cta_section" />,
    };

    return (
        <main className="min-h-screen">
            {/* Announcement Bar (Optional Feature Layer) */}
            {visibility['announcement_bar'] !== false && settingsMap['homepage_announcement_bar'] && (
                <div className="w-full text-center py-2 px-4 shadow-sm relative z-50 text-sm font-bold tracking-wide" style={{ backgroundColor: JSON.parse(settingsMap['homepage_announcement_bar']).bgColor || '#1B365D', color: JSON.parse(settingsMap['homepage_announcement_bar']).textColor || '#FFF' }}>
                    <a href={JSON.parse(settingsMap['homepage_announcement_bar']).link || '#'} className="hover:underline">
                        {JSON.parse(settingsMap['homepage_announcement_bar']).text}
                    </a>
                </div>
            )}

            {/* Render Configured Sections Dynamically in ordered sequence */}
            {sectionOrder.map((sectionKey) => {
                // Check visibility toggle
                if (visibility[sectionKey] === false) return null;

                return sectionComponentMap[sectionKey] || null;
            })}
        </main>
    );
}
