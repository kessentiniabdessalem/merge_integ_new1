import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiBase}/events`;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  // Alias for compatibility with other components
  getAll(): Observable<Event[]> {
    return this.getAllEvents();
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // Alias for compatibility
  getById(id: number): Observable<Event> {
    return this.getEventById(id);
  }

  createEvent(event: any): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  // Alias for compatibility
  create(event: any): Observable<Event> {
    return this.createEvent(event);
  }

  updateEvent(id: number, event: any): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  // Alias for compatibility
  update(id: number, event: any): Observable<Event> {
    return this.updateEvent(id, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alias for compatibility
  delete(id: number): Observable<void> {
    return this.deleteEvent(id);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  searchEvents(keyword?: string, category?: string, status?: string, page = 0, size = 10): Observable<any> {
    let params: any = { page, size };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (status) params.status = status;
    
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  reserve(eventId: number, participant: any): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/reserve`, participant);
  }

  updateStatus(id: number, status: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }
}
