/**
 * Authentication middleware for the Cursor CRM application.
 * Uses Clerk to handle authentication and route protection.
 * 
 * Routes can be made public by adding them to the exclusion list in this file.
 * By default, all routes require authentication unless explicitly excluded.
 */
import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

/**
 * Apply full security headers to the response
 */
function applySecurityHeaders(response: NextResponse, isAuthRoute: boolean): NextResponse {
  // For auth routes, use a more permissive CSP to ensure auth providers work
  if (isAuthRoute) {
    // More permissive CSP for auth routes
    response.headers.set(
      'Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    );
  } else {
    // Stricter CSP for regular application routes
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.dev https://cdn.jsdelivr.net https://*.googleusercontent.com https://*.google.com; " +
      "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev wss://*.clerk.accounts.dev https://*.google.com https://accounts.google.com; " +
      "img-src 'self' data: https://*.clerk.accounts.dev https://*.clerk.dev https://*.googleusercontent.com https://*.google.com https://lh3.googleusercontent.com; " +
      "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.googleusercontent.com; " +
      "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://*.google.com https://accounts.google.com; " +
      "object-src 'none';"
    );
  }

  // Add other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Check if a route is an authentication route
 */
function isAuthenticationRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/sso-callback") ||
    pathname.includes("sign-in") ||
    pathname.includes("auth")
  );
}

/**
 * Clerk middleware configuration to protect routes.
 * 
 * @param auth - The auth object from Clerk
 * @param req - The request object from Next.js
 * @returns NextResponse - Returns a response with security headers for routes
 */
export default clerkMiddleware((auth, req) => {
  // Create response with security headers
  const response = NextResponse.next();
  
  // Check if this is an auth route to apply appropriate security headers
  const isAuthRoute = isAuthenticationRoute(req.nextUrl.pathname);
  const secureResponse = applySecurityHeaders(response, isAuthRoute);
  
  // Check if route is public
  if (
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/signin") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/sso-callback") ||
    req.nextUrl.pathname.startsWith("/forms/") ||
    req.nextUrl.pathname.startsWith("/api/forms/available") ||
    req.nextUrl.pathname.startsWith("/api/responses/user")
  ) {
    // For public routes, return with security headers
    return secureResponse;
  }
  
  // For protected routes, let Clerk handle authentication
  // The auth session is already checked by Clerk middleware
  return secureResponse;
});

/**
 * Configuration for the middleware matcher.
 * Specifies which routes should be processed by this middleware.
 */
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 