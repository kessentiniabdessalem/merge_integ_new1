import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreevaluationApiService } from '../../services/preevaluation-api.service';

@Component({
  selector: 'app-preevaluation-intro',
  standalone: false,
  templateUrl: './preevaluation-intro.component.html',
  styleUrl: './preevaluation-intro.component.scss',
})
export class PreevaluationIntroComponent implements OnInit {
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

  start(): void {
    this.error = '';
    this.loading = true;
    this.api.getStatus().subscribe({
      next: (s) => {
        this.loading = false;
        if (s.terminatedForCheating === true) {
          this.router.navigate(['/preevaluation/cheating-terminated']);
          return;
        }
        if (s.completed) {
          this.router.navigate(['/']);
          return;
        }
        if (s.profileCompleted) {
          this.router.navigate(['/preevaluation/test']);
        } else {
          this.router.navigate(['/preevaluation/profile']);
        }
      },
      error: () => {
        this.loading = false;
        /* Si le service est indisponible, on envoie quand même vers le questionnaire (comme un démarrage manuel). */
        this.router.navigate(['/preevaluation/profile']);
      },
    });
  }
}
