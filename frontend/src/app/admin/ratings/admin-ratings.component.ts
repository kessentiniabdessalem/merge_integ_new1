import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RatingService, Rating } from '../../services/rating.service';

@Component({
  selector: 'app-admin-ratings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Ratings</h1>
          <p class="page-subtitle">Tutor ratings submitted by students</p>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tutor</th>
              <th>Student</th>
              <th>Stars</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of ratings">
              <td><strong>{{ r.teacherName }}</strong></td>
              <td>{{ r.studentName }}</td>
              <td>
                <div class="stars">
                  <span *ngFor="let s of [1,2,3,4,5]" class="star" [class.filled]="s <= r.note">&#9733;</span>
                  <span class="star-num">({{ r.note }})</span>
                </div>
              </td>
              <td class="comment-cell">{{ r.commentaire }}</td>
              <td>{{ r.createdAt | date:'mediumDate' }}</td>
            </tr>
            <tr *ngIf="ratings.length === 0">
              <td colspan="5" class="empty-state">
                <i class="ti ti-star"></i>
                <p>No ratings yet</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .page-subtitle { font-size: 15px; color: var(--color-gray-500); margin: 6px 0 0; }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; } th { background: rgba(61,61,96,0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61,61,96,0.06); font-size: 14px; color: var(--color-primary); } tr:last-child td { border-bottom: none; } tr:hover td { background: rgba(61,61,96,0.02); } }
    .stars { display: flex; align-items: center; gap: 2px; }
    .star { font-size: 16px; color: #d1d5db; &.filled { color: #f59e0b; } }
    .star-num { font-size: 12px; color: var(--color-gray-500); margin-left: 4px; }
    .comment-cell { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminRatingsComponent implements OnInit {
  private ratingService = inject(RatingService);
  ratings: Rating[] = [];

  ngOnInit(): void {
    this.ratingService.getAllRatings().subscribe({
      next: (r: Rating[]) => this.ratings = r ?? [],
      error: () => this.ratings = []
    });
  }
}
