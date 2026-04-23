import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventLikeService {
  private apiUrl = `${environment.apiBase}/events/likes`;

  constructor(private http: HttpClient) {}

  likeEvent(eventId: number, participantId: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/${eventId}/participant/${participantId}`,
      {},
      { responseType: 'text' }
    );
  }

  unlikeEvent(eventId: number, participantId: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${eventId}/participant/${participantId}`,
      { responseType: 'text' }
    );
  }

  isLiked(eventId: number, participantId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${eventId}/participant/${participantId}/status`
    );
  }

  getLikesCount(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${eventId}/count`);
  }
}
