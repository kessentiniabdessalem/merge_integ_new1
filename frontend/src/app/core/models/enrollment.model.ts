/**
 * Enrollment domain models
 * Tracks user course enrollments after successful payment
 */

export interface Enrollment {
  id?: number;
  user_id: number;
  course_id: number;
  enrollment_date?: string;
  status: EnrollmentStatus;
  payment_id?: number;
  progress?: number;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED'
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollment?: Enrollment;
}
