import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LessonDto {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  videoUrl?: string;
}

export interface ModuleDto {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  lessons: LessonDto[];
}

export interface CourseDto {
  id: number;
  title: string;
  category: string;
  level: string;
  description?: string;
  duration?: number;
  price?: number;
  teacher?: string;
  image?: string;
  thumbnail?: string;
  studentsCount?: number;
  createdAt?: string;
  modules?: ModuleDto[];
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly base = environment.courseApiBase;

  constructor(private http: HttpClient) {}

  list(): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${this.base}`);
  }

  get(id: number): Observable<CourseDto> {
    return this.http.get<CourseDto>(`${this.base}/${id}`);
  }

  getByCategory(category: string): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${this.base}/category/${category}`);
  }

  getByLevel(level: string): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${this.base}/level/${level}`);
  }

  search(keyword: string): Observable<CourseDto[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<CourseDto[]>(`${this.base}/search`, { params });
  }

  create(payload: Partial<CourseDto>): Observable<CourseDto> {
    return this.http.post<CourseDto>(`${this.base}/admin`, payload);
  }

  update(id: number, payload: Partial<CourseDto>): Observable<CourseDto> {
    return this.http.put<CourseDto>(`${this.base}/admin/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/${id}`);
  }
}
