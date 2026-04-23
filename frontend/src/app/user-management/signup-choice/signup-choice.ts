import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-choice',
  standalone: false,
  templateUrl: './signup-choice.html',
  styleUrls: ['./signup-choice.css']
})
export class SignupChoice {

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  selectStudent(): void {
    this.router.navigate(['/auth/signup'], { queryParams: { role: 'student' } });
  }

  selectCandidate(): void {
    this.router.navigate(['/auth/signup'], { queryParams: { role: 'candidate' } });
  }

  goToSignIn(): void {
    this.router.navigate(['/auth/login']);
  }
}
