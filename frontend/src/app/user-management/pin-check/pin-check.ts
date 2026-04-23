import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pin-check',
  standalone: false,
  templateUrl: './pin-check.html',
  styleUrls: ['./pin-check.css', '../signin/signin.css']
})
export class PinCheck {
  pin = '';
  error = '';
  loading = false;

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    this.error = '';

    if (!this.pin || this.pin.length < 4) {
      this.error = 'Invalid PIN (min 4 digits).';
      return;
    }

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.loading = true;

    this.http.post<any>(
      `${environment.apiGatewayUrl}/api/app-pin/verify`,
      { pin: this.pin },
      { headers }
    ).subscribe({
      next: () => {
        this.loading = false;
        localStorage.setItem('learnify_pin_ok', 'true');
        this.navigateByRole();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Wrong PIN. Please try again.';
      }
    });
  }

  private navigateByRole() {
    const role = (localStorage.getItem('role') || '').toUpperCase();
    if (role === 'ADMIN') this.router.navigate(['/admin']);
    else if (role === 'TUTOR') this.router.navigate(['/']);
    else if (role === 'STUDENT') this.router.navigate(['/']);
    else if (role === 'CANDIDATE') this.router.navigate(['/']);
    else this.router.navigate(['/']);
  }
}
