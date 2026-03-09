import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserRole = (session?.user as any)?.role;

        if (!session || !['SUPER_ADMIN', 'DEVELOPER'].includes(currentUserRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const roleFilter = searchParams.get('role');

        const whereClause: any = {};
        if (roleFilter) whereClause.role = roleFilter;

        // SUPER_ADMIN cannot see DEVELOPER accounts
        if (currentUserRole !== 'DEVELOPER') {
            whereClause.role = { not: 'DEVELOPER' };
            if (roleFilter === 'DEVELOPER') return NextResponse.json({ success: true, users: [] });
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: { id: true, name: true, email: true, role: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserRole = (session?.user as any)?.role;

        if (!session || !['SUPER_ADMIN', 'DEVELOPER'].includes(currentUserRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await req.json();
        const { name, email, password, role, isActive } = data;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Role Validation
        if (currentUserRole === 'SUPER_ADMIN' && ['SUPER_ADMIN', 'DEVELOPER'].includes(role)) {
            return NextResponse.json({ error: "Cannot create user with this role" }, { status: 403 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                isActive: isActive ?? true
            },
            select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true }
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

