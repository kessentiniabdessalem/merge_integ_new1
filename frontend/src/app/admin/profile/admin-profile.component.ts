import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminManagementService, UserProfile } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';
import { SessionsService, UserSessionDto } from '../../services/sessions.service';
import { resolveAvatarUrl } from '../../utils/avatar-url.util';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss'],
})
export class AdminProfileComponent implements OnInit {

  user: UserProfile = {} as UserProfile;
  loading = false;
  cacheBuster = 0;

  sessions: UserSessionDto[] = [];
  sessionsLoading = false;

  constructor(
    private adminService: AdminManagementService,
    public session: SessionService,
    private sessionsApi: SessionsService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadSessions();
  }

  load(): void {
    this.loading = true;
    this.adminService.getMe().subscribe({
      next: (u) => {
        this.user = u;
        this.loading = false;
        this.cacheBuster = Date.now();

        this.session.setUser({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: localStorage.getItem('role') || undefined
        });
      },
      error: () => (this.loading = false)
    });
  }

  get displayAvatar(): string | null {
    return resolveAvatarUrl(this.user?.avatarUrl, this.cacheBuster);
  }

  save(): void {
    this.loading = true;
    this.adminService.updateMe({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      about: this.user.about
    }).subscribe({
      next: (u) => {
        this.user = u;
        this.loading = false;
        this.cacheBuster = Date.now();

        this.session.setUser({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: localStorage.getItem('role') || undefined
        });

        alert('Profile updated');
      },
      error: () => (this.loading = false)
    });
  }

  loadSessions(): void {
    this.sessionsLoading = true;
    this.sessionsApi.getMySessions().subscribe({
      next: (s) => {
        this.sessions = s || [];
        this.sessionsLoading = false;
      },
      error: () => (this.sessionsLoading = false)
    });
  }
}
