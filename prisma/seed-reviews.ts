import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const testimonials = [
        { name: 'Sarah Jenkins', company: 'Global Fashion Co', country: 'USA', quote: 'Outstanding service and impeccable quality. They truly understand the demands of fast fashion.', rating: 5, date: '2023-11-15', avatar: '' },
        { name: 'David Croft', company: 'Euro Trendy Retail', country: 'UK', quote: 'Apparel Emporium is our go-to sourcing partner for sustainable garments. Their transparency is unmatched.', rating: 5, date: '2024-01-20', avatar: '' },
        { name: 'Ali Hassan', company: 'Desert Wear', country: 'UAE', quote: 'Consistent high standards across multiple bulk orders. Very reliable delivery times.', rating: 4, date: '2023-09-05', avatar: '' },
        { name: 'Maria Gonzalez', company: 'Moda Latina', country: 'Spain', quote: 'Their R&D team helped us source the exact fabrics we needed for our premium line.', rating: 5, date: '2024-02-12', avatar: '' },
        { name: 'Kato Kenji', company: 'Tokyo Streetwear', country: 'Japan', quote: 'Excellent attention to detail on complex stitching patterns. Highly recommended for premium brands.', rating: 5, date: '2023-12-01', avatar: '' },
        { name: 'Hans Muller', company: 'Berlin Essentials', country: 'Germany', quote: 'Very professional buying house. They handled our strict compliance requirements perfectly.', rating: 4, date: '2024-03-08', avatar: '' },
        { name: 'Chloe Dubois', company: 'Maison de Mode', country: 'France', quote: 'The best garment sourcing experience we have had in Bangladesh. Quality control is exceptional.', rating: 5, date: '2024-02-28', avatar: '' }
    ];

    await prisma.siteSetting.upsert({
        where: { key: 'homepage_testimonials' },
        update: { value: JSON.stringify(testimonials) },
        create: { key: 'homepage_testimonials', value: JSON.stringify(testimonials) }
    });

    console.log('Seeded 7 international reviews successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
