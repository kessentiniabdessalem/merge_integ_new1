import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Guard for protected routes requiring authentication.
 * Optionally checks that the user has the expected role.
 *
 * Usage in routes:
 *   canActivate: [authGuard]              — any authenticated user
 *   canActivate: [adminGuard]             — ADMIN role only
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token') || '';

  if (!token || isJwtExpired(token)) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  return true;
};

/**
 * Guard for /admin routes — requires valid JWT + ADMIN role.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token') || '';
  const role = (localStorage.getItem('role') || '').toUpperCase();

  if (!token || isJwtExpired(token)) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { role: 'admin', returnUrl: state.url }
    });
  }

  if (role !== 'ADMIN') {
    return router.createUrlTree(['/']);
  }

  return true;
};
