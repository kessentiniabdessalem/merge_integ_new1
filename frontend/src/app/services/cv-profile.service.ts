import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CvProfile {
  id: number;
  userId: number;
  cvPath: string;
  extractedText: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CvProfileService {
  private base = `${environment.apiBase}/cv-profiles`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  uploadCv(file: File): Observable<CvProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CvProfile>(`${this.base}/upload`, formData, {
      headers: this.authHeaders(),
    });
  }

  getMyCv(): Observable<CvProfile> {
    return this.http.get<CvProfile>(`${this.base}/my`, { headers: this.authHeaders() });
  }
}
