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
    title: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh',
    description: 'Apparel Emporium is a leading Bangladeshi garments buying house. ISO 9001, BSCI, OEKO-TEX & GOTS certified. 20+ years experience, 500+ global buyers. Request a quote today.',
};

export default async function HomePage() {

    const settingsRecords = await prisma.siteSetting.findMany({
        where: { key: { startsWith: 'homepage_' } }
    });

    const settingsMap = settingsRecords.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    // Section order
    let sectionOrder: string[] = [];
    try { sectionOrder = JSON.parse(settingsMap['homepage_sections_order'] || '[]'); } catch (e) { }
    if (sectionOrder.length === 0) {
        sectionOrder = ['hero_slider', 'stats_counter', 'category_grid', 'featured_products', 'why_choose_us', 'certifications', 'testimonials', 'cta_section'];
    }

    // Section visibility
    let visibility: Record<string, boolean> = {};
    try { visibility = JSON.parse(settingsMap['homepage_sections_visibility'] || '{}'); } catch (e) { }

    // Section headings — ALL editable labels from the admin dashboard
    let headings: Record<string, string> = {};
    try { headings = JSON.parse(settingsMap['homepage_section_headings'] || '{}'); } catch (e) { }

    const safeParse = (str: string | undefined, fallback: any = {}) => {
        if (!str) return fallback;
        try { return JSON.parse(str); } catch { return fallback; }
    };

    const announcementSettings = safeParse(settingsMap['homepage_announcement_bar'], null);

    // Section component map — headings prop injected into each relevant component
    const sectionComponentMap: Record<string, JSX.Element | null> = {
        'hero_slider': <HeroSlider data={settingsMap['homepage_hero_slider'] || '[]'} key="hero_slider" />,
        'stats_counter': <StatsCounter data={settingsMap['homepage_stats_counter'] || '[]'} key="stats_counter" />,
        'category_grid': <CategoryGrid headings={headings} key="category_grid" />,
        'featured_products': <FeaturedProducts headings={headings} key="featured_products" />,
        'why_choose_us': <WhyChooseUs data={settingsMap['homepage_why_choose_us'] || '[]'} headings={headings} key="why_choose_us" />,
        'certifications': <Certifications data={settingsMap['homepage_certifications'] || '[]'} headings={headings} key="certifications" />,
        'testimonials': <Testimonials data={settingsMap['homepage_testimonials'] || '[]'} key="testimonials" />,
        'cta_section': <CTASection data={settingsMap['homepage_cta_section'] || '{}'} key="cta_section" />,
    };

    return (
        <main className="min-h-screen">
            {visibility['announcement_bar'] !== false && announcementSettings?.text && (
                <div className="w-full text-center py-2 px-4 shadow-sm relative z-50 text-sm font-bold tracking-wide"
                    style={{ backgroundColor: announcementSettings.bgColor || '#1B365D', color: announcementSettings.textColor || '#FFF' }}>
                    <a href={announcementSettings.link || '#'} className="hover:underline">
                        {announcementSettings.text}
                    </a>
                </div>
            )}
            {sectionOrder.map((sectionKey) => {
                if (visibility[sectionKey] === false) return null;
                return sectionComponentMap[sectionKey] || null;
            })}
        </main>
    );
}
