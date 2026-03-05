import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';


export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Here you would typically verify the current user has SUPER_ADMIN role

        // Prevent deleting the last super admin
        const superAdminsCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
        const userToDelete = await prisma.user.findUnique({ where: { id: params.id } });

        if (userToDelete?.role === 'SUPER_ADMIN' && superAdminsCount <= 1) {
            return NextResponse.json({ error: "Cannot delete the last Super Admin" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();

        const updateData: any = {
            name: body.name,
            email: body.email,
            role: body.role,
            isActive: body.isActive
        };

        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData
        });

        // Don't return the password hash
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
