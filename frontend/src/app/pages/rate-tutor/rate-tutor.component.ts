import { Component, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RatingService, Rating, CreateRatingRequest } from '../../services/rating.service';
import { AdminManagementService, UserProfile } from '../../services/admin-management.service';

interface TutorSummary {
  teacherId: number;
  teacherName: string;
  avgRating: number | null;
  totalRatings: number;
  ratings: Rating[];
  showRatings: boolean;
}

@Component({
  selector: 'app-rate-tutor',
  templateUrl: './rate-tutor.component.html',
  styleUrl: './rate-tutor.component.scss',
  standalone: false,
})
export class RateTutorComponent implements OnInit {
  private ratingService = inject(RatingService);
  private userService = inject(AdminManagementService);

  tutors: TutorSummary[] = [];
  loading = true;
  error = '';

  // Rating modal
  modalTutor: TutorSummary | null = null;
  stars = 5;
  hoverStar = 0;
  comment = '';
  submitting = false;
  submitError = '';
  submitSuccess = '';

  ngOnInit(): void {
    this.loadTutors();
  }

  loadTutors(): void {
    this.loading = true;
    forkJoin({
      ratings: this.ratingService.getAllRatings().pipe(catchError(() => of([] as Rating[]))),
      tutors: this.userService.getTutors().pipe(catchError(() => of([] as UserProfile[])))
    }).subscribe({
      next: ({ ratings, tutors }) => {
        this.buildTutorList(tutors, ratings);
        this.loading = false;
      },
      error: () => {
        this.tutors = [];
        this.loading = false;
      }
    });
  }

  private buildTutorList(tutors: UserProfile[], ratings: Rating[]): void {
    const map = new Map<number, TutorSummary>();

    // Seed from the actual tutors list first so they always appear
    for (const t of tutors) {
      map.set(t.id, {
        teacherId: t.id,
        teacherName: `${t.firstName} ${t.lastName}`.trim(),
        avgRating: null,
        totalRatings: 0,
        ratings: [],
        showRatings: false,
      });
    }

    // Overlay with ratings data (also handles tutors that may not be in /users/tutors yet)
    for (const r of ratings) {
      if (!map.has(r.teacherId)) {
        map.set(r.teacherId, {
          teacherId: r.teacherId,
          teacherName: r.teacherName,
          avgRating: null,
          totalRatings: 0,
          ratings: [],
          showRatings: false,
        });
      }
      const s = map.get(r.teacherId)!;
      s.ratings.push(r);
      s.totalRatings++;
    }

    // Compute averages
    for (const s of map.values()) {
      if (s.totalRatings > 0) {
        const sum = s.ratings.reduce((acc, r) => acc + r.note, 0);
        s.avgRating = Math.round((sum / s.totalRatings) * 10) / 10;
      }
    }

    this.tutors = Array.from(map.values()).sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
  }

  starArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  setStars(n: number): void { this.stars = n; }
  setHover(n: number): void { this.hoverStar = n; }
  clearHover(): void { this.hoverStar = 0; }

  openModal(tutor: TutorSummary): void {
    this.modalTutor = tutor;
    this.stars = 5;
    this.hoverStar = 0;
    this.comment = '';
    this.submitError = '';
    this.submitSuccess = '';
    this.submitting = false;
  }

  closeModal(): void {
    this.modalTutor = null;
  }

  submitRating(): void {
    if (!this.modalTutor) return;
    if (this.stars < 1 || this.stars > 5) { this.submitError = 'Please select a star rating.'; return; }
    if (!this.comment.trim()) { this.submitError = 'Please add a comment.'; return; }

    this.submitting = true;
    this.submitError = '';
    const req: CreateRatingRequest = {
      teacherId: this.modalTutor.teacherId,
      teacherName: this.modalTutor.teacherName,
      note: this.stars,
      commentaire: this.comment.trim(),
    };
    this.ratingService.createRating(req).subscribe({
      next: (newRating) => {
        this.submitSuccess = 'Rating submitted successfully!';
        this.submitting = false;
        const tutor = this.tutors.find(t => t.teacherId === this.modalTutor!.teacherId);
        if (tutor) {
          tutor.ratings.push(newRating);
          tutor.totalRatings++;
          const sum = tutor.ratings.reduce((acc, r) => acc + r.note, 0);
          tutor.avgRating = Math.round((sum / tutor.totalRatings) * 10) / 10;
        }
        setTimeout(() => this.closeModal(), 1800);
      },
      error: (err) => {
        this.submitError = err.error?.message || 'Failed to submit rating. Please try again.';
        this.submitting = false;
      },
    });
  }

  toggleRatings(tutor: TutorSummary): void {
    tutor.showRatings = !tutor.showRatings;
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
