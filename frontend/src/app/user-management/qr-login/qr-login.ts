import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QrAuthService, QrStartResponse } from '../../services/qr-auth.service';
import { AdminManagementService } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-qr-login',
  standalone: false,
  templateUrl: './qr-login.html',
  styleUrls: ['./qr-login.css', '../signin/signin.css']
})
export class QrLoginComponent implements OnDestroy {

  email = '';

  loading = false;
  errorMessage = '';

  sessionId: string | null = null;
  qrUrl: string | null = null;
  expiresAt: string | null = null;

  polling = false;
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;

  statusText = '';

  constructor(
    private qrAuth: QrAuthService,
    private userService: AdminManagementService,
    private session: SessionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.stopPolling();
  }

  getQrCode() {
    this.loading = true;
    this.errorMessage = '';
    this.statusText = '';
    this.sessionId = null;
    this.qrUrl = null;
    this.expiresAt = null;

    this.stopPolling();

    const space = (this.route.snapshot.queryParamMap.get('role') || 'student').toLowerCase();

    this.qrAuth.start(this.email, space).subscribe({
      next: (res: QrStartResponse) => {
        this.sessionId = res.sessionId;
        this.qrUrl = res.qrUrl;
        this.expiresAt = res.expiresAt;
        this.statusText = 'Waiting for approval on your phone...';
        this.startPolling();
      },
      error: (err) => {
        console.error('QR start error', err);
        this.errorMessage = err?.error?.message || 'Failed to start QR sign-in.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  regenerate() {
    this.getQrCode();
  }

  private startPolling() {
    if (!this.sessionId) {
      return;
    }
    this.polling = true;
    this.pollingIntervalId = setInterval(() => {
      this.checkStatus();
    }, 2000);
  }

  private stopPolling() {
    this.polling = false;
    if (this.pollingIntervalId != null) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  private checkStatus() {
    if (!this.sessionId) {
      this.stopPolling();
      return;
    }

    this.qrAuth.status(this.sessionId).subscribe({
      next: (res) => {
        if (res.status === 'PENDING') {
          return;
        }

        if (res.status === 'EXPIRED') {
          this.statusText = 'QR code expired. Please generate a new one.';
          this.stopPolling();
          return;
        }

        if (res.status === 'APPROVED') {
          if (!res.exchangeCode) {
            this.statusText = 'Approval received but exchange code is missing.';
            this.stopPolling();
            return;
          }
          this.stopPolling();
          this.exchangeAndLogin(this.sessionId!, res.exchangeCode);
        }
      },
      error: (err) => {
        console.error('QR status error', err);
        this.errorMessage = 'Failed to check QR status.';
      }
    });
  }

  private exchangeAndLogin(sessionId: string, exchangeCode: string) {
    this.statusText = 'Signing you in...';
    this.qrAuth.exchange(sessionId, exchangeCode).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', (response.role || '').toUpperCase());
        localStorage.setItem('email', response.email);

        this.userService.getMe().subscribe({
          next: (u: any) => {
            this.session.setUser({
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              avatarUrl: u.avatarUrl,
              role: (response.role || '').toUpperCase()
            });

            this.navigateByRole(response.role);
          },
          error: () => {
            this.navigateByRole(response.role);
          }
        });
      },
      error: (err) => {
        console.error('QR exchange error', err);
        this.errorMessage = err?.error?.message || 'Failed to exchange QR session.';
      }
    });
  }

  private navigateByRole(role: string) {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') this.router.navigate(['/admin']);
    else if (r === 'TUTOR') this.router.navigate(['/']);
    else if (r === 'STUDENT') this.router.navigate(['/']);
    else if (r === 'CANDIDATE') this.router.navigate(['/']);
    else this.router.navigate(['/']);
  }
}
