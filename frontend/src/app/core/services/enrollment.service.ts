import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserEnrollment {
  userId: number;
  courseId: number;
  enrolledAt: Date;
  paymentId?: number;
}

/**
 * Enrollment Service - Manages user course enrollments
 * Stores enrollments in localStorage until backend integration
 */
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly ENROLLMENT_KEY = 'learnify_enrollments';
  private enrollmentsSubject = new BehaviorSubject<UserEnrollment[]>([]);
  
  enrollments$ = this.enrollmentsSubject.asObservable();

  constructor() {
    this.loadEnrollmentsFromStorage();
  }

  private loadEnrollmentsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.ENROLLMENT_KEY);
      if (stored) {
        const enrollments = JSON.parse(stored);
        this.enrollmentsSubject.next(enrollments);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  }

  private saveEnrollmentsToStorage(enrollments: UserEnrollment[]): void {
    try {
      localStorage.setItem(this.ENROLLMENT_KEY, JSON.stringify(enrollments));
      this.enrollmentsSubject.next(enrollments);
    } catch (error) {
      console.error('Error saving enrollments:', error);
    }
  }

  /**
   * Enroll user in a course after successful payment
   */
  enrollUser(userId: number, courseId: number, paymentId?: number): Observable<boolean> {
    const enrollments = this.enrollmentsSubject.value;
    
    // Check if already enrolled
    const alreadyEnrolled = enrollments.some(
      e => e.userId === userId && e.courseId === courseId
    );

    if (alreadyEnrolled) {
      console.log(`User ${userId} already enrolled in course ${courseId}`);
      return of(true);
    }

    const newEnrollment: UserEnrollment = {
      userId,
      courseId,
      enrolledAt: new Date(),
      paymentId
    };

    const updatedEnrollments = [...enrollments, newEnrollment];
    this.saveEnrollmentsToStorage(updatedEnrollments);
    
    console.log(`✅ User ${userId} enrolled in course ${courseId}`);
    return of(true);
  }

  /**
   * Enroll user in multiple courses (batch enrollment)
   */
  enrollUserInCourses(userId: number, courseIds: number[], paymentId?: number): Observable<boolean> {
    const enrollments = this.enrollmentsSubject.value;
    const newEnrollments: UserEnrollment[] = [];

    courseIds.forEach(courseId => {
      const alreadyEnrolled = enrollments.some(
        e => e.userId === userId && e.courseId === courseId
      );

      if (!alreadyEnrolled) {
        newEnrollments.push({
          userId,
          courseId,
          enrolledAt: new Date(),
          paymentId
        });
      }
    });

    if (newEnrollments.length > 0) {
      const updatedEnrollments = [...enrollments, ...newEnrollments];
      this.saveEnrollmentsToStorage(updatedEnrollments);
      console.log(`✅ User ${userId} enrolled in ${newEnrollments.length} courses`);
    }

    return of(true);
  }

  /**
   * Check if user is enrolled in a course
   */
  isEnrolled(userId: number, courseId: number): boolean {
    const enrollments = this.enrollmentsSubject.value;
    return enrollments.some(
      e => e.userId === userId && e.courseId === courseId
    );
  }

  /**
   * Get all courses user is enrolled in
   */
  getUserEnrollments(userId: number): Observable<UserEnrollment[]> {
    return this.enrollments$.pipe(
      map(enrollments => enrollments.filter(e => e.userId === userId))
    );
  }

  /**
   * Get all enrolled course IDs for a user
   */
  getUserEnrolledCourseIds(userId: number): number[] {
    const enrollments = this.enrollmentsSubject.value;
    return enrollments
      .filter(e => e.userId === userId)
      .map(e => e.courseId);
  }

  /**
   * Remove enrollment (for testing/admin purposes)
   */
  removeEnrollment(userId: number, courseId: number): Observable<boolean> {
    const enrollments = this.enrollmentsSubject.value;
    const updatedEnrollments = enrollments.filter(
      e => !(e.userId === userId && e.courseId === courseId)
    );
    this.saveEnrollmentsToStorage(updatedEnrollments);
    return of(true);
  }

  /**
   * Clear all enrollments (for testing purposes)
   */
  clearAllEnrollments(): void {
    this.saveEnrollmentsToStorage([]);
  }
}
