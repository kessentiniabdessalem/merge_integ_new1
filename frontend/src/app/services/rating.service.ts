import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Rating {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  note: number;
  commentaire: string;
  createdAt: string;
}

export interface CreateRatingRequest {
  teacherId: number;
  teacherName: string;
  note: number;
  commentaire: string;
}

@Injectable({ providedIn: 'root' })
export class RatingService {
  private base = `${environment.apiBase}/ratings`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  createRating(req: CreateRatingRequest): Observable<Rating> {
    return this.http.post<Rating>(this.base, req, { headers: this.authHeaders() });
  }

  getRatingsByTeacher(teacherId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.base}/teacher/${teacherId}`, { headers: this.authHeaders() });
  }

  getAverageRating(teacherId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/teacher/${teacherId}/average`, { headers: this.authHeaders() });
  }

  getAllRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(this.base, { headers: this.authHeaders() });
  }
}
