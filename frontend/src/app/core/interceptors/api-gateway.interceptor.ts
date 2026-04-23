import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * API Gateway Interceptor
 * Handles common HTTP concerns for all requests going through the API Gateway.
 * Note: Authorization header (Bearer token) is handled by JwtInterceptor.
 * This interceptor handles:
 * - Content-Type / Accept headers (skipped for multipart/form-data uploads)
 * - Global error handling
 * - Retry logic
 * - Request logging (in development)
 */
@Injectable()
export class ApiGatewayInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip Content-Type for FormData requests (file uploads) — let browser set multipart boundary
    const isFormData = req.body instanceof FormData;

    let modifiedReq = req;
    if (!isFormData) {
      modifiedReq = req.clone({
        setHeaders: {
          'Accept': 'application/json'
        }
      });
    }

    // Log request in development mode
    if (!this.isProduction()) {
      console.log('[API Gateway] Request:', {
        method: modifiedReq.method,
        url: modifiedReq.url,
      });
    }

    // Send the request and handle errors
    return next.handle(modifiedReq).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  private isProduction(): boolean {
    return false;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;

      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        case 423:
          errorMessage = 'Account locked. Use the PIN sent by email to unblock.';
          break;
      }
    }

    console.error('[API Gateway] Error:', errorMessage, error);
    // Conserver HttpErrorResponse pour que les écrans (login 423 blocage, 403 device, etc.) lisent status + error.error
    return throwError(() => error);
  }
}
