import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-preevaluation-cheating-terminated',
  standalone: false,
  templateUrl: './preevaluation-cheating-terminated.component.html',
  styleUrl: './preevaluation-cheating-terminated.component.scss',
})
export class PreevaluationCheatingTerminatedComponent implements OnInit {
  message =
    'Cheating attempt detected again. Your preevaluation has been terminated.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    const m = this.route.snapshot.queryParamMap.get('m');
    if (m?.trim()) {
      this.message = decodeURIComponent(m.trim());
    }
  }

  signOut(): void {
    this.session.clear();
    this.router.navigate(['/']);
  }
}
