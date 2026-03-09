import { prisma } from './prisma';

type ActionContext = {
    userId?: string;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'SETTINGS_CHANGE' | 'EXPORT';
    entity?: string;
    entityId?: string;
    details?: string;
    request?: Request;
};

export const logActivity = async (context: ActionContext) => {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (context.request) {
        // Next.js request parsing
        ipAddress = context.request.headers.get('x-forwarded-for') || context.request.headers.get('x-real-ip') || 'Unknown';
        userAgent = context.request.headers.get('user-agent') || 'Unknown';
    }

    try {
        await prisma.activityLog.create({
            data: {
                userId: context.userId,
                action: context.action,
                entity: context.entity,
                entityId: context.entityId,
                details: context.details ? JSON.stringify(context.details) : null,
                ipAddress,
                userAgent
            }
        });
    } catch (error) {
        console.error("Failed to log activity event to database:", error);
    }
}

