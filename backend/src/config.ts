// Central place for security-sensitive configuration.
// The JWT secret must be provided in production; a throwaway dev value is
// only used when NODE_ENV is not "production".
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (16+ characters) in production');
  }
  return 'dev-only-insecure-secret';
}

// Comma-separated list of allowed browser origins. Unset = allow all (dev only).
export function getCorsOrigins(): string[] | true {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return true;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
