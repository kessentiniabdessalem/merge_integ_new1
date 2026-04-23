import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Meeting {
  id: number;
  applicationId: number;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  notes: string;
  assignedToId: number;
  assignedToName: string;
}

export interface NextMeeting {
  meetingId: number;
  applicationId: number;
  jobTitle: string;
  scheduledAt: string;
  meetingLink: string;
  assignedToName: string;
}

export interface ScheduleMeetingRequest {
  applicationId: number;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  notes?: string;
  assignedToId: number;
  assignedToName: string;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private base = `${environment.apiBase}/meetings`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  scheduleMeeting(req: ScheduleMeetingRequest): Observable<Meeting> {
    return this.http.post<Meeting>(this.base, req, { headers: this.authHeaders() });
  }

  updateMeeting(id: number, req: Partial<ScheduleMeetingRequest>): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.base}/${id}`, req, { headers: this.authHeaders() });
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { headers: this.authHeaders() });
  }

  getMeetingsByApplication(applicationId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.base}/application/${applicationId}`, { headers: this.authHeaders() });
  }

  getMyMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.base}/my`, { headers: this.authHeaders() });
  }

  getNextMeeting(): Observable<NextMeeting> {
    return this.http.get<NextMeeting>(`${this.base}/next`, { headers: this.authHeaders() });
  }

  getAllMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.base, { headers: this.authHeaders() });
  }
}
