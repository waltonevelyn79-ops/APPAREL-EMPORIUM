
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const categories = await prisma.category.findMany();
    console.log('Total Categories in DB:', categories.length);
    if (categories.length > 0) {
        categories.slice(0, 5).forEach(c => console.log(`- ${c.name} (${c.slug})`));
        if (categories.length > 5) console.log('...');
    }
    await prisma.$disconnect();
}

check().catch(console.error);
