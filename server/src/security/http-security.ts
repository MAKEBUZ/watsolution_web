import type { Express, Request, Response, NextFunction } from 'express';

// Keep the SPA policy aligned with client/nginx.conf. Bold is the only external
// executable integration; its checkout runs inside its own HTTPS frame.
export const contentSecurityPolicy =
  "default-src 'self'; script-src 'self' https://checkout.bold.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; frame-src 'self' https://checkout.bold.co; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.bold.co; upgrade-insecure-requests";
export const permissionsPolicy = 'camera=(), microphone=(), geolocation=(), browsing-topics=()';

export function configureHttpSecurity(app: Express) {
  app.disable('x-powered-by');
  app.set('etag', false);
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', contentSecurityPolicy);
    res.setHeader('Permissions-Policy', permissionsPolicy);
    // The HTTPS reverse proxy terminates TLS. Browsers ignore HSTS on HTTP.
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    next();
  });
}
