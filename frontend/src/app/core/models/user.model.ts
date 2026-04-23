/**
 * User domain models
 * These models represent the data structure for the User microservice
 */

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedDate?: string;
  profileImage?: string;
  phoneNumber?: string;
  address?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
