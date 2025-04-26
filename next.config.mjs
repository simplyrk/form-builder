/** @type {import('next').NextConfig} */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Note: We're now relying on the npm script validate-env
// which runs before the build to validate environment variables
// This avoids the need for hacky imports in this config file

const nextConfig = {
  typescript: {
    // Enable TypeScript checks during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Run ESLint during builds
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '10mb', // Increase body size limit for file uploads
    },
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "img-src 'self' blob: data: https://*.clerk.accounts.dev https://*.clerk.dev https://*.googleusercontent.com https://*.google.com https://lh3.googleusercontent.com https://img.clerk.com;",
              "script-src 'self';",
              "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.googleusercontent.com https://fonts.googleapis.com;",
              "font-src 'self' data: https://fonts.gstatic.com;",
              "connect-src 'self';",
              "media-src 'self' blob:;",
              "object-src 'none';",
              "worker-src 'self' blob:;"
            ].join(' '),
          },
        ],
      },
    ];
  },
}

export default nextConfig; 