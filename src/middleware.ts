import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { canAccessRoute, Role } from '@/lib/permissions';

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const method = req.method;

    // ── PRIORITY 1: Let OPTIONS preflight pass ALWAYS ─────────────────────────
    // Browsers send OPTIONS before every cross-origin POST/GET. If we block it,
    // the actual request never happens. OPTIONS carries no API key — by design.
    if (method === 'OPTIONS') {
        const preflightResponse = new NextResponse(null, { status: 204 });
        preflightResponse.headers.set('Access-Control-Allow-Origin', '*');
        preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization, ngrok-skip-browser-warning');
        preflightResponse.headers.set('Access-Control-Max-Age', '86400');
        return preflightResponse;
    }

    // ── PRIORITY 2: External API routes bypass ALL middleware auth ─────────────
    // /api/external/* is secured by API Key inside the route handler itself.
    // Middleware must not touch these routes — it has no session to check.
    if (path.startsWith('/api/external/')) {
        return NextResponse.next();
    }

    // Core routes definition
    const isAdminRoute = path.startsWith('/executive-portal-aelbd');
    const isApiRoute = path.startsWith('/api/');
    const isAdminApiRoute = path.startsWith('/api/admin/');

    // 1. Redirect Check (Check BEFORE Auth/Maintenance so redirects don't break)
    // Note: Ideally, this would securely fetch from DB, but edge function restrictions 
    // mean we might fetch from a cached API endpoint or handle static lists.
    // For now, allow passthrough if not explicitly intercepted below.

    // 2. Authentication Check for Admin Portals
    let token = null;
    if (isAdminRoute || isAdminApiRoute) {
        token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET || 'super-secret-key-12345'
        });

        if (!token) {
            if (isApiRoute) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/executive-login', req.url));
        }
    }

    // 3. RBAC Strict Route Permission Check
    if (token && isAdminRoute) {
        const userRole = token.role as Role;
        const mappedPath = path === '/executive-portal-aelbd' ? 'dashboard.view' : path; // Handle root

        // Basic map checks (More complex logic handled per-component or API layer)
        const allowed = canAccessRoute(userRole, path);
        if (!allowed) {
            // Prevent redirect loop by sending Viewer home if they hit a wall
            if (path !== '/executive-portal-aelbd') {
                return NextResponse.redirect(new URL('/executive-portal-aelbd', req.url));
            }
            // If they can't even see the dashboard, eject them
            return NextResponse.redirect(new URL('/executive-login?error=Forbidden', req.url));
        }
    }

    // 4. API Endpoints Safety Wall
    // Protect standard API routes from unauthorized POST/PUT/DELETE
    if (isApiRoute && !isAdminApiRoute) {
        // Allow public POST only for contact forms and RFQs
        const isPublicFormSubmission = (path.includes('/api/contact') || path.includes('/api/rfq')) && req.method === 'POST';

        // Block all non-GET requests if not authenticated (except forms)
        if (req.method !== 'GET' && !isPublicFormSubmission) {
            const apiToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'super-secret-key-12345' });
            if (!apiToken) {
                return NextResponse.json({ error: "Unauthorized Mutation" }, { status: 401 });
            }
        }
    }

    // 5. Developer Admin API Endpoints RBAC
    if (token && isAdminApiRoute) {
        if (path.includes('/api/admin/tracking') || path.includes('/api/admin/maintenance')) {
            if (token.role !== 'DEVELOPER') {
                return NextResponse.json({ error: "Forbidden: Developer access required" }, { status: 403 });
            }
        }
    }

    // 5. Generate Response with Security Headers
    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Optional maintenance mode check (could fetch from setting edge config)
    // if (!isAdminRoute && isMaintenanceMode) {
    //     return new NextResponse('Site under maintenance', { status: 503 });
    // }

    return res;
}

export const config = {
    // Middleware runs on all routes EXCEPT:
    // - api/auth       (NextAuth internal routes)
    // - api/external   (Our public external API — secured by API Key, not session)
    // - _next/static   (static assets)
    // - _next/image    (image optimization)
    // - favicon.ico
    matcher: ['/((?!api/auth|api/external|_next/static|_next/image|favicon.ico).*)'],
};

