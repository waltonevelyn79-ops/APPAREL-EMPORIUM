import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Starting product seeding...');

    // Categories
    const categoriesData = [
        { name: "Men's Fashion", slug: "mens-fashion", description: "Premium clothing for men including knit, woven, and sweaters." },
        { name: "Women's Fashion", slug: "womens-fashion", description: "Elegant and stylish clothing for women across all seasons." },
        { name: "Children's Fashion", slug: "childrens-fashion", description: "Comfortable and durable clothing for kids." },
        { name: "Home Textiles", slug: "home-textiles", description: "High-quality towels, bedding, and curtains for your home." },
        { name: "Footwear", slug: "footwear", description: "Comfortable basic and fashion espadrilles." },
        { name: "Accessories", slug: "accessories", description: "Scarves, hats, gloves, socks, and more." },
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of categoriesData) {
        const createdCat = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { description: cat.description },
            create: { name: cat.name, slug: cat.slug, description: cat.description, order: 0, isActive: true },
        });
        categoryMap[cat.name] = createdCat.id;
    }

    const productsData = [
        // Men's Fashion
        {
            name: "Men's Basic Knit T-Shirt", category: "Men's Fashion",
            shortDescription: "100% cotton basic knit t-shirt.",
            description: "High-quality 100% combed cotton basic t-shirt available in multiple colors. Perfect for everyday wear with durable stitching.",
        },
        {
            name: "Premium Men's Woven Shirt", category: "Men's Fashion",
            shortDescription: "Classic woven button-down shirt.",
            description: "Elegant woven shirt suitable for casual and formal occasions. Made with premium fabric with excellent breathability.",
        },
        {
            name: "Classic Men's Sweater Cardigan", category: "Men's Fashion",
            shortDescription: "Warm and stylish sweater.",
            description: "A timeless cardigan sweater made from a wool blend, offering superior warmth and style for the winter season.",
        },
        {
            name: "Men's Denim Jacket", category: "Men's Fashion",
            shortDescription: "Classic blue denim jacket.",
            description: "Durable and stylish denim jacket featuring classic styling, button closures, and multiple pockets. A wardrobe staple.",
        },
        {
            name: "Men's Sports Polo Shirt", category: "Men's Fashion",
            shortDescription: "Breathable moisture-wicking polo.",
            description: "Performance polo shirt designed for active wear. Moisture-wicking fabric keeps you cool and dry all day.",
        },

        // Women's Fashion
        {
            name: "Women's Elegant Dress", category: "Women's Fashion",
            shortDescription: "Beautiful evening and casual dress.",
            description: "A gorgeous dress crafted with attention to detail. Features a flattering fit suitable for various occasions.",
        },
        {
            name: "Women's Casual Knit Top", category: "Women's Fashion",
            shortDescription: "Comfortable everyday knit top.",
            description: "Soft and stretchy knit top that pairs perfectly with jeans or skirts. Experience ultimate comfort without compromising style.",
        },
        {
            name: "Premium Women's Woven Blouse", category: "Women's Fashion",
            shortDescription: "Sophisticated woven blouse.",
            description: "A versatile woven blouse that transitions seamlessly from office to evening wear. Premium quality fabric and elegant cut.",
        },
        {
            name: "Women's Stylish Overalls", category: "Women's Fashion",
            shortDescription: "Trendy and durable overalls.",
            description: "Fashionable overalls made with durable fabric. Perfect for a chic, casual look with practical pockets and adjustable straps.",
        },
        {
            name: "Women's Winter Sweater", category: "Women's Fashion",
            shortDescription: "Cozy knit winter sweater.",
            description: "Stay warm and stylish with this chunky knit winter sweater. Designed to keep the cold out while looking fabulous.",
        },

        // Children's Fashion
        {
            name: "Boys Graphic T-Shirt", category: "Children's Fashion",
            shortDescription: "Fun and comfortable boy's tee.",
            description: "Soft cotton t-shirt featuring fun and vibrant graphics. Durable enough for active kids and soft enough for all-day wear.",
        },
        {
            name: "Girls Floral Dress", category: "Children's Fashion",
            shortDescription: "Beautiful floral patterned dress.",
            description: "A lovely floral dress for girls made from breathable fabric. Perfect for parties, outings, and special occasions.",
        },
        {
            name: "Kids Winter Jacket", category: "Children's Fashion",
            shortDescription: "Warm and protective winter coat.",
            description: "Heavy-duty winter jacket designed to keep your little ones warm and protected during the coldest months.",
        },
        {
            name: "Children's Denim Pants", category: "Children's Fashion",
            shortDescription: "Durable everyday jeans.",
            description: "Classic denim pants designed specifically for children. Adjustable waistbands and reinforced knees for maximum durability.",
        },
        {
            name: "Kids Cozy Pullover", category: "Children's Fashion",
            shortDescription: "Soft fleece pullover sweatshirt.",
            description: "Extremely soft and cozy pullover perfect for layering. Easy to put on and take off, and machine washable.",
        },

        // Home Textiles
        {
            name: "Premium Bath Towel Set", category: "Home Textiles",
            shortDescription: "100% Egyptian cotton luxury towels.",
            description: "Experience spa-like luxury with our 100% Egyptian cotton bath towel set. Highly absorbent, ultra-soft, and durable.",
        },
        {
            name: "Luxury Bedding Duvet Cover", category: "Home Textiles",
            shortDescription: "Ultra-soft premium duvet cover.",
            description: "Transform your bedroom with this exquisite duvet cover. Made from high thread count fabric for a luxurious night's sleep.",
        },
        {
            name: "Elegant Window Curtains", category: "Home Textiles",
            shortDescription: "Room-darkening stylish curtains.",
            description: "Beautify your space with these elegant window curtains. Designed to block out excess light while adding a touch of sophistication.",
        },
        {
            name: "Soft Kitchen Towels", category: "Home Textiles",
            shortDescription: "Absorbent and durable kitchen towels.",
            description: "A must-have for every kitchen. These highly absorbent and lint-free towels make drying dishes and surfaces a breeze.",
        },
        {
            name: "Comfortable Cushion Covers", category: "Home Textiles",
            shortDescription: "Decorative protective cushion covers.",
            description: "Add a splash of color to your living room with these decorative cushion covers. Easy to remove and machine washable.",
        },

        // Footwear
        {
            name: "Basic Canvas Espadrilles", category: "Footwear",
            shortDescription: "Classic comfortable canvas shoes.",
            description: "The classic basic espadrille. Lightweight, breathable canvas upper with a traditional jute rope sole.",
        },
        {
            name: "Fashion Stripe Espadrilles", category: "Footwear",
            shortDescription: "Trendy striped espadrille design.",
            description: "Step out in style with our fashion striped espadrilles. Combines traditional comfort with a modern, eye-catching design.",
        },
        {
            name: "Everyday Canvas Shoes", category: "Footwear",
            shortDescription: "Durable and versatile canvas footwear.",
            description: "The perfect everyday shoe. Durable construction with a flexible sole for all-day comfort and support.",
        },
        {
            name: "Premium Linen Espadrilles", category: "Footwear",
            shortDescription: "High-end linen espadrilles.",
            description: "Elevate your summer wardrobe with premium linen espadrilles. Breathable, stylish, and incredibly comfortable.",
        },
        {
            name: "Summer Fashion Footwear", category: "Footwear",
            shortDescription: "Stylish summer-ready shoes.",
            description: "The ultimate footwear for the hot months. Lightweight design ensuring your feet stay cool and comfortable.",
        },

        // Accessories
        {
            name: "Winter Knitted Scarf", category: "Accessories",
            shortDescription: "Warm and cozy winter scarf.",
            description: "Wrap up nicely with this thick knitted winter scarf. Long enough to style in multiple ways to keep the chill away.",
        },
        {
            name: "Classic Baseball Cap", category: "Accessories",
            shortDescription: "Adjustable stylish baseball cap.",
            description: "A classic design that never goes out of style. Features an adjustable back strap for a perfect fit for any head size.",
        },
        {
            name: "Warm Fleece Gloves", category: "Accessories",
            shortDescription: "Thermal protective winter gloves.",
            description: "Keep your hands warm and protected during winter activities with these high-quality thermal fleece gloves.",
        },
        {
            name: "Premium Cotton Socks", category: "Accessories",
            shortDescription: "Breathable comfortable everyday socks.",
            description: "High-quality cotton blend socks offering excellent breathability, durability, and a snug fit that stays in place.",
        },
        {
            name: "Elegant Gift Box Packaging", category: "Accessories",
            shortDescription: "Premium presentation gift boxes.",
            description: "Make any gift special with our elegant gift box packaging. Sturdy construction with a luxurious finish.",
        }
    ];

    const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    for (const p of productsData) {
        const slug = generateSlug(p.name);

        const existing = await prisma.product.findUnique({ where: { slug } });
        if (!existing) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    slug: slug,
                    description: p.description,
                    shortDescription: p.shortDescription,
                    categoryId: categoryMap[p.category],
                    images: JSON.stringify(["/placeholder.jpg"]), // Use a generic placeholder
                    specifications: JSON.stringify({ "Material": "Premium Quality", "Care": "Machine washable" }),
                    isFeatured: Math.random() > 0.5,
                    isActive: true,
                }
            });
        }
    }

    console.log('Seeded ', productsData.length, ' products successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
