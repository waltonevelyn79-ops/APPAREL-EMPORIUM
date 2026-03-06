import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const devPassword = await bcrypt.hash('DevMaster@2024', 10);
    const adminPassword = await bcrypt.hash('Admin@2024', 10);
    const editorPassword = await bcrypt.hash('Editor@2024', 10);

    // Users
    await prisma.user.upsert({
        where: { email: 'dev@globalstitch.com' },
        update: { role: 'DEVELOPER', password: devPassword },
        create: { email: 'dev@globalstitch.com', name: 'Developer Mode', password: devPassword, role: 'DEVELOPER' },
    });

    await prisma.user.upsert({
        where: { email: 'admin@globalstitch.com' },
        update: { role: 'SUPER_ADMIN', password: adminPassword },
        create: { email: 'admin@globalstitch.com', name: 'Super Admin', password: adminPassword, role: 'SUPER_ADMIN' },
    });

    await prisma.user.upsert({
        where: { email: 'editor@globalstitch.com' },
        update: { role: 'EDITOR', password: editorPassword },
        create: { email: 'editor@globalstitch.com', name: 'Site Editor', password: editorPassword, role: 'EDITOR' },
    });

    // Settings Definitions
    const settings = [
        // Tracking Group
        { key: 'fb_pixel_id', value: '' },
        { key: 'fb_pixel_enabled', value: 'false' },
        { key: 'ga4_measurement_id', value: '' },
        { key: 'ga4_enabled', value: 'false' },
        { key: 'gtm_container_id', value: '' },
        { key: 'gtm_enabled', value: 'false' },
        { key: 'clarity_project_id', value: '' },
        { key: 'clarity_enabled', value: 'false' },
        { key: 'hotjar_site_id', value: '' },
        { key: 'hotjar_enabled', value: 'false' },
        { key: 'tiktok_pixel_id', value: '' },
        { key: 'tiktok_pixel_enabled', value: 'false' },
        { key: 'linkedin_partner_id', value: '' },
        { key: 'linkedin_enabled', value: 'false' },
        { key: 'pinterest_tag_id', value: '' },
        { key: 'pinterest_enabled', value: 'false' },
        { key: 'google_search_console_meta', value: '' },
        { key: 'custom_head_scripts', value: '' },
        { key: 'custom_body_start_scripts', value: '' },
        { key: 'custom_body_end_scripts', value: '' },

        // Theme Group
        { key: 'primary_color', value: '#1B365D' },
        { key: 'secondary_color', value: '#C8A962' },
        { key: 'accent_color', value: '#2E8B57' },
        { key: 'light_bg', value: '#F8F9FA' },
        { key: 'dark_bg', value: '#0F172A' },
        { key: 'heading_font', value: 'Inter' },
        { key: 'body_font', value: 'Inter' },
        { key: 'logo_light', value: '' },
        { key: 'logo_dark', value: '' },
        { key: 'favicon', value: '' },
        { key: 'og_image', value: '' },

        // Email Group
        { key: 'smtp_host', value: '' },
        { key: 'smtp_port', value: '587' },
        { key: 'smtp_user', value: '' },
        { key: 'smtp_password', value: '' },
        { key: 'smtp_from_email', value: '' },
        { key: 'smtp_from_name', value: '' },

        // Cookies Group
        { key: 'cookie_banner_enabled', value: 'true' },
        { key: 'cookie_banner_text', value: 'We use cookies to improve your experience on our site. By using our site, you consent to cookies.' },
        { key: 'cookie_accept_text', value: 'Accept All' },
        { key: 'cookie_reject_text', value: 'Reject All' },

        // Homepage Group
        { key: 'announcement_bar_enabled', value: 'true' },
        {
            key: 'homepage_announcement_bar', value: JSON.stringify({
                text: 'Welcome to our premium garments buying house portal.',
                link: '/products',
                bgColor: '#1B365D',
                textColor: '#FFFFFF'
            })
        },
        {
            key: 'homepage_hero_slider', value: JSON.stringify([
                { title: 'Premium Garment Sourcing', subtitle: 'Excellence in every stitch.', ctaText: 'View Collections', ctaLink: '/products', image: '/images/hero1.jpg', overlay: 'rgba(0,0,0,0.5)' },
                { title: 'Global Supply Chain', subtitle: 'Seamless worldwide delivery.', ctaText: 'Learn More', ctaLink: '/about', image: '/images/hero2.jpg', overlay: 'rgba(0,0,0,0.5)' },
                { title: 'Sustainable Fashion', subtitle: 'Eco-friendly manufacturing processes.', ctaText: 'Our Mission', ctaLink: '/about', image: '/images/hero3.jpg', overlay: 'rgba(0,0,0,0.5)' }
            ])
        },
        {
            key: 'homepage_stats_counter', value: JSON.stringify([
                { number: '15', label: 'Years Experience', icon: 'clock', suffix: '+' },
                { number: '500', label: 'Global Buyers', icon: 'globe', suffix: '+' },
                { number: '50', label: 'Partner Factories', icon: 'building', suffix: '+' },
                { number: '10', label: 'Million Pieces/Year', icon: 'check-circle', suffix: 'M' }
            ])
        },
        {
            key: 'homepage_why_choose_us', value: JSON.stringify([
                { title: 'Quality Assurance', description: 'Strict AQL 2.5 quality control at every stage.', icon: 'shield-check' },
                { title: 'Global Compliance', description: 'Working with BSCI, SEDEX, and OEKO-TEX certified factories.', icon: 'globe' },
                { title: 'Competitive Pricing', description: 'Direct sourcing ensures the best value for your brand.', icon: 'dollar-sign' },
                { title: 'On-Time Delivery', description: 'Advanced tracking systems to ensure shipment adherence.', icon: 'truck' },
                { title: 'Design Support', description: 'In-house R&D team mapping global trends.', icon: 'pen-tool' },
                { title: 'Ethical Sourcing', description: 'Commitment to sustainable and fair labor practices.', icon: 'heart' }
            ])
        },
        {
            key: 'homepage_testimonials', value: JSON.stringify([
                { name: 'John Doe', company: 'Fashion Inc', country: 'USA', quote: 'Excellent quality and communication.', avatar: '' },
                { name: 'Jane Smith', company: 'Euro Trendy', country: 'UK', quote: 'Our preferred sourcing partner.', avatar: '' },
                { name: 'Ali Hassan', company: 'Desert Wear', country: 'UAE', quote: 'Consistent high standards.', avatar: '' }
            ])
        },
        {
            key: 'homepage_certifications', value: JSON.stringify([
                { title: 'ISO 9001', image: '/images/iso.png' },
                { title: 'OEKO-TEX', image: '/images/oeko.png' }
            ])
        },
        {
            key: 'homepage_cta_section', value: JSON.stringify({
                title: 'Start Your Production Journey Today',
                description: 'Partner with us to create premium garments tailored to your brand.',
                buttonText: 'Get a Quote',
                buttonLink: '/contact'
            })
        },
        { key: 'homepage_sections_order', value: JSON.stringify(['hero_slider', 'stats_counter', 'category_grid', 'featured_products', 'why_choose_us', 'certifications', 'testimonials', 'cta_section']) },
        {
            key: 'homepage_sections_visibility', value: JSON.stringify({
                hero_slider: true, stats_counter: true, category_grid: true, featured_products: true, why_choose_us: true, certifications: true, testimonials: true, cta_section: true, announcement_bar: true
            })
        }
    ];

    for (const s of settings) {
        await prisma.siteSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value }
        });
    }

    // Seed Mega Menus
    const existingMenu = await prisma.menuItem.findFirst({ where: { menuLocation: 'main', label: 'Home' } });
    if (!existingMenu) {
        await prisma.menuItem.createMany({
            data: [
                { menuLocation: 'main', label: 'Home', url: '/', order: 1, isMegaMenu: false, isActive: true },
                {
                    menuLocation: 'main', label: 'Products', url: '/products', order: 2, isMegaMenu: true, isActive: true, megaMenuData: JSON.stringify({
                        title: 'Our Collections',
                        items: [
                            { label: 'Men\'s Wear', url: '/products/mens' },
                            { label: 'Women\'s Wear', url: '/products/womens' },
                            { label: 'Kids\' Wear', url: '/products/kids' }
                        ]
                    })
                },
                { menuLocation: 'main', label: 'About Us', url: '/about', order: 3, isMegaMenu: false, isActive: true },
                { menuLocation: 'main', label: 'Contact', url: '/contact', order: 4, isMegaMenu: false, isActive: true },
            ]
        });
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
