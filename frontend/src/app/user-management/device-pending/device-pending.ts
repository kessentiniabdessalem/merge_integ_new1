import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminManagementService } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-device-pending',
  standalone: false,
  templateUrl: './device-pending.html',
  styleUrls: ['./device-pending.css', '../signin/signin.css']
})
export class DevicePendingComponent implements OnInit, OnDestroy {

  token = '';
  status = 'PENDING';
  errorMessage = '';

  private sub?: Subscription;
  private readonly API = `${environment.apiGatewayUrl}/api/auth/device`;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private userService: AdminManagementService,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let t = params['token'] || '';
      try {
        if (t) t = decodeURIComponent(t);
      } catch {
        // keep raw
      }
      this.token = (t || '').trim();

      if (!this.token) {
        this.router.navigate(['/auth/login']);
        return;
      }

      this.sub = interval(2000).pipe(
        switchMap(() =>
          this.http.get<any>(`${this.API}/status`, { params: { token: this.token } }).pipe(
            catchError((err) => {
              if (err?.status === 404 || err?.status === 400) {
                return of({ status: 'EXPIRED' });
              }
              return of({ status: 'PENDING' });
            })
          )
        )
      ).subscribe({
        next: (res) => {
          this.status = res?.status || 'PENDING';

          if (this.status === 'CONFIRMED') {
            this.finalizeLogin();
          } else if (this.status === 'REJECTED') {
            this.sub?.unsubscribe();
            this.router.navigate(['/auth/login'], {
              queryParams: { message: 'Authentication rejected' }
            });
          } else if (this.status === 'EXPIRED' || this.status === 'INVALID') {
            this.sub?.unsubscribe();
            this.errorMessage = 'Confirmation link expired.';
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private finalizeLogin(): void {
    this.sub?.unsubscribe();

    this.http.get<any>(`${this.API}/session`, { params: { token: this.token } }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        const role = (res.role || '').toUpperCase();
        localStorage.setItem('role', role);
        localStorage.setItem('email', res.email);

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
      error: () => {
        this.router.navigate(['/auth/login']);
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

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
