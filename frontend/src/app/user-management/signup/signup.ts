import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { getOrCreateDeviceId } from '../../utils/device';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup implements OnInit {

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  role: string = '';  // '' means not chosen yet — shows role picker

  loading = false;
  /** Évite deux requêtes POST si double clic / double soumission du formulaire. */
  private submitInFlight = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const r = (params['role'] || '').toString().toLowerCase();
      this.role = (r === 'student' || r === 'candidate') ? r : '';
    });
  }

  selectRole(r: 'student' | 'candidate') {
    this.role = r;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { role: r },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  clearRole() {
    this.role = '';
    this.error = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { role: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private setDeviceIdCookie(deviceId: string) {
    document.cookie = `DEVICE_ID=${encodeURIComponent(deviceId)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  onSubmit(form: { valid?: boolean | null }) {
    if (this.submitInFlight) return;
    this.error = '';

    if (form?.valid !== true) return;

    const r = (this.role || '').toLowerCase();
    if (r !== 'student' && r !== 'candidate') {
      this.error = 'Please select a role first';
      return;
    }

    if (this.password !== this.confirmPassword) return;

    const data = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.submitInFlight = true;
    this.loading = true;

    const req$ = (r === 'student')
      ? this.authService.registerStudent(data)
      : this.authService.registerCandidate(data);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.submitInFlight = false;
        this.router.navigate(['/auth/login'], { queryParams: { role: r, message: 'Account created! Please sign in.' } });
      },
      error: (err: any) => {
        this.loading = false;
        this.submitInFlight = false;
        const code = err?.error?.code;
        if (err?.status === 409 || code === 'EMAIL_EXISTS') {
          this.error = err?.error?.message
            || 'Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.';
        } else {
          this.error = err?.error?.message || 'Signup failed';
        }
        console.error('signup error', err);
      }
    });
  }

  continueWithGoogle() {
    const r = (this.role || '').toLowerCase();
    if (r !== 'student' && r !== 'candidate') return;

    const deviceId = getOrCreateDeviceId();
    this.setDeviceIdCookie(deviceId);

    window.location.href = `${environment.oauthUserServiceUrl}/oauth2/authorize/google/signup/${r.toUpperCase()}`;
  }
}
