import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  personalEmail: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  about?: string;
  /** Niveau final synchronisé depuis le service préévaluation (GET /api/users/me). */
  preevaluationFinalLevel?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminManagementService {
  private adminUrl = `${environment.apiGatewayUrl}/api/admin`;
  private adminUsersUrl = `${environment.apiGatewayUrl}/api/admin/users`;
  private usersUrl = `${environment.apiGatewayUrl}/api/users`;
  private meUrl = `${environment.apiGatewayUrl}/api/me`;

  constructor(private http: HttpClient) {}

  // Create Admin
  createAdmin(payload: RegisterAdminRequest): Observable<any> {
    return this.http.post(`${this.adminUrl}/create-admin`, payload);
  }

  // Create Tutor
  createTutor(payload: RegisterAdminRequest): Observable<any> {
    return this.http.post(`${this.adminUrl}/create-tutor`, payload);
  }

  // Get all users (admin)
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.adminUsersUrl);
  }

  // Delete user (admin)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUsersUrl}/${id}`);
  }

  // Get current user profile
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.usersUrl}/me`);
  }

  // Get all tutors (accessible to any authenticated user)
  getTutors(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.usersUrl}/tutors`);
  }

  // Update current user profile
  updateMe(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.usersUrl}/me`, data);
  }

  // Change password
  changePassword(payload: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.usersUrl}/me/password`, payload);
  }

  // Upload avatar
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ avatarUrl: string }>(`${this.usersUrl}/me/avatar`, formData);
  }

  // Track session (for OAuth2 post-login)
  trackSession(): Observable<void> {
    return this.http.post<void>(`${this.meUrl}/sessions/track`, {});
  }
}
