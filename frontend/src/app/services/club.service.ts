import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';
import { Observable } from 'rxjs';
import { Club, ClubCreate, ClubUpdate } from '../models/club.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
  constructor(private api: ApiBaseService) {}

  /** GET /api/clubs - list all clubs */
  getAll(): Observable<Club[]> {
    return this.api.get<Club[]>('/clubs');
  }

  /** GET /api/clubs/:id - get one club by id */
  getById(id: number): Observable<Club> {
    return this.api.get<Club>(`/clubs/${id}`);
  }

  /** POST /api/clubs - create club */
  create(payload: ClubCreate): Observable<Club> {
    return this.api.post<ClubCreate, Club>('/clubs', payload);
  }

  /** PUT /api/clubs/:id - update club */
  update(id: number, payload: ClubUpdate): Observable<Club> {
    return this.api.put<ClubUpdate, Club>(`/clubs/${id}`, payload);
  }

  /** DELETE /api/clubs/:id - delete club */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/clubs/${id}`);
  }
}
