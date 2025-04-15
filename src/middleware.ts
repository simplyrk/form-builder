/**
 * Authentication middleware for the Cursor CRM application.
 * Uses Clerk to handle authentication and route protection.
 * 
 * Routes can be made public by adding them to the exclusion list in this file.
 * By default, all routes require authentication unless explicitly excluded.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk middleware configuration to protect routes.
 * 
 * @param auth - The auth object from Clerk
 * @param req - The request object from Next.js
 * @returns void - Returns nothing for public routes, continues auth checks for protected routes
 */
export default clerkMiddleware((auth, req) => {
  // Public routes that can be accessed without authentication
  if (
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/signin") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/sso-callback") ||
    req.nextUrl.pathname.startsWith("/forms/") ||
    req.nextUrl.pathname.startsWith("/api/forms/available") ||
    req.nextUrl.pathname.startsWith("/api/responses/user")
  ) {
    return;
  }
});

/**
 * Configuration for the middleware matcher.
 * Specifies which routes should be processed by this middleware.
 */
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 