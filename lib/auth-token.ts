import { parseJwt } from './jwt';

export function normalizeAuthToken(token: unknown): string | null {
  if (typeof token !== 'string') return null;

  let normalized = token.trim();
  if (!normalized) return null;

  // Handle cases where token is accidentally serialized as a quoted string.
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  if (!normalized) return null;

  const lower = normalized.toLowerCase();
  if (lower === 'null' || lower === 'undefined') return null;

  if (lower.startsWith('bearer ')) {
    const rawToken = normalized.slice(7).trim();
    return rawToken || null;
  }

  return normalized;
}

export function isAuthTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  const exp = payload?.exp;

  if (typeof exp !== 'number') {
    return false;
  }

  return Date.now() >= exp * 1000;
}
