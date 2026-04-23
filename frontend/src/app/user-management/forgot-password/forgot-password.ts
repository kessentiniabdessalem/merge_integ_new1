import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css', '../signin/signin.css']
})
export class ForgotPassword {

  email = '';
  loading = false;
  message = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  sendPin() {
    this.message = '';
    this.error = '';

    if (!this.email) {
      this.error = 'Please enter your email.';
      return;
    }

    this.loading = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res || 'PIN sent to your email.';

        // ✅ redirect to reset page (email prefilled)
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.email }
          });
        }, 500);
      },
      error: (err: unknown) => {
        this.loading = false;
        const http = err as HttpErrorResponse;
        if (http?.status === 0) {
          this.error =
            'Cannot reach the server. Start user-service on port 8087 (or fix the dev proxy).';
          return;
        }
        const body = http?.error;
        if (typeof body === 'string' && body.trim()) {
          this.error = body;
          return;
        }
        if (body && typeof body === 'object' && 'message' in body && String((body as { message: string }).message)) {
          this.error = String((body as { message: string }).message);
          return;
        }
        this.error = http?.message?.trim() || 'Failed to send PIN.';
      }
    });
  }
}
