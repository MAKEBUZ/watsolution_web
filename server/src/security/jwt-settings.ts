import { randomBytes } from 'crypto';

// No fallback secret is permitted outside isolated tests.
export function loadJwtSettings(env: NodeJS.ProcessEnv = process.env) {
  const encoded = env.JWT_SECRET_BASE64 || (env.BACKEND_ENV === 'test' ? randomBytes(48).toString('base64') : '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || Buffer.from(encoded, 'base64').length < 32) {
    throw new Error('JWT_SECRET_BASE64 must contain a securely generated secret of at least 32 bytes.');
  }
  return {
    secret: Buffer.from(encoded, 'base64'),
    issuer: 'watsolution-api',
    audience: 'watsolution',
    expiresIn: '15m' as const,
  };
}

export const jwtSettings = loadJwtSettings();
