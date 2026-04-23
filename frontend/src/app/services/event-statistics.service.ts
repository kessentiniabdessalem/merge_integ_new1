import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EventStatistics {
  totalEvents: number;
  totalReservations: number;
  totalParticipants: number;
  topReservedEvents: any[];
  eventsByCategory: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class EventStatisticsService {
  private apiUrl = `${environment.apiBase}/events`;

  constructor(private http: HttpClient) {}

  getStatistics(): Observable<EventStatistics> {
    return this.http.get<EventStatistics>(`${this.apiUrl}/statistics`);
  }
}
