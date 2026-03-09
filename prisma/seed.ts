import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const devPassword = await bcrypt.hash('DevMaster@2024', 10);
    const adminPassword = await bcrypt.hash('Admin@2024', 10);

    // 1. Users
    const editorPassword = await bcrypt.hash('Editor@2024', 10);
    const viewerPassword = await bcrypt.hash('Viewer@2024', 10);

    await prisma.user.upsert({
        where: { email: 'dev@apparelemporium.com' },
        update: { role: 'DEVELOPER', password: devPassword },
        create: { email: 'dev@apparelemporium.com', name: 'Developer Mode', password: devPassword, role: 'DEVELOPER' },
    });

    await prisma.user.upsert({
        where: { email: 'admin@apparelemporium.com' },
        update: { role: 'SUPER_ADMIN', password: adminPassword },
        create: { email: 'admin@apparelemporium.com', name: 'Super Admin', password: adminPassword, role: 'SUPER_ADMIN' },
    });

    // EDITOR — can manage content but not system settings
    await prisma.user.upsert({
        where: { email: 'editor@apparelemporium.com' },
        update: { role: 'EDITOR', password: editorPassword },
        create: { email: 'editor@apparelemporium.com', name: 'Content Editor', password: editorPassword, role: 'EDITOR' },
    });

    // VIEWER — read-only admin access
    await prisma.user.upsert({
        where: { email: 'viewer@apparelemporium.com' },
        update: { role: 'VIEWER', password: viewerPassword },
        create: { email: 'viewer@apparelemporium.com', name: 'View Only User', password: viewerPassword, role: 'VIEWER' },
    });

    const buyerPassword = await bcrypt.hash('Buyer@2024', 10);
    await prisma.user.upsert({
        where: { email: 'buyer@demo.com' },
        update: { role: 'BUYER', password: buyerPassword },
        create: { email: 'buyer@demo.com', name: 'Global Sourcing Corp', password: buyerPassword, role: 'BUYER' },
    });

    // 2. Main Menu with Mega Menu
    const megaMenuData = [
        {
            title: "Men's Fashion",
            sections: [
                {
                    header: "Knit Fashion",
                    links: [
                        { label: "T-Shirt", url: "/products?category=mens-tshirt" },
                        { label: "Polo-Shirt", url: "/products?category=mens-polo" },
                        { label: "Sweatshirt", url: "/products?category=mens-sweatshirt" },
                        { label: "Jacket/Vest", url: "/products?category=mens-jacket" },
                        { label: "Swimwear", url: "/products?category=mens-swimwear" },
                        { label: "Boxershorts", url: "/products?category=mens-boxers" },
                        { label: "Trousers/Joggers", url: "/products?category=mens-trouser" },
                        { label: "Undergarments", url: "/products?category=mens-under" },
                        { label: "Sportswear", url: "/products?category=mens-sport" },
                        { label: "Nightwear", url: "/products?category=mens-night" },
                    ]
                },
                {
                    header: "Woven Fashion",
                    links: [
                        { label: "Jacket/Vest", url: "/products?category=mens-woven-jacket" },
                        { label: "Coat/Blazer", url: "/products?category=mens-coat" },
                        { label: "Shirt", url: "/products?category=mens-shirt" },
                    ]
                }
            ]
        },
        {
            title: "Women's Fashion",
            sections: [
                {
                    header: "Knit Fashion",
                    links: [
                        { label: "T-Shirt", url: "/products?category=womens-tshirt" },
                        { label: "Polo-Shirt", url: "/products?category=womens-polo" },
                        { label: "Sweatshirt", url: "/products?category=womens-sweatshirt" },
                        { label: "Jacket/Vest", url: "/products?category=womens-jacket" },
                        { label: "Dress", url: "/products?category=womens-dress" },
                        { label: "Trouser/Pyjama/Skirt", url: "/products?category=womens-trouser" },
                        { label: "Jumpsuits/Overalls", url: "/products?category=womens-jumpsuit" },
                        { label: "Swimwear", url: "/products?category=womens-swim" },
                        { label: "Undergarments", url: "/products?category=womens-under" },
                        { label: "Sportswear", url: "/products?category=womens-sport" },
                        { label: "Nightwear", url: "/products?category=womens-night" },
                    ]
                },
                {
                    header: "Woven Fashion",
                    links: [
                        { label: "Jacket/Vest", url: "/products?category=womens-woven-jacket" },
                        { label: "Coat/Blazer", url: "/products?category=womens-coat" },
                    ]
                }
            ]
        },
        {
            title: "Children's Fashion",
            sections: [
                {
                    header: "Knit Fashion",
                    links: [
                        { label: "Poncho", url: "/products?category=kids-poncho" },
                        { label: "T-Shirt", url: "/products?category=kids-tshirt" },
                        { label: "Polo-Shirt", url: "/products?category=kids-polo" },
                        { label: "Sweatshirt", url: "/products?category=kids-sweatshirt" },
                        { label: "Jacket/Vest", url: "/products?category=kids-jacket" },
                        { label: "Pant/Legging/Skirt", url: "/products?category=kids-pant" },
                        { label: "Romper", url: "/products?category=kids-romper" },
                        { label: "Dress", url: "/products?category=kids-dress" },
                        { label: "Sportswear", url: "/products?category=kids-sport" },
                        { label: "Nightwear", url: "/products?category=kids-night" },
                    ]
                },
                {
                    header: "Woven Fashion",
                    links: [
                        { label: "Jacket/Vest", url: "/products?category=kids-woven-jacket" },
                        { label: "Coat/Blazer", url: "/products?category=kids-coat" },
                        { label: "Shirt/Blouse", url: "/products?category=kids-shirt" },
                    ]
                }
            ]
        },
        {
            title: "Home Textiles",
            sections: [
                {
                    header: "Towel",
                    links: [
                        { label: "Face Towel", url: "/products?category=home-face-towel" },
                        { label: "Hand Towel", url: "/products?category=home-hand-towel" },
                        { label: "Bath Towel", url: "/products?category=home-bath-towel" },
                        { label: "Bath Mat", url: "/products?category=home-bath-mat" },
                        { label: "Bath Sheet", url: "/products?category=home-bath-sheet" },
                        { label: "Kitchen Towel", url: "/products?category=home-kitchen-towel" },
                        { label: "Bar Mop", url: "/products?category=home-bar-mop" },
                        { label: "Beach Towel", url: "/products?category=home-beach-towel" },
                        { label: "Bath Robe", url: "/products?category=home-bath-robe" },
                        { label: "Stripe Towel", url: "/products?category=home-stripe-towel" },
                        { label: "Embroidered Towel", url: "/products?category=home-embroidered-towel" },
                    ]
                },
                {
                    header: "Bedding",
                    links: [
                        { label: "Duvet Cover", url: "/products?category=home-duvet" },
                        { label: "Pillowcases", url: "/products?category=home-pillow" },
                    ]
                }
            ]
        },
        {
            title: "Footwear & Accessories",
            sections: [
                {
                    header: "Footwear",
                    links: [
                        { label: "Basic Espadrilles", url: "/products?category=footwear-basic" },
                        { label: "Fashion Espadrilles", url: "/products?category=footwear-fashion" },
                    ]
                },
                {
                    header: "Accessories",
                    links: [
                        { label: "Scarves", url: "/products?category=acc-scarves" },
                        { label: "Hats/Caps", url: "/products?category=acc-hats" },
                        { label: "Gloves", url: "/products?category=acc-gloves" },
                        { label: "Socks", url: "/products?category=acc-socks" },
                        { label: "Gift Box", url: "/products?category=acc-gift" },
                    ]
                }
            ]
        }
    ];

    await prisma.menuItem.deleteMany({ where: { menuLocation: 'main' } });

    await prisma.menuItem.create({
        data: { menuLocation: 'main', label: 'Home', url: '/', order: 1, isMegaMenu: false, isActive: true }
    });

    await prisma.menuItem.create({
        data: {
            menuLocation: 'main',
            label: 'Products',
            url: '/products',
            order: 2,
            isMegaMenu: true,
            isActive: true,
            megaMenuData: JSON.stringify(megaMenuData)
        }
    });

    await prisma.menuItem.create({
        data: { menuLocation: 'main', label: 'About Us', url: '/about', order: 3, isMegaMenu: false, isActive: true }
    });

    await prisma.menuItem.create({
        data: { menuLocation: 'main', label: 'Support', url: '/support', order: 4, isMegaMenu: false, isActive: true }
    });

    await prisma.menuItem.create({
        data: { menuLocation: 'main', label: 'Contact', url: '/contact', order: 5, isMegaMenu: false, isActive: true }
    });

    // 3. Categories (Generated from Mega Menu Data for consistency)
    console.log('Clearing existing categories...');
    await prisma.category.deleteMany({});

    for (const mainCat of megaMenuData) {
        // Create Root Category
        const rootSlug = mainCat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const rootCategory = await prisma.category.create({
            data: {
                name: mainCat.title,
                slug: rootSlug,
                isActive: true,
                order: megaMenuData.indexOf(mainCat)
            }
        });

        for (const section of mainCat.sections) {
            // Create Subsection (e.g., Knit Fashion)
            const sectionSlug = `${rootSlug}-${section.header.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            const subCategory = await prisma.category.create({
                data: {
                    name: section.header,
                    slug: sectionSlug,
                    parentId: rootCategory.id,
                    isActive: true,
                    order: mainCat.sections.indexOf(section)
                }
            });

            for (const link of section.links) {
                // Extract slug from URL (e.g., /products?category=mens-tshirt -> mens-tshirt)
                const urlParams = new URLSearchParams(link.url.split('?')[1]);
                const linkSlug = urlParams.get('category') || link.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                await prisma.category.create({
                    data: {
                        name: link.label,
                        slug: linkSlug,
                        parentId: subCategory.id,
                        isActive: true,
                        order: section.links.indexOf(link)
                    }
                });
            }
        }
    }

    // 4. Update Site Settings — Complete Apparel Emporium Data
    console.log('Seeding site settings...');
    const settings = [
        // ── General Company Info ──
        { key: 'company_name', value: 'Apparel Emporium', group: 'general' },
        { key: 'company_tagline', value: 'Your Trusted Garments Sourcing Partner in Bangladesh', group: 'general' },
        { key: 'company_email', value: 'info@apparelemporium.com', group: 'general' },
        { key: 'company_phone', value: '+880-2-1234-5678', group: 'general' },
        { key: 'whatsapp_number', value: '+8801700000000', group: 'general' },
        { key: 'company_address', value: 'House 12, Road 5, Gulshan-1, Dhaka 1212, Bangladesh', group: 'general' },
        { key: 'website_url', value: 'https://www.apparelemporium.com', group: 'general' },
        { key: 'working_hours', value: 'Mon–Fri, 9:00 AM – 6:00 PM (BST)', group: 'general' },
        { key: 'founded_year', value: '2004', group: 'general' },
        // ── Social Media ──
        { key: 'social_facebook', value: 'https://facebook.com/apparelemporium', group: 'social' },
        { key: 'social_linkedin', value: 'https://linkedin.com/company/apparelemporium', group: 'social' },
        { key: 'social_instagram', value: 'https://instagram.com/apparelemporium', group: 'social' },
        { key: 'social_twitter', value: 'https://twitter.com/apparelemporium', group: 'social' },
        { key: 'social_youtube', value: '', group: 'social' },
        // ── Theme / Branding ──
        { key: 'primary_color', value: '#1B365D', group: 'theme' },
        { key: 'secondary_color', value: '#C8A962', group: 'theme' },
        { key: 'accent_color', value: '#2E8B57', group: 'theme' },
        { key: 'light_bg', value: '#F8F9FA', group: 'theme' },
        { key: 'dark_bg', value: '#0F172A', group: 'theme' },
        { key: 'heading_font', value: 'Inter', group: 'theme' },
        { key: 'body_font', value: 'Inter', group: 'theme' },
        { key: 'logo_light', value: '/images/logo.png', group: 'theme' },
        { key: 'logo_dark', value: '/images/logo.png', group: 'theme' },
        // ── Cookie Consent ──
        { key: 'cookie_banner_enabled', value: 'true', group: 'cookies' },
        { key: 'cookie_banner_text', value: 'We use cookies to improve your experience. By continuing to use our site, you consent to our use of cookies.', group: 'cookies' },
        { key: 'cookie_accept_text', value: 'Accept All', group: 'cookies' },
        { key: 'cookie_reject_text', value: 'Reject All', group: 'cookies' },
        // ── Homepage: Announcement Bar ──
        {
            key: 'homepage_announcement_bar',
            value: JSON.stringify({
                text: '🌍 Your Trusted Garments Sourcing Partner in Bangladesh | ISO 9001 Certified | BSCI Compliant | Free Swatch Samples',
                link: '/contact',
                bgColor: '#1B365D',
                textColor: '#FFFFFF'
            }),
            group: 'homepage'
        },
        // ── Homepage: Hero Slider (3 slides) ──
        {
            key: 'homepage_hero_slider',
            value: JSON.stringify([
                {
                    id: '1',
                    title: 'Quality That<br/>Speaks',
                    subtitle: 'From fabric to finished product, excellence at every step. Your trusted garments sourcing partner in Bangladesh.',
                    image: '/images/hero1.png',
                    ctaText: 'Start Sourcing →',
                    ctaLink: '/request-quote'
                },
                {
                    id: '2',
                    title: 'Sustainable<br/>Manufacturing',
                    subtitle: 'OEKO-TEX, BSCI & GOTS certified. Ethical sourcing with zero compromise on quality or timelines.',
                    image: '/images/hero2.png',
                    ctaText: 'Our Certifications',
                    ctaLink: '/about#certifications'
                },
                {
                    id: '3',
                    title: '500+ Global<br/>Buyers Trust Us',
                    subtitle: '20+ years of experience connecting international brands with Bangladesh\'s finest garment factories.',
                    image: '/images/hero3.png',
                    ctaText: 'Browse Products',
                    ctaLink: '/products'
                }
            ]),
            group: 'homepage'
        },
        // ── Homepage: Stats Counter ──
        {
            key: 'homepage_stats_counter',
            value: JSON.stringify([
                { id: '1', number: 20, suffix: '+', label: 'Years Experience', icon: 'Award' },
                { id: '2', number: 500, suffix: '+', label: 'Global Buyers', icon: 'Globe2' },
                { id: '3', number: 50, suffix: '+', label: 'Partner Factories', icon: 'Factory' },
                { id: '4', number: 100, suffix: 'M+', label: 'Pieces/Year', icon: 'Activity' }
            ]),
            group: 'homepage'
        },
        // ── Homepage: Why Choose Us (6 cards) ──
        {
            key: 'homepage_why_choose_us',
            value: JSON.stringify([
                {
                    id: '1',
                    icon: 'ShieldCheck',
                    title: 'Quality Assurance',
                    description: 'Rigorous quality checks at every production stage — from raw material inspection to final pre-shipment audits — ensuring zero-defect deliveries.'
                },
                {
                    id: '2',
                    icon: 'Tag',
                    title: 'Competitive Pricing',
                    description: 'Direct factory access and volume-based economies allow us to offer the best price-to-quality ratio in the Bangladeshi sourcing market.'
                },
                {
                    id: '3',
                    icon: 'Clock',
                    title: 'On-Time Delivery',
                    description: 'Our streamlined supply chain and dedicated compliance team ensure your orders arrive within your agreed-upon delivery windows, every time.'
                },
                {
                    id: '4',
                    icon: 'Leaf',
                    title: 'Ethical Manufacturing',
                    description: 'All partner factories adhere to BSCI, SEDEX, and WRAP standards. We are committed to fair wages, safe workplaces, and sustainable practices.'
                },
                {
                    id: '5',
                    icon: 'Pencil',
                    title: 'Custom Design',
                    description: 'From private-label branding to fully custom tech packs, our design team translates your vision into production-ready garments tailored to your specifications.'
                },
                {
                    id: '6',
                    icon: 'Globe',
                    title: 'Global Compliance',
                    description: 'Fully compliant with EU REACH regulations, US Consumer Product Safety standards, and all major international trade compliance requirements.'
                }
            ]),
            group: 'homepage'
        },
        // ── Homepage: Certifications (7 badges) ──
        {
            key: 'homepage_certifications',
            value: JSON.stringify([
                { id: '1', name: 'OEKO-TEX', image: '', link: 'https://www.oeko-tex.com' },
                { id: '2', name: 'BSCI', image: '', link: 'https://www.amfori.org/content/amfori-bsci' },
                { id: '3', name: 'SEDEX', image: '', link: 'https://www.sedex.com' },
                { id: '4', name: 'WRAP', image: '', link: 'https://wrapcompliance.org' },
                { id: '5', name: 'GOTS', image: '', link: 'https://www.global-standard.org' },
                { id: '6', name: 'ISO 9001', image: '', link: 'https://www.iso.org/iso-9001' },
                { id: '7', name: 'Fair Wear', image: '', link: 'https://www.fairwear.org' }
            ]),
            group: 'homepage'
        },
        // ── Homepage: Testimonials (3 reviews) ──
        {
            key: 'homepage_testimonials',
            value: JSON.stringify([
                {
                    id: '1',
                    name: 'Sarah Jenkins',
                    company: 'Urban Wear Inc.',
                    country: 'USA',
                    avatar: '',
                    quote: 'Apparel Emporium has been our go-to sourcing partner for three years. Their quality control is unmatched, and our orders always arrive on schedule. Highly recommend for serious buyers looking for reliability.'
                },
                {
                    id: '2',
                    name: 'Klaus Hoffmann',
                    company: 'EuroThread GmbH',
                    country: 'Germany',
                    avatar: '',
                    quote: 'We were skeptical about sourcing from Bangladesh but Apparel Emporium changed our perspective completely. From the first sample to final delivery, every detail was handled professionally.'
                },
                {
                    id: '3',
                    name: 'James Hartley',
                    company: 'Pacific Brands Ltd.',
                    country: 'Australia',
                    avatar: '',
                    quote: 'The team at Apparel Emporium demonstrated outstanding competence and transparency throughout our entire order cycle. Their pricing is exceptionally competitive and quality never disappoints.'
                }
            ]),
            group: 'homepage'
        },
        // ── Homepage: CTA Section ──
        {
            key: 'homepage_cta_section',
            value: JSON.stringify({
                heading: 'Ready to Source Your Next Collection?',
                subheading: 'Get an instant quote for your bulk order. Share your tech pack and let our experts handle the rest. Minimum order starting from 500 pcs/color.',
                ctaText: 'Request a Quote →',
                ctaLink: '/request-quote',
                ctaText2: 'Browse Products',
                ctaLink2: '/products',
                image: '/images/hero1.png'
            }),
            group: 'homepage'
        },
        // ── Homepage: Section order and visibility ──
        {
            key: 'homepage_sections_order',
            value: JSON.stringify(['hero_slider', 'stats_counter', 'category_grid', 'featured_products', 'why_choose_us', 'certifications', 'testimonials', 'cta_section']),
            group: 'homepage'
        },
        {
            key: 'homepage_sections_visibility',
            value: JSON.stringify({
                announcement_bar: true,
                hero_slider: true,
                stats_counter: true,
                category_grid: true,
                featured_products: true,
                why_choose_us: true,
                certifications: true,
                testimonials: true,
                cta_section: true
            }),
            group: 'homepage'
        },
        // ── SEO Defaults ──
        { key: 'seo_default_title', value: 'Apparel Emporium | Trusted Garments Sourcing Partner in Bangladesh', group: 'seo' },
        { key: 'seo_default_description', value: 'Apparel Emporium is a leading Bangladeshi garments buying house with 20+ years of experience. ISO 9001, BSCI, OEKO-TEX certified. 500+ global buyers trust us.', group: 'seo' },
    ];

    for (const s of settings) {
        await prisma.siteSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, group: s.group },
            create: { key: s.key, value: s.value, group: s.group }
        });
    }

    // 4b. Footer Menu
    console.log('Seeding footer menu...');
    const footerMenuExists = await prisma.menuItem.findFirst({ where: { menuLocation: 'footer' } });
    if (!footerMenuExists) {
        const footerItems = [
            { label: 'About Us', url: '/about', order: 0 },
            { label: 'Products', url: '/products', order: 1 },
            { label: 'Support', url: '/support', order: 2 },
            { label: 'Contact Us', url: '/contact', order: 3 },
            { label: 'Request a Quote', url: '/request-quote', order: 4 },
            { label: 'Privacy Policy', url: '/privacy-policy', order: 5 },
            { label: 'Terms of Service', url: '/terms', order: 6 },
        ];
        for (const item of footerItems) {
            await prisma.menuItem.create({
                data: { ...item, menuLocation: 'footer', isActive: true }
            });
        }
    }

    // 5. Sample Featured Products with Pricing
    console.log('Adding sample products with pricing...');

    const sampleTieredPricing = JSON.stringify([
        { min: 50, max: 499, price: "8.00" },
        { min: 500, max: 999, price: "7.00" },
        { min: 1000, max: 4999, price: "5.50" },
        { min: 5000, max: null, price: "4.50" }
    ]);

    const knitCat = await prisma.category.findFirst({ where: { slug: 'mens-tshirt' } });
    if (knitCat) {
        await prisma.product.upsert({
            where: { slug: 'premium-crew-neck-tshirt' },
            update: {},
            create: {
                name: 'Premium Crew Neck T-Shirt',
                slug: 'premium-crew-neck-tshirt',
                categoryId: knitCat.id,
                shortDescription: 'High-quality 100% combed cotton crew neck t-shirt.',
                description: 'Our premium crew neck t-shirts are manufactured using the finest Bangladeshi cotton, ensuring durability and comfort.',
                images: JSON.stringify(['/uploads/demo/polo.png']),
                specifications: JSON.stringify({ 'Fabric': '100% Combed Cotton', 'GSM': '160-180', 'MOQ': '1000 pcs' }),
                isFeatured: true,
                isActive: true,
                priceDisplay: true,
                minOrder: '500 pieces',
                priceRange: '$7.15-$7.85',
                tieredPricing: sampleTieredPricing
            }
        });
    }

    const poloCat = await prisma.category.findFirst({ where: { slug: 'mens-polo' } });
    if (poloCat) {
        await prisma.product.upsert({
            where: { slug: 'classic-piqué-polo-shirt' },
            update: {},
            create: {
                name: 'Classic Piqué Polo Shirt',
                slug: 'classic-piqué-polo-shirt',
                categoryId: poloCat.id,
                shortDescription: 'Elegant piqué knit polo shirt with ribbed collar.',
                description: 'A timeless classic for any retail collection, featuring reinforced seams and high-grade dyes.',
                images: JSON.stringify(['/uploads/demo/polo.png']),
                specifications: JSON.stringify({ 'Fabric': '95% Cotton, 5% Spandex', 'GSM': '220', 'MOQ': '500 pcs' }),
                isFeatured: true,
                isActive: true,
                priceDisplay: true,
                minOrder: '500 pieces',
                priceRange: '$7.15-$7.85',
                tieredPricing: sampleTieredPricing
            }
        });
    }

    // 6. Sample Blog Posts (3 published articles)
    console.log('Seeding blog posts...');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@apparelemporium.com' } });
    if (adminUser) {
        const blogPosts = [
            {
                title: 'Why Bangladesh is the World\'s Best Garments Sourcing Destination',
                slug: 'bangladesh-best-garments-sourcing-destination',
                excerpt: 'From competitive pricing to certified factories and ethical manufacturing, Bangladesh continues to lead as the top choice for global buyers sourcing garments at scale.',
                content: `<h2>Bangladesh: The Global Garments Powerhouse</h2>
<p>For more than two decades, Bangladesh has cemented its position as one of the world's most reliable and cost-effective garments manufacturing hubs. Today, the country exports over $40 billion worth of readymade garments annually, second only to China in global market share.</p>
<h3>Competitive Pricing Without Sacrificing Quality</h3>
<p>One of the primary reasons global buyers choose Bangladesh is the unmatched price-to-quality ratio. With a large, skilled labour force, lower overhead costs, and well-established supply chains for raw materials, Bangladeshi factories can offer prices that are typically 15–30% lower than alternative sourcing destinations.</p>
<h3>World-Class Certifications</h3>
<p>Bangladesh's garments industry has made tremendous strides in compliance and sustainability. Today, Bangladesh has <strong>over 200 LEED-certified green factories</strong> — the highest number of any country in the world. Most leading manufacturers hold certifications including OEKO-TEX, BSCI, GOTS, SEDEX, and WRAP.</p>
<h3>Ethical Manufacturing Standards</h3>
<p>Following global scrutiny in the early 2010s, Bangladesh's garments sector underwent a complete transformation in workplace safety and workers' rights. The Accord on Fire and Building Safety, followed by the Alliance for Bangladesh Worker Safety, drove hundreds of millions of dollars in factory upgrades.</p>
<h3>Why Choose Apparel Emporium?</h3>
<p>At Apparel Emporium, we act as the critical bridge between international buyers and Bangladesh's best-in-class factories. We handle everything from factory vetting and compliance checks to production monitoring, quality audits, and logistics coordination — ensuring your sourcing experience is seamless and risk-free.</p>`,
                publishedAt: new Date('2025-09-15'),
                isPublished: true,
            },
            {
                title: 'BSCI vs SEDEX: Which Compliance Standard Does Your Supplier Need?',
                slug: 'bsci-vs-sedex-compliance-standards-guide',
                excerpt: 'Confused about BSCI and SEDEX? This guide breaks down the differences between these two leading social compliance audit systems and helps buyers decide which is right for their supply chain.',
                content: `<h2>Understanding Social Compliance in Garments Sourcing</h2>
<p>As global brands face increasing pressure from consumers, investors, and regulators to demonstrate ethical supply chains, social compliance audits have become a mandatory part of garment sourcing. Two of the most widely recognised frameworks are <strong>BSCI</strong> (Business Social Compliance Initiative) and <strong>SEDEX</strong> (Supplier Ethical Data Exchange).</p>
<h3>What is BSCI?</h3>
<p>BSCI, now rebranded under the amfori umbrella, is a leading supply chain management system that helps brands and retailers improve working conditions in their global supply chains. BSCI audits cover 13 key areas including:</p>
<ul>
<li>Freedom of Association and Collective Bargaining</li>
<li>Fair Remuneration</li>
<li>Occupational Health &amp; Safety</li>
<li>No Child Labour</li>
<li>Protection of the Environment</li>
</ul>
<h3>What is SEDEX?</h3>
<p>SEDEX is a non-profit organisation that operates a collaborative platform for sharing responsible sourcing data across supply chains. SEDEX focuses on four pillars (known as SMETA audits): Labour, Health &amp; Safety, Environment, and Business Ethics.</p>
<h3>Key Differences</h3>
<p><strong>BSCI</strong> is a brand-facing system where members (brands) manage their suppliers. <strong>SEDEX</strong> is a supplier-led platform where manufacturers upload and share their audit data with multiple buyers simultaneously — reducing audit duplication.</p>
<h3>Our Recommendation</h3>
<p>At Apparel Emporium, all of our partner factories hold at minimum one of these certifications. Most hold both. We recommend buyers specify their preferred audit standard in the initial RFQ stage so we can match you with the most appropriate factory.</p>`,
                publishedAt: new Date('2025-10-22'),
                isPublished: true,
            },
            {
                title: 'How to Calculate the True Cost of Garments Sourcing (Beyond FOB Price)',
                slug: 'true-cost-garments-sourcing-beyond-fob-price',
                excerpt: 'FOB price is just the starting point. This comprehensive guide reveals all the hidden costs in international garments sourcing and shows you how to calculate your true landed cost.',
                content: `<h2>The Iceberg of Garments Sourcing Cost</h2>
<p>Many first-time international buyers make the mistake of comparing suppliers purely on FOB (Free on Board) price. While FOB price is certainly important, it typically represents only 60–75% of your total landed cost. Understanding the full cost picture is essential for accurate financial planning and supplier evaluation.</p>
<h3>1. FOB Price</h3>
<p>The FOB price covers the manufacturing cost, factory overhead, and the supplier's margin, plus all costs to get the goods onto the vessel at the port of origin (in this case, Chittagong, Bangladesh).</p>
<h3>2. Ocean or Air Freight</h3>
<p>Depending on your urgency and order volume, freight can add <strong>$0.50 to $3.00 per piece</strong>. Ocean freight is dramatically cheaper for large orders but takes 20–35 days. Air freight is fast (3–5 days) but can triple your logistics cost.</p>
<h3>3. Import Duties and Taxes</h3>
<p>Bangladesh enjoys preferential trade access in many markets. EU buyers benefit from EBA (Everything But Arms) — meaning <strong>zero duty</strong> on garments from Bangladesh. US buyers face MFN tariffs which can vary from 5–32% depending on the product category.</p>
<h3>4. Quality Control and Inspection</h3>
<p>Third-party pre-shipment inspection (PSI) typically costs $200–$450 per man-day. For most orders, one inspection day is sufficient. Apparel Emporium includes in-house quality control as part of our sourcing service at no additional charge.</p>
<h3>5. Letter of Credit (LC) or Payment Processing Fees</h3>
<p>LC fees, bank charges, and currency conversion costs typically add 1–2% to your total order value.</p>
<h3>The Real Savings of Using a Buying House</h3>
<p>By working with Apparel Emporium, buyers benefit from consolidated oversight of all these cost components — often saving 8–15% on total landed cost compared to direct sourcing without an experienced Bangladesh-based partner.</p>`,
                publishedAt: new Date('2025-12-01'),
                isPublished: true,
            },
        ];

        for (const post of blogPosts) {
            await (prisma.blogPost as any).upsert({
                where: { slug: post.slug },
                update: {},
                create: {
                    ...post,
                    authorId: adminUser.id,
                    seoTitle: post.title + ' | Apparel Emporium',
                    seoDescription: post.excerpt,
                }
            });
        }
        console.log('Seeded 3 blog posts.');
    }

    console.log('Seed completed successfully for APPAREL EMPORIUM.');

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
