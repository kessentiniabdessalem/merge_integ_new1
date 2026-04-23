import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TicketValidationResponse {
  valid: boolean;
  message: string;
  ticketCode: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  participantName?: string;
  participantEmail?: string;
  status?: string;
  reservationDate?: string;
  alreadyUsed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TicketValidationService {
  private apiUrl = `${environment.apiBase}/reservations/validate`;

  constructor(private http: HttpClient) {}

  validateTicket(ticketCode: string): Observable<TicketValidationResponse> {
    return this.http.get<TicketValidationResponse>(`${this.apiUrl}/${ticketCode}`);
  }

  markAsUsed(ticketCode: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/${ticketCode}/use`,
      {},
      { responseType: 'text' }
    );
  }
}
