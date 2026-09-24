const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log(`--- ROOT PILLARS (${roots.length}) ---`);
  roots.forEach(r => {
    console.log(`[Order: ${r.order}] ${r.name} (${r.slug}) - Departments: ${r.children.length}`);
    r.children.forEach(d => {
      console.log(`   ├── ${d.name} (${d.slug}) - Items: ${d.children.length}`);
    });
  });

  const totalCats = await prisma.category.count();
  console.log(`\nTotal categories in DB: ${totalCats}`);

  const duplicateSlugs = await prisma.category.groupBy({
    by: ['slug'],
    _count: { slug: true },
    having: { slug: { _count: { gt: 1 } } }
  });
  console.log('Duplicate slugs:', duplicateSlugs.length === 0 ? 'ZERO duplicates!' : duplicateSlugs);

  const products = await prisma.product.findMany({
    select: {
      name: true,
      category: {
        select: {
          name: true,
          slug: true,
          parent: {
            select: {
              name: true,
              parent: { select: { name: true } }
            }
          }
        }
      }
    }
  });

  console.log('\n--- PRODUCTS HIERARCHY ---');
  products.forEach(p => {
    console.log(`• ${p.name} => Item: "${p.category.name}" -> Dept: "${p.category.parent?.name}" -> Pillar: "${p.category.parent?.parent?.name}"`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
