export type Role = 'DEVELOPER' | 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'BUYER';

// Define all possible permissions in the system mapped to arrays for checking
export const PERMISSIONS = {
    DEVELOPER: ['*'], // God Mode
    SUPER_ADMIN: [
        'products.*', 'categories.*', 'blog.*', 'inquiries.*', 'rfq.*', 'users.manage',
        'media.*', 'settings.*', 'seo.*', 'menus.*', 'homepage.*', 'pages.*', 'theme.*',
        'forms.*', 'popups.*', 'activity_log.view', 'email.*', 'analytics.*', 'dashboard.view'
    ],
    ADMIN: [
        'products.create', 'products.edit', 'products.delete', 'products.view',
        'categories.*', 'blog.*', 'inquiries.view', 'inquiries.reply',
        'rfq.view', 'rfq.update', 'media.upload', 'media.view', 'analytics.view',
        'bulk_upload', 'dashboard.view'
    ],
    EDITOR: [
        'products.create', 'products.edit', 'products.view',
        'blog.create', 'blog.edit', 'blog.view',
        'inquiries.view', 'media.upload', 'media.view', 'dashboard.view'
    ],
    VIEWER: [
        'dashboard.view', 'products.view', 'inquiries.view', 'analytics.view'
    ],
    BUYER: [
        'buyer_dashboard.view', 'rfq.create', 'rfq.view_own', 'products.view', 'catalog.download'
    ]
} as const;

// Define a route permission map for middleware and frontend checking
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
    '/admin': ['dashboard.view', 'buyer_dashboard.view'],
    '/admin/products': ['products.view'],
    '/admin/products/new': ['products.create'],
    '/admin/bulk-upload': ['bulk_upload'],
    '/admin/categories': ['categories.view', 'categories.*'],
    '/admin/blog': ['blog.view', 'blog.*'],
    '/admin/blog/new': ['blog.create', 'blog.*'],
    '/admin/inquiries': ['inquiries.view', 'inquiries.*'],
    '/admin/rfq': ['rfq.view', 'rfq.*'],
    '/admin/media': ['media.view', 'media.*'],
    '/admin/users': ['users.manage'],
    '/admin/menus': ['menus.*'],
    '/admin/pages': ['pages.*'],
    '/admin/homepage': ['homepage.*'],
    '/admin/theme': ['theme.*'],
    '/admin/forms': ['forms.*'],
    '/admin/popups': ['popups.*'],
    '/admin/seo': ['seo.*'],
    '/admin/email': ['email.*'],
    '/admin/settings': ['settings.*'],

    // Developer only routes (checked explicitly)
    '/admin/tracking': ['*'],
    '/admin/maintenance': ['*'],
    '/admin/performance': ['*'],
    '/admin/activity-log': ['activity_log.view', '*']
};

/**
 * Checks if a specific role has a given permission string.
 */
export function hasPermission(role: Role | undefined | null, permission: string): boolean {
    if (!role || !PERMISSIONS[role]) return false;

    const rolePermissions = PERMISSIONS[role] as readonly string[];

    // Developer wildcard check
    if (rolePermissions.includes('*')) return true;

    // Direct match check
    if (rolePermissions.includes(permission)) return true;

    // Wildcard expansion check (e.g. 'products.*' covers 'products.create')
    const [resource, action] = permission.split('.');
    if (rolePermissions.includes(`${resource}.*`)) return true;

    return false;
}

/**
 * Recursively checks if a role can access a specific route pathname.
 */
export function canAccessRoute(role: Role | undefined | null, routePath: string): boolean {
    if (!role) return false;
    if (role === 'DEVELOPER') return true;

    // Check exact matches or parent directory matches
    for (const [route, requiredPerms] of Object.entries(ROUTE_PERMISSIONS)) {
        if (routePath === route || routePath.startsWith(`${route}/`)) {
            const perms = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];
            if (perms.some(p => hasPermission(role, p))) {
                return true;
            }
        }
    }

    // Default deny for unmapped /admin routes
    if (routePath.startsWith('/admin')) {
        return false;
    }

    return true; // Allow public routes
}

