import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css', '../signin/signin.css']
})
export class ResetPassword implements OnInit {

  email = '';
  pin = '';
  newPassword = '';
  confirmNewPassword = '';

  loading = false;
  message = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ récupère email depuis query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  reset() {
    this.message = '';
    this.error = '';

    if (!this.email || !this.pin || !this.newPassword || !this.confirmNewPassword) {
      this.error = 'Please fill all fields.';
      return;
    }

    // ✅ vérification confirm password
    if (this.newPassword !== this.confirmNewPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.resetPassword({
      email: this.email,
      pin: this.pin,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res || 'Password updated successfully.';

        // ✅ redirect to login page
        setTimeout(() => {
          this.router.navigate(['/auth/login'], { queryParams: { role: 'student' } });
        }, 700);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error || 'Reset failed.';
      }
    });
  }
}
