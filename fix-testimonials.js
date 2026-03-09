const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testimonialData = [
    {
        id: '1',
        name: 'Luca Bianchi',
        company: 'ModeHaus GmbH',
        country: 'Germany',
        quote: 'Apparel Emporium has been our sourcing partner for over 3 years. Their quality control and on-time delivery are second to none. Our customers consistently love the fabric quality.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Luca'
    },
    {
        id: '2',
        name: 'Sophie Laurent',
        company: 'Chic Parisienne',
        country: 'France',
        quote: 'The team at Apparel Emporium is incredibly professional. From sampling to bulk production, every detail is managed meticulously. We\'ve doubled our order volume with confidence.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sophie'
    },
    {
        id: '3',
        name: 'James Thornton',
        company: 'BritStyle Group',
        country: 'United Kingdom',
        quote: 'Exceptional sourcing capabilities and transparent communication. We were impressed by their compliance certifications and ethical manufacturing practices. Highly recommended.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=James'
    },
    {
        id: '4',
        name: 'Yuki Nakamura',
        company: 'Harajuku Textiles Co.',
        country: 'Japan',
        quote: 'The precision in stitching and colour matching is remarkable. Apparel Emporium understands Japanese quality standards perfectly. Their attention to detail sets them apart.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Yuki'
    },
    {
        id: '5',
        name: 'Maria Gonzalez',
        company: 'VivaWear International',
        country: 'Spain',
        quote: 'We\'ve sourced from many Bangladeshi exporters, but Apparel Emporium stands out for both quality and professionalism. Their logistics team ensures smooth deliveries every time.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Maria'
    },
    {
        id: '6',
        name: 'Erik Strom',
        company: 'NordFashion AB',
        country: 'Sweden',
        quote: 'Their commitment to sustainable and ethical production aligns perfectly with our brand values. A truly reliable partner for premium Scandinavian activewear collections.',
        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Erik'
    }
];

async function main() {
    console.log('Checking existing testimonials setting...');
    const existing = await prisma.siteSetting.findUnique({ where: { key: 'homepage_testimonials' } });
    console.log('Existing:', existing ? existing.value.substring(0, 100) + '...' : 'NOT FOUND');

    await prisma.siteSetting.upsert({
        where: { key: 'homepage_testimonials' },
        update: { value: JSON.stringify(testimonialData), group: 'homepage' },
        create: { key: 'homepage_testimonials', value: JSON.stringify(testimonialData), group: 'homepage' }
    });

    console.log('✅ Testimonials data saved successfully!');

    // Also check and ensure featured products exist
    const products = await prisma.product.findMany({ where: { isFeatured: true }, take: 5 });
    console.log(`Featured products: ${products.length}`);
    products.forEach(p => {
        console.log(`  - ${p.name}: images=${p.images ? p.images.substring(0, 60) : 'NONE'}`);
    });

    // Check categories
    const cats = await prisma.category.findMany({ where: { parentId: null }, take: 10 });
    console.log(`Root categories: ${cats.length}`);
    cats.forEach(c => {
        console.log(`  - ${c.name}: image=${c.image || 'NONE'}`);
    });

    await prisma.$disconnect();
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
