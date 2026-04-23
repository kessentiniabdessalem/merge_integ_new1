import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminManagementService } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';
import { QrAuthService } from '../../services/qr-auth.service';
import { mapUserProfileFromApi } from '../../utils/user-profile-response.util';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  templateUrl: './oauth2-redirect.html',
  styleUrls: ['./oauth2-redirect.css', '../signin/signin.css']
})
export class Oauth2Redirect implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AdminManagementService,
    private session: SessionService,
    private qrAuth: QrAuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const error = params['error'];
      if (error) {
        const role = (params['role'] || '').toString().toLowerCase();

        if (error === 'account_exists') {
          alert('Ce compte existe déjà. Connecte-toi avec Google (Connexion), pas avec Inscription.');
          this.router.navigate(['/auth/login'], { queryParams: { role: role || 'student' }, replaceUrl: true });
          return;
        }

        if (error === 'account_not_found') {
          alert('Aucun compte avec cet e-mail. Inscris-toi avec Google depuis la page Inscription.');
          this.router.navigate(['/auth/signup'], { queryParams: { role: role || 'student' }, replaceUrl: true });
          return;
        }

        alert('Erreur Google : ' + error);
        this.router.navigate(['/auth/login'], { queryParams: { role: 'student' }, replaceUrl: true });
        return;
      }

      const pending = params['pending'];
      if (pending === 'true') {
        const pendingToken = params['token'] || '';
        if (!pendingToken) {
          this.router.navigate(['/auth/device-pending'], { replaceUrl: true });
          return;
        }
        this.router.navigate(['/auth/device-pending'], {
          queryParams: { token: pendingToken },
          replaceUrl: true
        });
        return;
      }

      const token = params['token'];
      if (!token) {
        this.router.navigate(['/auth/login'], { queryParams: { role: 'student' }, replaceUrl: true });
        return;
      }

      localStorage.setItem('token', token);

      const role = (this.getRoleFromJwt(token) || '').toUpperCase();
      localStorage.setItem('role', role);

      this.userService.getMe().subscribe({
        next: (u: unknown) => {
          const p = mapUserProfileFromApi(u);
          localStorage.setItem('email', p.email);

          this.session.setUser({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            avatarUrl: p.avatarUrl,
            role
          });

          this.handlePostLogin(role);
        },
        error: (err) => {
          console.error('getMe après OAuth2 a échoué', err);
          const claims = this.parseJwtPayload(token);
          const sub = claims?.['sub'];
          const emailFromJwt = typeof sub === 'string' ? sub : '';
          const roleClaim = claims?.['role'];
          const roleFromJwt = (
            (typeof roleClaim === 'string' ? roleClaim : '') ||
            role ||
            ''
          ).toUpperCase();
          if (emailFromJwt) {
            localStorage.setItem('email', emailFromJwt);
          }
          if (emailFromJwt && roleFromJwt) {
            localStorage.setItem('role', roleFromJwt);
            this.session.setUser({
              firstName: '',
              lastName: '',
              email: emailFromJwt,
              avatarUrl: undefined,
              role: roleFromJwt
            });
          }
          this.handlePostLogin(roleFromJwt || role);
        }
      });
    });
  }

  private parseJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }

  private getRoleFromJwt(token: string): string | null {
    const p = this.parseJwtPayload(token);
    const r = p?.['role'];
    return typeof r === 'string' ? r : null;
  }

  private navigateByRole(role: string) {
    const r = (role || '').toUpperCase();
    const opts = { replaceUrl: true };

    if (r === 'ADMIN') this.router.navigate(['/admin'], opts);
    else if (r === 'TUTOR') this.router.navigate(['/'], opts);
    else if (r === 'STUDENT') this.router.navigate(['/preevaluation/start'], opts);
    else if (r === 'CANDIDATE') this.router.navigate(['/'], opts);
    else this.router.navigate(['/'], opts);
  }

  private handlePostLogin(role: string) {
    const qrToken = localStorage.getItem('qr_approve_token');
    if (!qrToken) {
      this.navigateByRole(role);
      return;
    }

    this.qrAuth.approve(qrToken).subscribe({
      next: () => {
        localStorage.removeItem('qr_approve_token');
        this.router.navigate(['/auth/qr-approve'], {
          queryParams: { approved: 'true' },
          replaceUrl: true
        });
      },
      error: (err) => {
        console.error('QR approve error', err);
        localStorage.removeItem('qr_approve_token');
        this.navigateByRole(role);
      }
    });
  }
}
