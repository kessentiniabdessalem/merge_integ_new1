import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReservationRequest {
  eventId: number;
  participantId: number;
}

export interface ReservationResponse {
  id: number;
  ticketCode: string;
  reservationDate: string;
  status: string;
  eventName: string;
  participantName: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiBase}/reservations`;

  constructor(private http: HttpClient) {}

  createReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request);
  }

  downloadTicket(reservationId: number): void {
    window.open(`${this.apiUrl}/${reservationId}/ticket`, '_blank');
  }

  getMyReservations(participantId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(
      `${this.apiUrl}/participant/${participantId}`
    );
  }

  getEventReservations(eventId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(
      `${this.apiUrl}/event/${eventId}`
    );
  }

  cancelReservation(reservationId: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${reservationId}`,
      { responseType: 'text' }
    );
  }
}
