import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LessonDto } from './course.service';

export interface LessonRequest {
  title: string;
  description?: string;
  orderIndex?: number;
  durationMinutes?: number;
  videoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class LessonService {
  private readonly base = environment.courseApiBase;

  constructor(private http: HttpClient) {}

  private lessonsUrl(courseId: number, moduleId: number): string {
    return `${this.base}/${courseId}/modules/${moduleId}/lessons`;
  }

  list(courseId: number, moduleId: number): Observable<LessonDto[]> {
    return this.http.get<LessonDto[]>(this.lessonsUrl(courseId, moduleId));
  }

  get(courseId: number, moduleId: number, lessonId: number): Observable<LessonDto> {
    return this.http.get<LessonDto>(`${this.lessonsUrl(courseId, moduleId)}/${lessonId}`);
  }

  create(courseId: number, moduleId: number, payload: LessonRequest): Observable<LessonDto> {
    return this.http.post<LessonDto>(`${this.lessonsUrl(courseId, moduleId)}/admin`, payload);
  }

  update(courseId: number, moduleId: number, lessonId: number, payload: LessonRequest): Observable<LessonDto> {
    return this.http.put<LessonDto>(`${this.lessonsUrl(courseId, moduleId)}/admin/${lessonId}`, payload);
  }

  delete(courseId: number, moduleId: number, lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.lessonsUrl(courseId, moduleId)}/admin/${lessonId}`);
  }
}
