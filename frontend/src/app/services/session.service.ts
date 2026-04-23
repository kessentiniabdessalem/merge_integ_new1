import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SessionUser = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  about?: string;
  role?: string;
};

@Injectable({ providedIn: 'root' })
export class SessionService {

  private userSubject = new BehaviorSubject<SessionUser | null>(this.load());
  user$ = this.userSubject.asObservable();

  setUser(user: SessionUser) {
    this.userSubject.next(user);
    localStorage.setItem('session_user', JSON.stringify(user));
  }

  /** État courant (ex. repli si GET /me échoue). */
  getCurrentUser(): SessionUser | null {
    return this.userSubject.getValue();
  }

  clear() {
    this.userSubject.next(null);
    localStorage.removeItem('session_user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  }

  private load(): SessionUser | null {
    const raw = localStorage.getItem('session_user');
    return raw ? JSON.parse(raw) : null;
  }
}
