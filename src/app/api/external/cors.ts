import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────
//  CORS Helper
//  Allows requests from:
//    • Any origin (external apps, Google AI Studio tools)
//    • file:// (HTML files opened locally on your computer)
//    • localhost (local dev)
//    • Your live domain (production server)
// ─────────────────────────────────────────────
export function corsHeaders(origin: string | null) {
    // Always allow — security is handled by the API Key, not origin
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
        'Access-Control-Max-Age': '86400', // 24hr preflight cache
    };
}

// Handles browser "preflight" OPTIONS request
export function handlePreflight(req: NextRequest) {
    const origin = req.headers.get('origin');
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(origin),
    });
}

// Wraps a NextResponse with CORS headers
export function withCors(req: NextRequest, res: NextResponse) {
    const origin = req.headers.get('origin');
    const headers = corsHeaders(origin);
    Object.entries(headers).forEach(([key, value]) => {
        res.headers.set(key, value);
    });
    return res;
}
