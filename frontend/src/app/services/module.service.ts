import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ModuleDto } from './course.service';

export interface ModuleRequest {
  title: string;
  description?: string;
  orderIndex?: number;
  durationMinutes?: number;
}

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private readonly base = environment.courseApiBase;

  constructor(private http: HttpClient) {}

  private modulesUrl(courseId: number): string {
    return `${this.base}/${courseId}/modules`;
  }

  list(courseId: number): Observable<ModuleDto[]> {
    return this.http.get<ModuleDto[]>(this.modulesUrl(courseId));
  }

  get(courseId: number, moduleId: number): Observable<ModuleDto> {
    return this.http.get<ModuleDto>(`${this.modulesUrl(courseId)}/${moduleId}`);
  }

  create(courseId: number, payload: ModuleRequest): Observable<ModuleDto> {
    return this.http.post<ModuleDto>(`${this.modulesUrl(courseId)}/admin`, payload);
  }

  update(courseId: number, moduleId: number, payload: ModuleRequest): Observable<ModuleDto> {
    return this.http.put<ModuleDto>(`${this.modulesUrl(courseId)}/admin/${moduleId}`, payload);
  }

  delete(courseId: number, moduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.modulesUrl(courseId)}/admin/${moduleId}`);
  }
}
