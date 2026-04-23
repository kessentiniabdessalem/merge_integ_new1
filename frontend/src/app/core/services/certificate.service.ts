import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiGatewayService } from './api-gateway.service';
import { ApiConfig } from '../config/api.config';

export interface Certificate {
  id?: number;
  user_id: number;
  course_id: number;
  certificate_number: string;
  issue_date: string;
  completion_date: string;
  grade?: number;
  status: string;
  pdf_path?: string;
  verification_code: string;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  course_title?: string;
}

/**
 * Certificate Service - Communicates with Certificate Microservice through API Gateway
 * All requests go through: http://localhost:8080/api/**
 */
@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly serviceName = 'certificate' as const;

  constructor(private gateway: ApiGatewayService) {}

  /**
   * Get all certificates
   */
  getCertificates(): Observable<Certificate[]> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.certificate.list
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get certificate by ID
   */
  getCertificateById(id: number): Observable<Certificate> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.certificate.getById(id)
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get certificates by user ID
   */
  getCertificatesByUser(userId: number): Observable<Certificate[]> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.certificate.getByUser(userId)
    ).pipe(map(response => response.data || response));
  }

  /**
   * Verify certificate by verification code
   */
  verifyCertificate(code: string): Observable<Certificate> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.certificate.verify(code)
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get total certificates count
   */
  getCertificatesCount(): Observable<number> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.certificate.count
    ).pipe(map(response => response.data || response));
  }

  /**
   * Create a new certificate
   */
  createCertificate(certificate: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Observable<Certificate> {
    return this.gateway.post<Certificate>(
      this.serviceName,
      ApiConfig.endpoints.certificate.create,
      certificate
    );
  }

  /**
   * Update certificate
   */
  updateCertificate(id: number, certificate: Partial<Certificate>): Observable<Certificate> {
    return this.gateway.put<Certificate>(
      this.serviceName,
      ApiConfig.endpoints.certificate.update(id),
      certificate
    );
  }

  /**
   * Delete certificate
   */
  deleteCertificate(id: number): Observable<void> {
    return this.gateway.delete<void>(
      this.serviceName,
      ApiConfig.endpoints.certificate.delete(id)
    );
  }

  /**
   * Generate certificate PDF
   */
  generateCertificate(id: number): Observable<Blob> {
    return this.gateway.get<Blob>(
      this.serviceName,
      ApiConfig.endpoints.certificate.generate(id)
    );
  }

  // Legacy method names for backward compatibility
  getCertificate(id: number): Observable<Certificate> {
    return this.getCertificateById(id);
  }
}
