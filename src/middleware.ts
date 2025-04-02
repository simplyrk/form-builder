import { clerkMiddleware } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware((auth, req) => {
  // Allow public access to these routes
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

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 