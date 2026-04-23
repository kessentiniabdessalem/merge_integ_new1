import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminManagementService } from '../../services/admin-management.service';
import { SessionService } from '../../services/session.service';
import { WebAuthnService } from '../../services/webauthn.service';
import { getOrCreateDeviceId } from '../../utils/device';
import { environment } from '../../../environments/environment';
import { mapUserProfileFromApi } from '../../utils/user-profile-response.util';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.html',
  styleUrls: ['./signin.css']
})
export class Signin implements OnInit {

  email = '';
  password = '';
  role: string = 'student';

  passkeyLoading = false;
  passkeyError = '';
  loginMessage = '';
  apiErrorMessage = '';

  accountLocked = false;
  unblockPinSent = false;
  unblockPin = '';
  unblockPinError = '';
  unblockPinLoading = false;
  unblockSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: AdminManagementService,
    private session: SessionService,
    private webAuthn: WebAuthnService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const r = (params['role'] || '').toString().toLowerCase();
      const allowed = ['student', 'candidate', 'admin', 'tutor'];
      this.role = allowed.includes(r) ? r : 'student';
      this.loginMessage = (params['message'] || '').toString();
    });
  }

  private setDeviceIdCookie(deviceId: string) {
    document.cookie = `DEVICE_ID=${encodeURIComponent(deviceId)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  onLogin(form?: { valid?: boolean | null }) {
    if (form != null && form.valid !== true) return;

    this.apiErrorMessage = '';

    const data: any = {
      email: this.email,
      password: this.password,
      role: (this.role || '').toUpperCase()
    };

    this.authService.login(data).subscribe({
      next: (response: any) => {
        this.afterAuthSuccess(response);
      },
      error: (error) => {
        if (error?.status === 403 && error?.error?.pending === true && error?.error?.token) {
          this.router.navigate(['/auth/device-pending'], {
            queryParams: { token: error.error.token }
          });
          return;
        }

        if (error?.status === 403 && error?.error?.code === 'DEVICE_CONFIRM_REQUIRED') {
          this.router.navigate(['/auth/device-pending']);
          return;
        }

        if (error?.status === 423 && (error?.error?.code === 'ACCOUNT_LOCKED' || error?.error?.message)) {
          this.accountLocked = true;
          this.apiErrorMessage = error?.error?.message || 'Account locked for 15 minutes.';
          return;
        }

        const msg = (error?.error?.message || '').toString();
        if (msg.includes('wrong space')) {
          this.apiErrorMessage =
            'Mauvais rôle : choisis l’onglet Admin (ou Student / Candidate / Tutor) qui correspond à ton compte.';
        } else if (msg.includes('Learnify email') && msg.includes('@learnify.com')) {
          this.apiErrorMessage =
            'Pour Admin ou Tutor, utilise une adresse se terminant par @learnify.com (ex. admin@learnify.com — vérifie l’orthographe learnify).';
        } else if (msg === 'User not found') {
          this.apiErrorMessage = 'Aucun compte avec cet e-mail.';
        } else {
          this.apiErrorMessage = msg || 'Identifiants incorrects.';
        }
      }
    });
  }

  requestUnblockPin() {
    if (!this.email?.trim()) {
      this.unblockPinError = 'Email is required';
      return;
    }
    this.unblockPinError = '';
    this.unblockPinLoading = true;
    this.authService.unblockRequest(this.email.trim()).subscribe({
      next: () => {
        this.unblockPinSent = true;
        this.unblockPin = '';
        this.unblockPinLoading = false;
      },
      error: (err) => {
        this.unblockPinError = err?.error?.message || 'Failed to send PIN';
        this.unblockPinLoading = false;
      }
    });
  }

  verifyUnblockPin() {
    if (!this.email?.trim() || !this.unblockPin?.trim()) {
      this.unblockPinError = 'Please enter the PIN received by email';
      return;
    }
    this.unblockPinError = '';
    this.unblockPinLoading = true;
    this.authService.unblockVerify(this.email.trim(), this.unblockPin.trim()).subscribe({
      next: () => {
        this.unblockSuccess = true;
        this.unblockPinLoading = false;
      },
      error: (err) => {
        this.unblockPinError = err?.error?.message || 'Invalid or expired PIN';
        this.unblockPinLoading = false;
      }
    });
  }

  resetUnblockState() {
    this.accountLocked = false;
    this.unblockPinSent = false;
    this.unblockPin = '';
    this.unblockPinError = '';
    this.unblockSuccess = false;
    this.apiErrorMessage = '';
  }

  goToQrLogin() {
    this.router.navigate(['/auth/qr-login'], { queryParamsHandling: 'merge' });
  }

  // ✅ fallback: essayer de lire le role depuis JWT si /me échoue
  private getRoleFromJwt(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload?.role || payload?.roles?.[0] || payload?.authorities?.[0] || null);
    } catch {
      return null;
    }
  }

  async loginWithPasskey() {
    this.passkeyError = '';
    this.passkeyLoading = true;

    try {
      // 1) login webauthn => token
      const token = await this.webAuthn.loginWithPasskey(this.email);

      // 2) stocker token
      localStorage.setItem('token', token);

      // 3) récupérer role via /me (meilleur)
      this.userService.getMe().subscribe({
        next: (u: any) => {
          const role = (u.role || '').toString().toUpperCase();

          localStorage.setItem('role', role);
          localStorage.setItem('email', u.email);

          this.session.setUser({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            avatarUrl: u.avatarUrl,
            role
          });

          // ✅ diriger selon role
          this.navigateByRole(role);
        },
        error: (err) => {
          console.error('getMe failed after passkey login', err);

          // 4) fallback: role depuis JWT
          const roleFromJwt = (this.getRoleFromJwt(token) || '').toUpperCase();
          if (roleFromJwt) {
            localStorage.setItem('role', roleFromJwt);
            this.navigateByRole(roleFromJwt);
            return;
          }

          this.passkeyError = 'Sign-in successful but could not retrieve your role.';
        }
      });

    } catch (e: any) {
      console.error('passkey login error', e);
      this.passkeyError = e?.message || 'Passkey sign-in failed';
    } finally {
      this.passkeyLoading = false;
    }
  }

  private afterAuthSuccess(response: any) {
    const token = response?.token;
    const role = (response?.role || '').toString().toUpperCase();
    const email = (response?.email || '').toString().trim();

    if (!token || typeof token !== 'string') {
      this.apiErrorMessage =
        'Réponse serveur invalide (jeton manquant). Vérifie que le user-service tourne sur le port prévu (ex. 8087) et réessaie.';
      console.error('login: pas de token dans la réponse', response);
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (email) {
      localStorage.setItem('email', email);
    }

    // Session tout de suite : si GET /me échoue (proxy, timing, etc.), l’utilisateur reste « connecté » pour la navbar.
    this.session.setUser({
      firstName: '',
      lastName: '',
      email,
      avatarUrl: undefined,
      role: role || undefined
    });

    this.userService.getMe().subscribe({
      next: (u: unknown) => {
        const p = mapUserProfileFromApi(u);
        const r = role || (p.role || '').toUpperCase();
        this.session.setUser({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email || email,
          avatarUrl: p.avatarUrl,
          role: r || undefined
        });
        this.navigateByRole(r);
      },
      error: (err) => {
        console.warn('GET /api/users/me après login a échoué — session minimale (email + rôle) conservée', err);
        this.navigateByRole(role);
      }
    });
  }

  private navigateByRole(role: string) {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') this.router.navigate(['/admin']);
    else if (r === 'TUTOR') this.router.navigate(['/']);
    else if (r === 'STUDENT') this.router.navigate(['/preevaluation/start']);
    else if (r === 'CANDIDATE') this.router.navigate(['/']);
    else this.router.navigate(['/']);
  }

  continueWithGoogle() {
    const r = (this.role || '').toLowerCase();
    if (r !== 'student' && r !== 'candidate') return;

    const deviceId = getOrCreateDeviceId();
    this.setDeviceIdCookie(deviceId);

    const backendRole = r.toUpperCase();
    window.location.href = `${environment.oauthUserServiceUrl}/oauth2/authorize/google/login/${backendRole}`;
  }
}