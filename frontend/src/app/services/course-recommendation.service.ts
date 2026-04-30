import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { PreevaluationApiService } from './preevaluation-api.service';

export interface RecommendedCourse {
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
  reason: string;
}

interface RecommendationRequest {
  cefrLevel: string;
  mainWeakness: string | null;
  secondaryWeakness: string | null;
  completedCourseIds: number[];
}

@Injectable({ providedIn: 'root' })
export class CourseRecommendationService {
  private http = inject(HttpClient);
  private preevalApi = inject(PreevaluationApiService);

  /**
   * Fetches personalised recommendations.
   * Returns [] when preevaluation is not yet completed or any call fails.
   */
  getRecommendations(completedCourseIds: number[] = []): Observable<RecommendedCourse[]> {
    return this.preevalApi.getStatus().pipe(
      switchMap(status => {
        if (!status.completed || !status.finalLevel) return of([]);
        return this.preevalApi.getResultReview().pipe(
          switchMap(review => {
            const body: RecommendationRequest = {
              cefrLevel: review.finalLevel,
              mainWeakness: review.mainWeakness ?? null,
              secondaryWeakness: review.secondaryWeakness ?? null,
              completedCourseIds
            };
            return this.http.post<RecommendedCourse[]>('/api/courses/recommendations', body);
          }),
          catchError(() => of([]))
        );
      }),
      catchError(() => of([]))
    );
  }
}
