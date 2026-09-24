const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoryPipeline = [
  {
    title: "Knitwear",
    slug: "knitwear",
    order: 1,
    departments: [
      {
        name: "Men's Knitwear",
        slug: "knitwear-mens",
        order: 1,
        items: [
          { name: "T-Shirt & V-Neck", slug: "mens-tshirt" },
          { name: "Polo Shirts", slug: "mens-polo" },
          { name: "Hoodies & Sweatshirts", slug: "mens-knit-hoodie" },
          { name: "Joggers & Trackpants", slug: "mens-knit-jogger" },
          { name: "Tank Tops & Vests", slug: "mens-knit-tank" },
          { name: "Undergarments & Boxers", slug: "mens-knit-underwear" },
          { name: "Sportswear & Activewear", slug: "mens-knit-sportswear" },
          { name: "Sleepwear & Pajamas", slug: "mens-knit-sleepwear" }
        ]
      },
      {
        name: "Women's Knitwear",
        slug: "knitwear-womens",
        order: 2,
        items: [
          { name: "T-Shirts & Crop Tops", slug: "womens-knit-tshirt" },
          { name: "Polo Shirts", slug: "womens-knit-polo" },
          { name: "Hoodies & Sweatshirts", slug: "womens-knit-hoodie" },
          { name: "Leggings & Tights", slug: "womens-knit-legging" },
          { name: "Knit Dresses & Nightwear", slug: "womens-knit-dress" },
          { name: "Sportswear & Activewear", slug: "womens-knit-sportswear" },
          { name: "Undergarments", slug: "womens-knit-underwear" }
        ]
      },
      {
        name: "Children's Knitwear",
        slug: "knitwear-kids",
        order: 3,
        items: [
          { name: "Kids T-Shirts & Polos", slug: "kids-knit-tshirt" },
          { name: "Baby Rompers & Bodysuits", slug: "kids-knit-romper" },
          { name: "Kids Hoodies & Sets", slug: "kids-knit-hoodie" },
          { name: "Nightwear & Pajamas", slug: "kids-knit-nightwear" },
          { name: "Kids Joggers & Sweatpants", slug: "kids-knit-jogger" }
        ]
      }
    ]
  },
  {
    title: "Woven",
    slug: "woven",
    order: 2,
    departments: [
      {
        name: "Men's Woven",
        slug: "woven-mens",
        order: 1,
        items: [
          { name: "Casual & Formal Shirts", slug: "mens-woven-shirt" },
          { name: "Denim Jeans & Pants", slug: "mens-woven-denim" },
          { name: "Chinos & Cargo Trousers", slug: "mens-woven-trouser" },
          { name: "Jackets & Windbreakers", slug: "mens-woven-jacket" },
          { name: "Blazers & Overcoats", slug: "mens-woven-blazer" }
        ]
      },
      {
        name: "Women's Woven",
        slug: "woven-womens",
        order: 2,
        items: [
          { name: "Blouses & Tops", slug: "womens-woven-blouse" },
          { name: "Denim Jeans & Shorts", slug: "womens-woven-denim" },
          { name: "Woven Pants & Trousers", slug: "womens-woven-pant" },
          { name: "Woven Dresses & Skirts", slug: "womens-woven-dress" },
          { name: "Jackets & Blazers", slug: "womens-woven-jacket" }
        ]
      },
      {
        name: "Children's Woven",
        slug: "woven-kids",
        order: 3,
        items: [
          { name: "Kids Shirts & Tops", slug: "kids-woven-shirt" },
          { name: "Kids Denim Jeans", slug: "kids-woven-denim" },
          { name: "Cargo Shorts & Pants", slug: "kids-woven-trouser" },
          { name: "School Uniforms & Jackets", slug: "kids-woven-jacket" }
        ]
      }
    ]
  },
  {
    title: "Sweater",
    slug: "sweater",
    order: 3,
    departments: [
      {
        name: "Men's Sweater",
        slug: "sweater-mens",
        order: 1,
        items: [
          { name: "Crewneck Pullovers", slug: "mens-sweater-crewneck" },
          { name: "V-Neck Sweaters", slug: "mens-sweater-vneck" },
          { name: "Cardigans & Button-Ups", slug: "mens-sweater-cardigan" },
          { name: "Turtlenecks & Mocknecks", slug: "mens-sweater-turtleneck" },
          { name: "Cable Knit & Heavy Gauge", slug: "mens-sweater-cable" },
          { name: "Sleeveless Knitted Vests", slug: "mens-sweater-vest" }
        ]
      },
      {
        name: "Women's Sweater",
        slug: "sweater-womens",
        order: 2,
        items: [
          { name: "Knitted Cardigans", slug: "womens-sweater-cardigan" },
          { name: "Crewneck Pullovers", slug: "womens-sweater-pullover" },
          { name: "Chunky & Oversized Knits", slug: "womens-sweater-chunky" },
          { name: "Ponchos & Shawl Knits", slug: "womens-sweater-poncho" },
          { name: "Turtlenecks & Fine Gauge", slug: "womens-sweater-turtleneck" }
        ]
      },
      {
        name: "Children's Sweater",
        slug: "sweater-kids",
        order: 3,
        items: [
          { name: "Kids Pullover Sweaters", slug: "kids-sweater-pullover" },
          { name: "Kids Button Cardigans", slug: "kids-sweater-cardigan" },
          { name: "Hooded Knit Sweaters", slug: "kids-sweater-hooded" },
          { name: "Baby Knitted Jumpers", slug: "kids-sweater-baby" }
        ]
      }
    ]
  },
  {
    title: "Accessories",
    slug: "accessories",
    order: 4,
    departments: [
      {
        name: "Garment Trims & Notions",
        slug: "acc-trims",
        order: 1,
        items: [
          { name: "Buttons (Metal, Plastic, Horn)", slug: "acc-buttons" },
          { name: "Zippers (Metal, Nylon, Coil)", slug: "acc-zippers" },
          { name: "Woven & Care Labels", slug: "acc-labels" },
          { name: "Hangtags & Price Tickets", slug: "acc-hangtags" },
          { name: "Elastic Bands & Drawstrings", slug: "acc-elastic" }
        ]
      },
      {
        name: "Fashion Accessories",
        slug: "acc-fashion",
        order: 2,
        items: [
          { name: "Caps, Beanies & Hats", slug: "acc-caps" },
          { name: "Scarves, Mufflers & Shawls", slug: "acc-scarves" },
          { name: "Socks & Hosiery", slug: "acc-socks" },
          { name: "Gloves & Mittens", slug: "acc-gloves" }
        ]
      },
      {
        name: "Packaging & Sourcing",
        slug: "acc-packaging",
        order: 3,
        items: [
          { name: "Poly Bags & Garment Covers", slug: "acc-polybags" },
          { name: "Export Master Cartons", slug: "acc-cartons" },
          { name: "Custom Garment Hangers", slug: "acc-hangers" }
        ]
      }
    ]
  }
];

