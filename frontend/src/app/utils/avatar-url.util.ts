import { environment } from '../../environments/environment';

/**
 * URL utilisable par le navigateur pour avatars / fichiers servis par le user-service.
 * En dev (apiGatewayUrl vide), les chemins /uploads/... passent par le proxy ng serve.
 */
export function resolveAvatarUrl(avatarUrl: string | null | undefined, cacheBuster?: number): string | null {
  if (avatarUrl == null || String(avatarUrl).trim() === '') {
    return null;
  }
  const url = String(avatarUrl).trim();
  const sep = url.includes('?') ? '&' : '?';
  const q = cacheBuster != null ? `${sep}t=${cacheBuster}` : '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `${url}${q}`;
  }

  const base = environment.apiGatewayUrl || '';

  if (url.startsWith('/')) {
    return `${base}${url}${q}`;
  }
  if (url.startsWith('uploads/')) {
    return `${base}/${url}${q}`;
  }
  return `${base}/uploads/${url}${q}`;
}
