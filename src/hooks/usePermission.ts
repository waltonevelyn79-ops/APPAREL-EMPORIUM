'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Role, hasPermission, canAccessRoute } from '@/lib/permissions';

export function usePermission() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const role = (session?.user as any)?.role as Role | undefined;
    const isLoading = status === 'loading';

    /**
     * Component level check for UI hiding/showing
     */
    const checkPermission = (permission: string) => {
        if (!role) return false;
        return hasPermission(role, permission);
    };

    /**
     * Route level check for navigation links
     */
    const checkRouteAccess = (route?: string) => {
        if (!route) route = pathname;
        if (!role) return false;
        return canAccessRoute(role, route);
    };

    return {
        hasPermission: checkPermission,
        canAccess: checkRouteAccess,
        role,
        isLoading
    };
}
