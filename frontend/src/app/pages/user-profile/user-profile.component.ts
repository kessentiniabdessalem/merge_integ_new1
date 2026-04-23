import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { AdminManagementService, UserProfile } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';
import { WebAuthnService } from '../../services/webauthn.service';
import { SessionsService, UserSessionDto } from '../../services/sessions.service';
import { resolveAvatarUrl } from '../../utils/avatar-url.util';
import { mapUserProfileFromApi } from '../../utils/user-profile-response.util';
import { normalizeStudentRole } from '../../guards/student-preevaluation.guard';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {

  user: UserProfile = {} as UserProfile;
  loading = false;

  cacheBuster = Date.now();
  private originalEmail = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordLoading = false;
  passwordSuccess = '';
  passwordError = '';

  selectedFile: File | null = null;
  avatarPreview: string | null = null;

  passkeyLoading = false;
  passkeyMessage = '';
  passkeyError = '';

  sessions: UserSessionDto[] = [];
  sessionsLoading = false;
  sessionsError = '';

  constructor(
    private userApi: AdminManagementService,
    private router: Router,
    private session: SessionService,
    private webAuthn: WebAuthnService,
    private sessionsApi: SessionsService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadSessions();
  }

  /** Resolved avatar URL for the template (proxy /uploads en dev, gateway en prod). */
  get displayAvatar(): string | null {
    if (this.avatarPreview) return this.avatarPreview;
    return resolveAvatarUrl(this.user?.avatarUrl, this.cacheBuster);
  }

  /** Bloc préévaluation dans la colonne gauche (comme ang / client-template profile). */
  isStudent(): boolean {
    return normalizeStudentRole(this.user?.role || localStorage.getItem('role') || '') === 'STUDENT';
  }

  load(): void {
    this.loading = true;
    this.userApi.getMe().subscribe({
      next: (u) => {
        const p = mapUserProfileFromApi(u);
        this.user = { ...(p as UserProfile) };
        this.originalEmail = p.email;
        this.loading = false;
        this.avatarPreview = null;
        this.selectedFile = null;
        this.cacheBuster = Date.now();

        this.session.setUser({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          avatarUrl: p.avatarUrl,
          about: p.about,
          role: (p.role || localStorage.getItem('role') || '').toUpperCase() || undefined
        });
      },
      error: (err: unknown) => {
        this.loading = false;
        const s = this.session.getCurrentUser();
        const emailLs = localStorage.getItem('email');
        const mergedEmail = (s?.email || emailLs || '').trim();
        if (mergedEmail || s?.firstName || s?.lastName) {
          this.user = {
            id: 0,
            firstName: s?.firstName || '',
            lastName: s?.lastName || '',
            email: mergedEmail,
            avatarUrl: s?.avatarUrl,
            about: s?.about,
            role: (s?.role || localStorage.getItem('role') || undefined)?.toString().toUpperCase(),
            preevaluationFinalLevel: undefined
          };
          this.originalEmail = mergedEmail;
          console.warn('GET /api/users/me indisponible — affichage depuis la session.', err);
          return;
        }
        const httpMsg = (err as { error?: { message?: string } })?.error?.message;
        const plainMsg = err instanceof Error ? err.message : undefined;
        alert(httpMsg || plainMsg || 'Impossible de charger le profil. Reconnecte-toi.');
      }
    });
  }

  loadSessions(): void {
    this.sessionsLoading = true;
    this.sessionsError = '';

    this.sessionsApi.getMySessions().subscribe({
      next: (data) => {
        this.sessions = data || [];
        this.sessionsLoading = false;
      },
      error: (err: unknown) => {
        this.sessionsLoading = false;
        this.sessionsError = (err as { error?: { message?: string } })?.error?.message || 'Failed to load sessions';
      }
    });
  }

  save(): void {
    this.loading = true;
    this.userApi.updateMe({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      about: this.user.about
    }).subscribe({
      next: (updated) => {
        this.loading = false;
        alert('Profile updated successfully');

        if (this.originalEmail !== updated.email) {
          alert('Email changed. Please sign in again.');
          localStorage.clear();
          this.router.navigate(['/auth/login'], { queryParams: { role: 'STUDENT' } });
          return;
        }

        this.user = { ...this.user, ...updated };

        this.session.setUser({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          avatarUrl: this.user.avatarUrl,
          about: this.user.about,
          role: localStorage.getItem('role') || undefined
        });
      },
      error: (err: unknown) => {
        this.loading = false;
        const msg = (err as { error?: { message?: string } })?.error?.message;
        alert(msg || 'Update failed');
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (!this.currentPassword?.trim()) {
      this.passwordError = 'Current password is required';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'New password and confirmation do not match';
      return;
    }

    this.passwordLoading = true;
    this.userApi.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password updated successfully';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err: unknown) => {
        this.passwordLoading = false;
        this.passwordError = (err as { error?: { message?: string } })?.error?.message || 'Password change failed';
      }
    });
  }

  async enablePasskey(): Promise<void> {
    this.passkeyMessage = '';
    this.passkeyError = '';
    this.passkeyLoading = true;

    try {
      await this.webAuthn.enablePasskeyFromProfile();
      this.passkeyMessage = 'Face ID / Passkey enabled';
    } catch (e: unknown) {
      this.passkeyError = (e as Error)?.message || 'Failed to enable passkey';
    } finally {
      this.passkeyLoading = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large (max 2MB)');
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image (PNG/JPG)');
      input.value = '';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    this.userApi.uploadAvatar(this.selectedFile).subscribe({
      next: (res) => {
        this.loading = false;
        this.user.avatarUrl = res.avatarUrl;
        this.cacheBuster = Date.now();
        this.selectedFile = null;

        this.session.setUser({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          avatarUrl: this.user.avatarUrl,
          about: this.user.about,
          role: localStorage.getItem('role') || undefined
        });

        setTimeout(() => {
          this.avatarPreview = null;
        }, 300);

        alert('Photo updated successfully');
      },
      error: (err: unknown) => {
        this.loading = false;
        const msg = (err as { error?: { message?: string } })?.error?.message;
        alert(msg || 'Photo upload failed');
      }
    });
  }
}