export type SidebarItem = {
    label: string;
    icon: string;
    href: string;
};

/**
 * Constructs the sidebar navigation array dynamically based on role permissions.
 */
export function getAccessibleSidebarItems(role: Role | undefined | null): SidebarItem[] {
    if (!role) return [];

    const items: SidebarItem[] = [];

    if (hasPermission(role, 'dashboard.view')) items.push({ label: 'Dashboard', icon: 'LayoutDashboard', href: '/admin' });
    if (hasPermission(role, 'buyer_dashboard.view')) items.push({ label: 'Portal', icon: 'ShoppingBag', href: '/admin' });

    if (hasPermission(role, 'products.view')) items.push({ label: 'Products', icon: 'Package', href: '/admin/products' });
    if (hasPermission(role, 'bulk_upload')) items.push({ label: 'Bulk Upload', icon: 'Upload', href: '/admin/bulk-upload' });
    if (hasPermission(role, 'categories.*') || hasPermission(role, 'categories.view')) items.push({ label: 'Categories', icon: 'Tags', href: '/admin/categories' });

    if (hasPermission(role, 'rfq.view') || hasPermission(role, 'rfq.view_own')) items.push({ label: 'Quotes', icon: 'ClipboardList', href: '/admin/rfq' });
    if (hasPermission(role, 'inquiries.view')) items.push({ label: 'Inquiries', icon: 'MessageSquare', href: '/admin/inquiries' });
    if (hasPermission(role, 'forms.*')) items.push({ label: 'Submissions', icon: 'FileDigit', href: '/admin/forms' });

    if (hasPermission(role, 'media.view')) items.push({ label: 'Media Library', icon: 'FileImage', href: '/admin/media' });
    if (hasPermission(role, 'blog.view')) items.push({ label: 'Blog', icon: 'FileText', href: '/admin/blog' });

    if (hasPermission(role, 'users.manage')) items.push({ label: 'Users & Roles', icon: 'Users', href: '/admin/users' });

    if (hasPermission(role, 'menus.*')) items.push({ label: 'Menus', icon: 'MenuIcon', href: '/admin/menus' });
    if (hasPermission(role, 'pages.*')) items.push({ label: 'Pages', icon: 'FileCode', href: '/admin/pages' });
    if (hasPermission(role, 'homepage.*')) items.push({ label: 'Homepage Builder', icon: 'LayoutTemplate', href: '/admin/homepage' });
    if (hasPermission(role, 'theme.*')) items.push({ label: 'Theme Settings', icon: 'Paintbrush', href: '/admin/theme' });
    if (hasPermission(role, 'popups.*')) items.push({ label: 'Pop-ups', icon: 'Megaphone', href: '/admin/popups' });

    if (hasPermission(role, 'seo.*')) items.push({ label: 'SEO Manager', icon: 'Globe', href: '/admin/seo' });
    if (hasPermission(role, 'email.*')) items.push({ label: 'Email Config', icon: 'Mail', href: '/admin/email' });
    if (hasPermission(role, 'settings.*')) items.push({ label: 'General Settings', icon: 'Settings', href: '/admin/settings' });

    if (hasPermission(role, '*')) {
        items.push({ label: 'Tracking Scripts', icon: 'BarChart3', href: '/admin/tracking' });
        items.push({ label: 'Activity Logs', icon: 'Activity', href: '/admin/activity-log' });
        items.push({ label: 'Maintenance', icon: 'ShieldAlert', href: '/admin/maintenance' });
    } else if (hasPermission(role, 'activity_log.view')) {
        items.push({ label: 'Activity Logs', icon: 'Activity', href: '/admin/activity-log' });
    }

    return items;
}

const ROLE_RANKS = {
    'DEVELOPER': 100,
    'SUPER_ADMIN': 80,
    'ADMIN': 60,
    'EDITOR': 40,
    'VIEWER': 20,
    'BUYER': 10
} as const;

/**
 * Validates hierarchy. Useful for ensuring Admins can't edit Super Admins, etc.
 */
export function isRoleHigherThan(role1: Role, role2: Role): boolean {
    return ROLE_RANKS[role1] > ROLE_RANKS[role2];
}
