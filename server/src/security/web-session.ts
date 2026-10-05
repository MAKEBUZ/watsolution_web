import { ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';

export const refreshCookie = '__Host-watsolution-refresh';
export function isWebSession(req: Request) { return req.get('X-Session-Transport') === 'web'; }
export function requireWebOrigin(req: Request) {
  const allowed = (process.env.WEB_ORIGINS ?? '').split(',').map(v => v.trim()).filter(Boolean);
  if (!req.get('Origin') || !allowed.includes(req.get('Origin'))) throw new ForbiddenException('Origin not allowed');
}
export function readRefreshCookie(req: Request): string {
  return (req.headers.cookie ?? '').split(';').map(v => v.trim()).find(v => v.startsWith(`${refreshCookie}=`))?.slice(refreshCookie.length + 1) ?? '';
}
export function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookie, token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 7 * 86400000 });
  res.setHeader('Cache-Control', 'no-store');
}
export function clearRefreshCookie(res: Response) {
  res.clearCookie(refreshCookie, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
  res.setHeader('Cache-Control', 'no-store');
}
