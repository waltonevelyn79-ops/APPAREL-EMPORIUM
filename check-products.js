const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 10,
        include: { category: true }
    });

    console.log('--- PRODUCTS DATA ---');
    products.forEach(p => {
        console.log(`- ${p.name}: priceRange='${p.priceRange}', priceDisplay=${p.priceDisplay}, isFeatured=${p.isFeatured}`);
        console.log(`  images: ${p.images ? p.images.substring(0, 100) : 'NULL'}`);
    });
    console.log('---------------------');
}

main().catch(err => {
    console.error(err);
}).finally(() => {
    prisma.$disconnect();
});
