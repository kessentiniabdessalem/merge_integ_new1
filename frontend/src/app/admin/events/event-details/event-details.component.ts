import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="crud-page">
      <ng-container *ngIf="event; else notFound">
        <div class="page-header">
          <div class="header-nav">
            <a routerLink="/admin/events" class="back-link"><i class="ti ti-arrow-left"></i> Back to Events</a>
            <h1 class="page-title">{{ event.name }}</h1>
          </div>
          <div class="header-actions">
            <a [routerLink]="['/admin/events/edit', event.id]" class="btn-admin primary"><i class="ti ti-pencil"></i> Edit</a>
          </div>
        </div>
        <div class="details-grid">
          <div class="details-main">
            <div class="detail-card">
              <div class="card-header"><h3>Event Information</h3></div>
              <div class="card-body">
                <div class="detail-row"><span class="detail-label">Category</span><span class="badge" [attr.data-category]="event.category">{{ event.category }}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">{{ event.status }}</span></div>
                <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">{{ event.date | date:'mediumDate' }}</span></div>
                <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">{{ event.location }}</span></div>
                <div class="detail-row"><span class="detail-label">Places Limit</span><span class="detail-value">{{ event.placesLimit }}</span></div>
                <div class="detail-row"><span class="detail-label">Reserved Places</span><span class="detail-value">{{ event.reservedPlaces }}</span></div>
              </div>
            </div>
            <div class="detail-card">
              <div class="card-header"><h3>Description</h3></div>
              <div class="card-body"><p class="description">{{ event.description }}</p></div>
            </div>
          </div>
          <div class="details-sidebar">
            <div class="detail-card image-card"><img [src]="event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : backendUrl + event.photoUrl) : ''" [alt]="event.name" class="event-image"></div>
          </div>
        </div>
      </ng-container>
      <ng-template #notFound>
        <div class="not-found"><i class="ti ti-calendar"></i><h2>Event Not Found</h2><p>The requested event could not be found.</p><a routerLink="/admin/events" class="btn-admin primary"><i class="ti ti-arrow-left"></i> Back to Events</a></div>
      </ng-template>
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-nav { display: flex; flex-direction: column; gap: 12px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--color-gray-500); text-decoration: none; &:hover { color: var(--color-primary); } }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; } }
    .details-grid { display: grid; grid-template-columns: 1fr 350px; gap: 24px; }
    .detail-card { background: var(--color-white); border-radius: 20px; padding: 24px; box-shadow: var(--shadow-card); margin-bottom: 24px; .card-header { margin-bottom: 16px; h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; } } }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(61, 61, 96, 0.06); &:last-child { border-bottom: none; } }
    .detail-label { font-size: 14px; color: var(--color-gray-500); }
    .detail-value { font-size: 14px; font-weight: 600; color: var(--color-primary); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(61, 61, 96, 0.08); color: var(--color-primary); &[data-category="WORKSHOP"] { background: rgba(16, 185, 129, 0.1); color: #10b981; } &[data-category="CONFERENCE"] { background: rgba(200, 70, 48, 0.1); color: var(--color-cta); } &[data-category="WEBINAR"] { background: rgba(59, 130, 246, 0.1); color: #3b82f6; } &[data-category="CULTURAL_EVENT"] { background: rgba(246, 189, 96, 0.15); color: #b8860b; } &[data-category="TRAINING"] { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; } &[data-category="EXAM_PREPARATION"] { background: rgba(245, 158, 11, 0.1); color: #d97706; } &[data-category="BUSINESS_ENGLISH"] { background: rgba(20, 184, 166, 0.1); color: #0d9488; } }
    .description { font-size: 14px; line-height: 1.7; color: var(--color-gray-600); margin: 0; }
    .image-card { padding: 0; overflow: hidden; }
    .event-image { width: 100%; height: 250px; object-fit: cover; }
    .not-found { text-align: center; padding: 80px 20px; i { font-size: 64px; color: var(--color-gray-300); margin-bottom: 24px; } h2 { font-size: 24px; color: var(--color-primary); margin: 0 0 12px; } p { color: var(--color-gray-500); margin: 0 0 24px; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 992px) { .details-grid { grid-template-columns: 1fr; } }
  `]
})
export class EventDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  backendUrl = environment.apiBase.replace(/\/?api$/, '');
  event: Event | undefined;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getById(+id).subscribe({
        next: (event) => this.event = event,
        error: () => { this.event = undefined; }
      });
    }
  }
}
