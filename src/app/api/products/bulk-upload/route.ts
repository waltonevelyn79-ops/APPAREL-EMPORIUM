import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { products } = body;

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        // Process sequentially or batch insert
        for (const [index, p] of products.entries()) {
            try {
                if (!p.Name || !p.Category || !p.ShortDescription) {
                    throw new Error('Missing required fields: Name, Category, or ShortDescription');
                }

                // Try find category
                let category = await prisma.category.findFirst({
                    where: { name: { equals: String(p.Category) } }
                });

                if (!category) {
                    // Create dummy category if not exists
                    const slug = String(p.Category).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    category = await prisma.category.create({
                        data: { name: String(p.Category), slug }
                    });
                }

                const specifications = {
                    SKU: p.SKU || '',
                    MOQ: p.MOQ || '',
                    Fabric: p.Fabric || '',
                    GSM: p.GSM || '',
                    'Lead Time': p.LeadTime || '',
                    Colors: p.Colors || '',
                    Sizes: p.Sizes || '',
                    Price: p.Price || '',
                };

                const slug = String(p.Name).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

                await prisma.product.create({
                    data: {
                        name: String(p.Name),
                        slug,
                        shortDescription: String(p.ShortDescription),
                        description: p.Description ? String(p.Description) : String(p.ShortDescription),
                        categoryId: category.id,
                        images: '["/images/placeholder-product.svg"]', // Default
                        specifications: JSON.stringify(specifications),
                        isActive: true,
                        isFeatured: p.Featured === 'Yes' || p.Featured === 'true' || p.Featured === true
                    }
                });

                success++;
            } catch (err: any) {
                failed++;
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({ success, failed, errors });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
