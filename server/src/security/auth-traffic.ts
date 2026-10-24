import { Express, Request, Response, NextFunction } from 'express';
import { isIP } from 'net';
import { LoginRateLimitService } from './login-rate-limit.service';

export function configureAuthTraffic(app: Express, limits: LoginRateLimitService) {
  // Exact proxy addresses only. Never trust a forwarded header from arbitrary peers.
  const proxies = (process.env.TRUSTED_PROXY_IPS ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
  if (proxies.some(ip => !isIP(ip))) throw new Error('TRUSTED_PROXY_IPS must contain exact proxy IP addresses');
  app.set('trust proxy', (ip: string) => proxies.includes(ip) || proxies.includes(ip.replace(/^::ffff:/, '')));
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const sensitive = [
      '/api/authenticate',
      '/api/register',
      '/api/account/reset-password/init',
      '/api/account/reset-password/finish',
      '/api/activate',
      '/api/session/refresh',
      '/api/session/logout',
    ];
    if (!sensitive.includes(req.path) && req.path !== '/api/account/change-password' && !req.path.startsWith('/api/security/'))
      return next();
    const registration = req.path === '/api/register' || req.path.includes('reset-password');
    try {
      // Global first bounds creation of new per-origin/account buckets.
      await limits.consumeBucket(`global:${registration ? 'registration' : 'auth'}`, registration ? 30 : 600);
      await limits.consumeBucket(`origin:${registration ? 'registration' : 'auth'}:${req.ip}`, registration ? 5 : 60);
      next();
    } catch (error) {
      const unavailable = error?.getStatus?.() !== 429;
      res.setHeader('Retry-After', '60');
      res.status(unavailable ? 503 : 429).json({ statusCode: unavailable ? 503 : 429, message: 'Inténtalo de nuevo en un minuto.' });
    }
  });
}
