import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminManagementService } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-device-confirm',
  standalone: false,
  templateUrl: './device-confirm.html',
  styleUrls: ['./device-confirm.css', '../signin/signin.css']
})
export class DeviceConfirmComponent implements OnInit {

  message = 'Confirming device...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private userService: AdminManagementService,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    let token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      try {
        token = decodeURIComponent(token);
      } catch {
        // keep raw
      }
    }

    if (!token || !token.trim()) {
      this.message = 'Missing token';
      return;
    }

    this.auth.confirmDevice(token.trim()).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('email', res.email);

        const role = (res.role || '').toUpperCase();
        this.session.setUser({
          firstName: '',
          lastName: '',
          email: res.email,
          role
        });
        this.userService.getMe().subscribe({
          next: (u: any) => {
            this.session.setUser({
              firstName: u.firstName ?? '',
              lastName: u.lastName ?? '',
              email: u.email,
              avatarUrl: u.avatarUrl,
              role
            });
            this.navigateByRole(role);
          },
          error: () => this.navigateByRole(role)
        });
      },
      error: (err) => {
        const code = err?.error?.code || err?.error?.error;
        const msg = err?.error?.message;
        if (err?.status === 410 || code === 'TOKEN_EXPIRED') {
          this.message = 'Confirmation link expired. Please log in again.';
        } else if (err?.status === 409 || code === 'ALREADY_USED') {
          this.message = 'This link was already used. You can close this page.';
        } else {
          this.message = msg || 'Confirmation failed or expired';
        }
      }
    });
  }

  private navigateByRole(role: string): void {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') this.router.navigate(['/admin']);
    else if (r === 'TUTOR') this.router.navigate(['/']);
    else if (r === 'STUDENT') this.router.navigate(['/']);
    else if (r === 'CANDIDATE') this.router.navigate(['/']);
    else this.router.navigate(['/']);
  }
}
