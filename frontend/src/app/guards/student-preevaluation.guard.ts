import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PreevaluationApiService } from '../services/preevaluation-api.service';
import { SessionService } from '../services/session.service';

/** Spring / OAuth peuvent exposer ROLE_STUDENT au lieu de STUDENT. */
export function normalizeStudentRole(raw: string): string {
  const u = (raw || '').toUpperCase().trim();
  if (u === 'ROLE_STUDENT') {
    return 'STUDENT';
  }
  return u;
}

export function resolveStudentRole(session: SessionService): string {
  const fromLs = normalizeStudentRole(localStorage.getItem('role') || '');
  if (fromLs) {
    return fromLs;
  }
  const fromSession = normalizeStudentRole(session.getCurrentUser()?.role || '');
  if (fromSession) {
    return fromSession;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    return '';
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const r = String(
      payload?.role || payload?.roles?.[0] || payload?.authorities?.[0] || ''
    );
    return normalizeStudentRole(r);
  } catch {
    return '';
  }
}

/**
 * Ne bloque plus l’accès au site tant que la préévaluation n’est pas faite (comme ang).
 * Seul cas forcé : étudiant avec préévaluation terminée pour fraude → page cheating-terminated.
 * Si GET /status échoue, on laisse passer (évite de piéger l’utilisateur quand le service est down).
 */
export const studentPreevaluationGateGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const api = inject(PreevaluationApiService);
  const session = inject(SessionService);

  const role = resolveStudentRole(session);
  if (role !== 'STUDENT') {
    return true;
  }

  if (!localStorage.getItem('token')) {
    return true;
  }

  return api.getStatus().pipe(
    map((s) => {
      if (s.terminatedForCheating === true) {
        if (state.url.includes('/preevaluation/cheating-terminated')) {
          return true;
        }
        return router.parseUrl('/preevaluation/cheating-terminated');
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
