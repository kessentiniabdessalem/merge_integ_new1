/**
 * Normalise la réponse GET /api/users/me (camelCase ou snake_case) pour l’UI.
 */
export function mapUserProfileFromApi(raw: unknown): {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  about?: string;
  preevaluationFinalLevel?: string | null;
} {
  const u = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const pickStr = (camel: string, snake?: string): string => {
    const a = u[camel];
    const b = snake ? u[snake] : undefined;
    const v = a !== undefined && a !== null ? a : b;
    if (typeof v === 'string') {
      return v;
    }
    if (v === undefined || v === null) {
      return '';
    }
    return String(v);
  };
  const idRaw = u['id'];
  const id = typeof idRaw === 'number' ? idRaw : Number(idRaw) || 0;
  const roleStr = pickStr('role');
  const avatarStr = pickStr('avatarUrl', 'avatar_url');
  const aboutStr = pickStr('about');
  const preRaw = u['preevaluationFinalLevel'] ?? u['preevaluation_final_level'];
  const preevaluationFinalLevel =
    typeof preRaw === 'string' && preRaw.trim() ? preRaw.trim() : undefined;
  return {
    id,
    firstName: pickStr('firstName', 'first_name'),
    lastName: pickStr('lastName', 'last_name'),
    email: pickStr('email'),
    role: roleStr || undefined,
    avatarUrl: avatarStr || undefined,
    about: aboutStr || undefined,
    preevaluationFinalLevel
  };
}
