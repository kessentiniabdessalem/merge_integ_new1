import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QrStartResponse {
  sessionId: string;
  qrUrl: string;
  expiresAt: string;
}

export interface QrStatusResponse {
  status: 'PENDING' | 'APPROVED' | 'EXPIRED';
  exchangeCode?: string;
}

export interface QrExchangeResponse {
  token: string;
  role: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class QrAuthService {

  private baseUrl = `${environment.apiGatewayUrl}/api/auth/qr`;

  constructor(private http: HttpClient) {}

  start(email?: string, space?: string): Observable<QrStartResponse> {
    const body: Record<string, string> = {};
    if (email && email.trim().length > 0) {
      body['email'] = email.trim();
    }
    body['space'] = (space && space.trim().length > 0) ? space.trim().toLowerCase() : 'student';
    return this.http.post<QrStartResponse>(`${this.baseUrl}/start`, body);
  }

  status(sessionId: string): Observable<QrStatusResponse> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.get<QrStatusResponse>(`${this.baseUrl}/status`, { params });
  }

  approve(token: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/approve`, { token });
  }

  exchange(sessionId: string, exchangeCode: string): Observable<QrExchangeResponse> {
    return this.http.post<QrExchangeResponse>(`${this.baseUrl}/exchange`, {
      sessionId,
      exchangeCode
    });
  }
}