async function main() {
  console.log('--- 1. Backing up existing products data in memory ---');
  const existingProducts = await prisma.product.findMany();
  console.log(`Found ${existingProducts.length} existing products.`);

  // Determine target slug for each product
  const productPlan = existingProducts.map(p => {
    let target = 'mens-tshirt';
    if (p.name.toLowerCase().includes('polo')) target = 'mens-polo';
    return {
      ...p,
      targetSlug: target
    };
  });

  console.log('--- 2. Building temporary mapping: upserting clean category pipeline ---');
  const activeCategoryIds = new Set();
  const slugToIdMap = new Map();

  for (const pillar of categoryPipeline) {
    const root = await prisma.category.upsert({
      where: { slug: pillar.slug },
      update: {
        name: pillar.title,
        order: pillar.order,
        parentId: null,
        isActive: true
      },
      create: {
        name: pillar.title,
        slug: pillar.slug,
        order: pillar.order,
        isActive: true
      }
    });
    activeCategoryIds.add(root.id);
    slugToIdMap.set(pillar.slug, root.id);

    for (const dept of pillar.departments) {
      const departmentCat = await prisma.category.upsert({
        where: { slug: dept.slug },
        update: {
          name: dept.name,
          order: dept.order,
          parentId: root.id,
          isActive: true
        },
        create: {
          name: dept.name,
          slug: dept.slug,
          parentId: root.id,
          order: dept.order,
          isActive: true
        }
      });
      activeCategoryIds.add(departmentCat.id);
      slugToIdMap.set(dept.slug, departmentCat.id);

      for (const item of dept.items) {
        const itemCat = await prisma.category.upsert({
          where: { slug: item.slug },
          update: {
            name: item.name,
            order: dept.items.indexOf(item) + 1,
            parentId: departmentCat.id,
            isActive: true
          },
          create: {
            name: item.name,
            slug: item.slug,
            parentId: departmentCat.id,
            order: dept.items.indexOf(item) + 1,
            isActive: true
          }
        });
        activeCategoryIds.add(itemCat.id);
        slugToIdMap.set(item.slug, itemCat.id);
      }
    }
  }

  console.log(`Upserted ${activeCategoryIds.size} clean categories.`);

  console.log('--- 3. Re-pointing products to the new categories ---');
  for (const p of productPlan) {
    const newCatId = slugToIdMap.get(p.targetSlug) || slugToIdMap.get('mens-tshirt');
    await prisma.product.update({
      where: { id: p.id },
      data: { categoryId: newCatId }
    });
    console.log(`Updated product "${p.name}" to category "${p.targetSlug}" (ID: ${newCatId})`);
  }

  console.log('--- 4. Deleting old obsolete categories not in the new pipeline ---');
  const obsoleteCategories = await prisma.category.findMany({
    where: {
      id: { notIn: Array.from(activeCategoryIds) }
    },
    select: { id: true, name: true, slug: true }
  });

  console.log(`Found ${obsoleteCategories.length} obsolete/duplicate categories to remove.`);

  // First unlink any parentId among obsolete categories so they delete cleanly without foreign key constraints
  for (const obs of obsoleteCategories) {
    await prisma.category.update({
      where: { id: obs.id },
      data: { parentId: null }
    }).catch(() => {});
  }

  // Delete all obsolete categories
  const deletedResult = await prisma.category.deleteMany({
    where: {
      id: { notIn: Array.from(activeCategoryIds) }
    }
  });
  console.log(`Successfully deleted ${deletedResult.count} obsolete categories.`);

  console.log('--- 5. Updating MenuItem for Categories MegaMenu ---');
  const megaMenuData = categoryPipeline.map(pillar => ({
    title: pillar.title,
    sections: pillar.departments.map(dept => ({
      header: dept.name,
      links: dept.items.map(item => ({
        label: item.name,
        url: `/products?category=${item.slug}`
      }))
    }))
  }));

  const menuStr = JSON.stringify(megaMenuData);

  const catMenuItem = await prisma.menuItem.findFirst({
    where: { menuLocation: 'main', label: 'Categories' }
  });

  if (catMenuItem) {
    await prisma.menuItem.update({
      where: { id: catMenuItem.id },
      data: { megaMenuData: menuStr, isMegaMenu: true, isActive: true }
    });
    console.log('Updated existing Categories mega menu item');
  } else {
    await prisma.menuItem.create({
      data: {
        menuLocation: 'main',
        label: 'Categories',
        url: '/products',
        order: 2,
        isMegaMenu: true,
        megaMenuData: menuStr,
        isActive: true
      }
    });
    console.log('Created new Categories mega menu item');
  }

  console.log('--- 6. Verification: Listing all root and child categories ---');
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
          _count: { select: { products: true } }
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log('\n=== CURRENT ROOTS ===');
  for (const r of roots) {
    console.log(`Pillar ${r.order}: [${r.name}] (slug: ${r.slug})`);
    for (const d of r.children) {
      console.log(`   -> Dept ${d.order}: [${d.name}] (slug: ${d.slug}, total sub-items: ${d.children.length})`);
    }
  }

  const verifiedProducts = await prisma.product.findMany({
    include: { category: { include: { parent: { include: { parent: true } } } } }
  });
  console.log('\n=== VERIFIED PRODUCTS ===');
  for (const p of verifiedProducts) {
    console.log(`Product: "${p.name}" => Leaf: "${p.category.name}" -> Dept: "${p.category.parent?.name}" -> Pillar: "${p.category.parent?.parent?.name}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
