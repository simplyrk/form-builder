import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import helmet from 'helmet';
import express from 'express';
import { validateEnvOrExit } from './src/lib/env-validation.js';

// Validate environment variables before starting the server
validateEnvOrExit();

const dev = process.env.NODE_ENV !== 'production';
const isDebugMode = process.env.DEBUG === 'true';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  
  // Apply Helmet middleware for security headers
  server.use(
    helmet({
      contentSecurityPolicy: false, // We manage CSP in middleware.ts
      crossOriginEmbedderPolicy: false, // Needed for some third-party integrations
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Allows OAuth popups
      
      // Configuration for specific headers
      dnsPrefetchControl: { allow: true },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 63072000, // 2 years in seconds
        includeSubDomains: true,
        preload: true
      },
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      xssFilter: true // Simple boolean instead of object with mode
    })
  );
  
  // Standard Next.js request handling
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  server.listen(3000, (err) => {
    if (err) throw err;
    // Only log in debug mode or as a startup message
    if (isDebugMode || process.env.NODE_ENV === 'production') {
      console.log('> Ready on http://localhost:3000 with Helmet security');
    }
  });
}); 