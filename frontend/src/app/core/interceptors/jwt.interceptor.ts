import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');

    // Public endpoints that do not need a token
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/unblock-request',
      '/api/auth/unblock-verify',
      // Confirmation nouveau device (sans JWT)
      '/api/auth/device',

      // Passkey login (public)
      '/api/webauthn/authenticate'
    ];

    const isPublic = publicEndpoints.some(url => req.url.includes(url));

    if (token && !isPublic) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req);
  }
}
