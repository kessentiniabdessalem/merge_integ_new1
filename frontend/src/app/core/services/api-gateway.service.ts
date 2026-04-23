import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../config/api.config';

/**
 * Centralized API Gateway Service
 * All HTTP communication goes through this service to the API Gateway
 * No direct communication with individual microservices
 */
@Injectable({ providedIn: 'root' })
export class ApiGatewayService {
  constructor(private http: HttpClient) {}

  /**
   * Generic GET request through API Gateway
   * @param serviceName - Microservice name (e.g., 'payment', 'user')
   * @param endpoint - Endpoint path
   * @param params - Query parameters
   */
  get<T>(serviceName: keyof typeof ApiConfig.services, endpoint: string, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(serviceName, endpoint);
    const httpParams = this.buildParams(params);
    return this.http.get<T>(url, { params: httpParams });
  }

  /**
   * Generic POST request through API Gateway
   */
  post<T>(serviceName: keyof typeof ApiConfig.services, endpoint: string, body: any): Observable<T> {
    const url = this.buildUrl(serviceName, endpoint);
    return this.http.post<T>(url, body);
  }

  /**
   * Generic PUT request through API Gateway
   */
  put<T>(serviceName: keyof typeof ApiConfig.services, endpoint: string, body: any): Observable<T> {
    const url = this.buildUrl(serviceName, endpoint);
    return this.http.put<T>(url, body);
  }

  /**
   * Generic DELETE request through API Gateway
   */
  delete<T>(serviceName: keyof typeof ApiConfig.services, endpoint: string): Observable<T> {
    const url = this.buildUrl(serviceName, endpoint);
    return this.http.delete<T>(url);
  }

  /**
   * Generic PATCH request through API Gateway
   */
  patch<T>(serviceName: keyof typeof ApiConfig.services, endpoint: string, body: any): Observable<T> {
    const url = this.buildUrl(serviceName, endpoint);
    return this.http.patch<T>(url, body);
  }

  /**
   * Build full URL for API Gateway request
   */
  private buildUrl(serviceName: keyof typeof ApiConfig.services, endpoint: string): string {
    const serviceBaseUrl = ApiConfig.services[serviceName];
    return `${serviceBaseUrl}${endpoint}`;
  }

  /**
   * Build HttpParams from object
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return httpParams;
  }
}
