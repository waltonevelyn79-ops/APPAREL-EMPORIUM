import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserRole = (session?.user as any)?.role;

        if (!session || (!['SUPER_ADMIN', 'DEVELOPER'].includes(currentUserRole))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const submissions = await prisma.formSubmission.findMany({
            where: { formId: params.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, submissions });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();

        const form = await prisma.customForm.findUnique({ where: { id: params.id } });
        if (!form || !form.isActive) {
            return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
        }

        // Parse fields to validate required ones
        let fields = [];
        try {
            fields = JSON.parse(form.fields);
        } catch (e) { }

        const missingFields = [];
        for (const field of fields) {
            if (field.required && (!data[field.label] || data[field.label].trim() === '')) {
                missingFields.push(field.label);
            }
        }

        if (missingFields.length > 0) {
            return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
        }

        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';

        const submission = await prisma.formSubmission.create({
            data: {
                formId: form.id,
                data: JSON.stringify(data),
                ipAddress,
            }
        });

        // Create Admin Notification
        const adminUsers = await prisma.user.findMany({
            where: { role: { in: ['SUPER_ADMIN', 'DEVELOPER'] } }
        });

        const notifications = adminUsers.map((user: any) => ({
            userId: user.id,
            type: 'INFO',
            title: `New Form Submission: ${form.name}`,
            message: `A new submission was received for the form "${form.name}".`,
            link: `/admin/forms/${form.id}/submissions`
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
        }

        // Email logic would be integrated here if we had the mailer setup (we do in /api/email/send)

        return NextResponse.json({ success: true, message: form.successMessage || 'Form submitted successfully' });
    } catch (error) {
        console.error("Form Submit Error:", error);
        return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserRole = (session?.user as any)?.role;

        if (!session || (!['SUPER_ADMIN', 'DEVELOPER'].includes(currentUserRole))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const url = new URL(req.url);
        const subId = url.searchParams.get('submissionId');

        if (!subId) return NextResponse.json({ error: "Submission ID missing" }, { status: 400 });

        await prisma.formSubmission.delete({ where: { id: subId, formId: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
    }
}
