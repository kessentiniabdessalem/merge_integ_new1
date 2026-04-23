import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PreevaluationApiService, ProfilePayload } from '../../services/preevaluation-api.service';
import { messageFromHttpError } from '../../utils/http-error-message.util';

@Component({
  selector: 'app-preevaluation-profile',
  standalone: false,
  templateUrl: './preevaluation-profile.component.html',
  styleUrl: './preevaluation-profile.component.scss',
})
export class PreevaluationProfileComponent implements OnInit {
  studiedBefore: boolean | null = null;
  frequency: ProfilePayload['frequency'] | '' = '';
  goal: ProfilePayload['goal'] | '' = '';

  loading = false;
  error = '';

  constructor(
    private api: PreevaluationApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getStatus().subscribe({
      next: (s) => {
        if (s.terminatedForCheating === true) {
          this.router.navigate(['/preevaluation/cheating-terminated']);
        }
      },
      error: () => {},
    });
  }

  get canSubmit(): boolean {
    return (
      this.studiedBefore !== null &&
      this.frequency !== '' &&
      this.goal !== ''
    );
  }

  submit(): void {
    if (!this.canSubmit || this.studiedBefore === null) return;
    this.error = '';
    this.loading = true;
    const body: ProfilePayload = {
      studiedBefore: this.studiedBefore,
      frequency: this.frequency as ProfilePayload['frequency'],
      goal: this.goal as ProfilePayload['goal'],
    };
    this.api.saveProfile(body).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/preevaluation/test']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const base = messageFromHttpError(err);
        this.error =
          err.status === 403 && base === 'Forbidden'
            ? 'Accès refusé : compte non étudiant ou session expirée. Reconnecte-toi.'
            : base || 'Could not save profile.';
      },
    });
  }
}
