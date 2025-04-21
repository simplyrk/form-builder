/**
 * Security middleware for Helmet HTTP headers
 * This middleware applies security headers to all responses
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Apply Helmet-style security headers to the Next.js response
 * @param request - The incoming request
 */
export function middleware(request: NextRequest) {
  // Get the response with current headers
  const response = NextResponse.next();
  
  // Add security headers (similar to Helmet defaults)
  
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Enable strict HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Control DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Don't expose powered-by
  response.headers.delete('X-Powered-By');
  
  // Legacy XSS Protection (for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Set permissive CORS policy for the API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  return response;
}

/**
 * Apply this middleware to all routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 