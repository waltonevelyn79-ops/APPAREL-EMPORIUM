import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const folder = formData.get('folder') as string || 'general';

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename & create unique name
        const originalName = file.name;
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9-]/g, '-');
        const fileName = `${baseName}-${Date.now()}${extension}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Store in DB Media Log
        const dbPath = `/uploads/${folder}/${fileName}`;
        const mediaFile = await prisma.mediaFile.create({
            data: {
                fileName,
                originalName,
                filePath: dbPath,
                fileSize: buffer.length,
                mimeType: file.type,
                folder,
            }
        });

        return NextResponse.json({ success: true, file: mediaFile });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
