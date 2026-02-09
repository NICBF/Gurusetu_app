/**
 * Decode JWT payload for role. No verification (backend validates).
 */
export function decodeRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    const role = decoded?.role;
    return typeof role === 'string' ? role : null;
  } catch {
    return null;
  }
}
