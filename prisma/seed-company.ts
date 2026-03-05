import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const companySettings = [
        { key: 'company_name', value: 'Apparel Emporium' },
        { key: 'company_short_description', value: 'A 100% export-oriented readymade garments, home textiles, footwear and accessories buying house in Dhaka, Bangladesh. Sourcing excellence since inception.' },
        { key: 'company_address', value: 'House # 09, Road # 03 Sector # 05, Uttara\nDhaka- 1230, Bangladesh' },
        { key: 'company_phone', value: '+8801881 1422225' },
        { key: 'company_email', value: 'kamal@aelbd.net' },
        { key: 'company_website', value: 'www.aelbd.net' },
        { key: 'company_vision', value: 'Our vision is to be a premier Buying House to merchandise readymade garments, home textiles, footwear and accessories to international customers/buyers.' },
        { key: 'company_mission', value: 'Our mission is to source locally leading manufacturers and export readymade garments, home textiles, footwear and accessories to international customers/buyers.' },
        { key: 'seo_title', value: 'Apparel Emporium - Premium Garments Sourcing' },
        { key: 'seo_description', value: 'Top export oriented readymade garments, home textiles, footwear and accessories buying house in Dhaka, Bangladesh.' },
    ];

    for (const setting of companySettings) {
        await prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: { key: setting.key, value: setting.value }
        });
    }

    console.log('Seeded company information successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
