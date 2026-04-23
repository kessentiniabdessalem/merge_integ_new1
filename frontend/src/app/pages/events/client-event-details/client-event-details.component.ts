import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';
import { ReservationService, ReservationRequest } from '../../../services/reservation.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AiService } from '../../../ai/services/ai.service';
import { EventPredictionResponse } from '../../../ai/models/ai.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <!-- AI Prediction Banner -->
    <div *ngIf="prediction && prediction.result === 'RISQUE_ELEVE'" class="prediction-banner">
      <div class="prediction-banner-inner">
        <i class="ti ti-flame"></i>
        <span><strong>This event is filling up fast!</strong> {{ prediction.reason }}</span>
        <i class="ti ti-flame"></i>
      </div>
    </div>
    <ng-container *ngIf="event; else notFound">
      <div class="client-page">
        <div class="event-hero">
          <div class="container">
            <div class="hero-content">
              <div class="breadcrumb">
                <a routerLink="/events">Events</a>
                <i class="ti ti-chevron-right"></i>
                <span>{{ event.category }}</span>
              </div>
              <span class="event-badge" [attr.data-category]="event.category">{{ event.category }}</span>
              <h1 class="event-title">{{ event.name }}</h1>
              <div class="event-meta">
                <div class="meta-block">
                  <i class="ti ti-calendar"></i>
                  <div>
                    <span class="meta-label">Date</span>
                    <span class="meta-value">{{ event.date | date:'fullDate' }}</span>
                  </div>
                </div>
                <div class="meta-block">
                  <i class="ti ti-clock"></i>
                  <div>
                    <span class="meta-label">Status</span>
                    <span class="meta-value">{{ event.status }}</span>
                  </div>
                </div>
                <div class="meta-block" *ngIf="event.organizerFirstName || event.organizerLastName">
                  <i class="ti ti-user"></i>
                  <div>
                    <span class="meta-label">Organizer</span>
                    <span class="meta-value">{{ event.organizerFirstName }} {{ event.organizerLastName }}</span>
                  </div>
                </div>
                <div class="meta-block">
                  <i class="ti ti-map-pin"></i>
                  <div>
                    <span class="meta-label">Location</span>
                    <span class="meta-value">{{ event.location }}</span>
                  </div>
                </div>
                <div class="meta-block">
                  <i class="ti ti-users"></i>
                  <div>
                    <span class="meta-label">Places Limit</span>
                    <span class="meta-value">{{ event.placesLimit }}</span>
                  </div>
                </div>
              </div>
              <button class="btn-register-hero" (click)="reserveSpot()" [disabled]="reservationStatus === 'loading' || reservationStatus === 'success'">
                {{ reservationStatus === 'loading' ? 'Réservation...' : reservationStatus === 'success' ? '✅ Réservé' : 'Réserver' }}
              </button>
              
              <!-- Ticket Info after reservation -->
              <div *ngIf="reservationStatus === 'success' && ticketCode" class="ticket-info">
                <div class="ticket-header">
                  <i class="ti ti-ticket"></i>
                  <h3>Votre Ticket</h3>
                </div>
                <div class="ticket-code">
                  <span class="label">Code:</span>
                  <span class="code">{{ ticketCode }}</span>
                </div>
                <button class="btn-download-ticket" (click)="downloadTicket()">
                  <i class="ti ti-download"></i> Télécharger le PDF
                </button>
              </div>
            </div>
            <div class="hero-image">
              <img [src]="event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : backendUrl + event.photoUrl) : ''" [alt]="event.name">
            </div>
          </div>
        </div>
        <div class="container">
          <div class="event-content">
            <div class="content-main">
              <section class="content-section">
                <h2>About This Event</h2>
                <p class="description">{{ event.description }}</p>
                <p>Join us for an exciting event designed to help you improve your English skills. Whether you're a beginner or advanced learner, this event offers valuable opportunities for learning and networking.</p>
              </section>
              <section class="content-section">
                <h2>What You'll Experience</h2>
                <ul class="experience-list">
                  <li><i class="ti ti-microphone"></i> Interactive sessions with expert speakers</li>
                  <li><i class="ti ti-users"></i> Network with fellow English learners</li>
                  <li><i class="ti ti-certificate"></i> Receive a participation certificate</li>
                  <li><i class="ti ti-gift"></i> Access to exclusive learning materials</li>
                </ul>
              </section>
              <section class="content-section">
                <h2>Schedule</h2>
                <div class="schedule-timeline">
                  <div class="schedule-item">
                    <div class="schedule-time">09:00 AM</div>
                    <div class="schedule-content">
                      <h4>Registration & Welcome Coffee</h4>
                      <p>Check-in and networking</p>
                    </div>
                  </div>
                  <div class="schedule-item">
                    <div class="schedule-time">09:30 AM</div>
                    <div class="schedule-content">
                      <h4>Opening Session</h4>
                      <p>Introduction and event overview</p>
                    </div>
                  </div>
                  <div class="schedule-item">
                    <div class="schedule-time">10:00 AM</div>
                    <div class="schedule-content">
                      <h4>Main Program</h4>
                      <p>Interactive workshop and activities</p>
                    </div>
                  </div>
                  <div class="schedule-item">
                    <div class="schedule-time">12:00 PM</div>
                    <div class="schedule-content">
                      <h4>Lunch Break</h4>
                      <p>Networking lunch</p>
                    </div>
                  </div>
                  <div class="schedule-item">
                    <div class="schedule-time">01:00 PM</div>
                    <div class="schedule-content">
                      <h4>Closing Session</h4>
                      <p>Q&A and certificates distribution</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div class="content-sidebar">
              <div class="sidebar-card register-card">
                <div class="register-header">
                  <span class="price-free">FREE</span>
                  <span class="event-status">Limited Spots Available</span>
                </div>
                
                <ng-container *ngIf="reservationStatus === 'success'">
                  <div class="success-message">
                    <i class="ti ti-check"></i> Spot Reserved Successfully!
                  </div>
                  <div class="ticket-details" *ngIf="ticketCode">
                    <h4>Your Ticket</h4>
                    <div class="ticket-code-box">
                      <span class="code-label">Code:</span>
                      <span class="code-value">{{ ticketCode }}</span>
                    </div>
                    <button class="btn-download-pdf" (click)="downloadTicket()">
                      <i class="ti ti-file-download"></i> Download PDF Ticket
                    </button>
                  </div>
                </ng-container>
                <ng-container *ngIf="reservationStatus !== 'success'">
                  <button class="btn-register-full" (click)="reserveSpot()" [disabled]="reservationStatus === 'loading'">
                    {{ reservationStatus === 'loading' ? 'Réservation...' : 'Réserver' }}
                  </button>
                  <p class="error-message" *ngIf="reservationStatus === 'error'">Failed to reserve spot. Please try again.</p>
                </ng-container>
                
                <p class="register-note">No payment required. Secure your spot today!</p>
                <div class="share-section">
                  <span>Share this event:</span>
                  <div class="share-buttons">
                    <button class="share-btn"><i class="ti ti-brand-facebook"></i></button>
                    <button class="share-btn"><i class="ti ti-brand-twitter"></i></button>
                    <button class="share-btn"><i class="ti ti-brand-linkedin"></i></button>
                  </div>
                </div>
              </div>
              <div class="sidebar-card">
                <h3>Event Highlights</h3>
                <ul class="highlights-list">
                  <li><i class="ti ti-clock"></i> 3 hours duration</li>
                  <li><i class="ti ti-users"></i> {{ event.placesLimit }} places limit</li>
                  <li><i class="ti ti-certificate"></i> Certificate included</li>
                  <li><i class="ti ti-mood-smile"></i> All levels welcome</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
    <ng-template #notFound>
      <div class="not-found-page">
        <div class="not-found">
          <div class="container">
            <i class="ti ti-calendar"></i>
            <h2>Event Not Found</h2>
            <p>The event you're looking for doesn't exist.</p>
            <a routerLink="/events" class="btn-back">Browse Events</a>
          </div>
        </div>
      </div>
    </ng-template>
    <app-footer></app-footer>
  `,
  styles: [`
    .client-page { min-height: 100vh; background: var(--color-background); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .event-hero { background: linear-gradient(135deg, var(--color-secondary) 0%, #1a3a3a 100%); padding: 60px 0; }
    .event-hero .container { display: grid; grid-template-columns: 1fr 450px; gap: 60px; align-items: center; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; a { color: rgba(255,255,255,0.8); text-decoration: none; &:hover { color: var(--color-accent); } } span { color: rgba(255,255,255,0.8); } i { font-size: 12px; color: rgba(255,255,255,0.5); } }
    .event-badge { display: inline-block; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; &[data-category="Workshop"] { background: #3b82f6; color: #fff; } &[data-category="Competition"] { background: var(--color-cta); color: #fff; } &[data-category="Webinar"] { background: #8b5cf6; color: #fff; } &[data-category="Cultural Event"] { background: #10b981; color: #fff; } }
    .event-title { font-family: var(--font-family); font-size: 38px; font-weight: 800; color: #fff; margin: 0 0 24px; line-height: 1.2; }
    .event-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 32px; }
    .meta-block { display: flex; align-items: flex-start; gap: 12px; i { font-size: 24px; color: var(--color-accent); margin-top: 2px; } div { display: flex; flex-direction: column; } }
    .meta-label { font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; }
    .meta-value { font-size: 15px; font-weight: 600; color: #fff; }
    .btn-register-hero { padding: 16px 32px; background: var(--color-accent); color: var(--color-primary); border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; &:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 10px 30px rgba(246, 189, 96, 0.4); } &:disabled { opacity: 0.7; cursor: not-allowed; } }
    .ticket-info { margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 12px; backdrop-filter: blur(10px); }
    .ticket-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; i { font-size: 24px; color: var(--color-accent); } h3 { margin: 0; color: #fff; font-size: 18px; } }
    .ticket-code { background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; .label { color: rgba(255,255,255,0.7); font-size: 14px; } .code { color: #fff; font-weight: 700; font-size: 16px; font-family: monospace; } }
    .btn-download-ticket { width: 100%; padding: 12px; background: var(--color-accent); color: var(--color-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease; &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(246, 189, 96, 0.4); } }
    .hero-image { border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); img { width: 100%; height: 350px; object-fit: cover; } }
    .event-content { display: grid; grid-template-columns: 1fr 340px; gap: 40px; padding: 60px 0; }
    .content-section { background: var(--color-white); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: var(--shadow-card); h2 { font-size: 24px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; } p { font-size: 15px; line-height: 1.7; color: var(--color-gray-600); margin: 0 0 16px; &:last-child { margin-bottom: 0; } } }
    .description { font-size: 16px !important; }
    .experience-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; li { display: flex; align-items: center; gap: 12px; font-size: 15px; color: var(--color-gray-600); i { font-size: 22px; color: var(--color-secondary); } } }
    .schedule-timeline { display: flex; flex-direction: column; gap: 4px; }
    .schedule-item { display: flex; gap: 20px; padding: 16px; background: var(--color-background); border-radius: 12px; }
    .schedule-time { font-size: 14px; font-weight: 700; color: var(--color-secondary); min-width: 80px; }
    .schedule-content { flex: 1; h4 { font-size: 15px; font-weight: 600; color: var(--color-primary); margin: 0 0 4px; } p { font-size: 13px; color: var(--color-gray-500); margin: 0; } }
    .sidebar-card { background: var(--color-white); border-radius: 20px; padding: 28px; box-shadow: var(--shadow-card); margin-bottom: 24px; h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; } }
    .register-card { text-align: center; }
    .register-header { margin-bottom: 20px; }
    .price-free { display: block; font-size: 32px; font-weight: 800; color: #10b981; margin-bottom: 4px; }
    .event-status { font-size: 13px; color: var(--color-cta); font-weight: 600; }
    .btn-register-full { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--color-cta), #e05540); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; margin-bottom: 12px; &:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 8px 25px rgba(200,70,48,0.35); } &:disabled { opacity: 0.7; cursor: not-allowed; } }
    .success-message { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 16px; border-radius: 12px; margin-bottom: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .ticket-details { margin-top: 16px; padding: 16px; background: rgba(246, 189, 96, 0.1); border-radius: 12px; h4 { margin: 0 0 12px; font-size: 16px; color: var(--color-primary); } }
    .ticket-code-box { background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; .code-label { font-size: 13px; color: var(--color-gray-500); } .code-value { font-weight: 700; font-family: monospace; color: var(--color-primary); } }
    .btn-download-pdf { width: 100%; padding: 12px; background: var(--color-accent); color: var(--color-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease; &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(246, 189, 96, 0.3); } }
    .error-message { color: var(--color-cta); font-size: 13px; margin: 0 0 12px; }
    .register-note { font-size: 13px; color: var(--color-gray-500); margin: 0 0 20px; }
    .share-section { border-top: 1px solid rgba(61,61,96,0.08); padding-top: 20px; span { display: block; font-size: 13px; color: var(--color-gray-500); margin-bottom: 12px; } }
    .share-buttons { display: flex; gap: 10px; justify-content: center; }
    .share-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(61,61,96,0.1); background: var(--color-background); cursor: pointer; transition: all 0.2s ease; &:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); } }
    .highlights-list { list-style: none; padding: 0; margin: 0; li { display: flex; align-items: center; gap: 12px; padding: 10px 0; font-size: 14px; color: var(--color-gray-600); border-bottom: 1px solid rgba(61,61,96,0.06); &:last-child { border-bottom: none; } i { font-size: 20px; color: var(--color-secondary); } } }
    .not-found-page { min-height: 100vh; background: var(--color-background); }
    .not-found { text-align: center; padding: 100px 20px; i { font-size: 80px; color: var(--color-gray-300); margin-bottom: 24px; } h2 { font-size: 28px; color: var(--color-primary); margin: 0 0 12px; } p { color: var(--color-gray-500); margin: 0 0 24px; } }
    .btn-back { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--color-primary); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 600; }
    .prediction-banner { background: linear-gradient(90deg, #f97316, #ef4444); color: #fff; padding: 14px 24px; text-align: center; font-size: 15px; font-weight: 600; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(239,68,68,0.3); }
    .prediction-banner-inner { display: flex; align-items: center; justify-content: center; gap: 12px; max-width: 1200px; margin: 0 auto; i { font-size: 20px; } }
    @media (max-width: 992px) { .event-hero .container { grid-template-columns: 1fr; } .hero-image { display: none; } .event-content { grid-template-columns: 1fr; } .experience-list { grid-template-columns: 1fr; } }
  `]
})
export class ClientEventDetailsComponent implements OnInit {
  private eventService = inject(EventService);
  private reservationService = inject(ReservationService);
  private aiService = inject(AiService);
  private route = inject(ActivatedRoute);
  backendUrl = environment.apiBase.replace(/\/?api$/, '');
  event: Event | undefined;
  reservationStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  reservationId: number | null = null;
  ticketCode: string | null = null;
  prediction: EventPredictionResponse | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getById(+id).subscribe({
        next: (event) => {
          this.event = event;
          this.runPrediction(event);
        },
        error: () => { this.event = undefined; }
      });
    }
  }

  private runPrediction(event: Event): void {
    const placesRestantes = (event.placesLimit || 0) - (event.reservedPlaces || 0);
    this.aiService.predictEventCompletion({
      likes: 0, // likes not stored on event entity; 0 is safe
      reservations: event.reservedPlaces || 0,
      placesRestantes: Math.max(placesRestantes, 0)
    }).subscribe({
      next: (result) => this.prediction = result,
      error: () => { /* silent — prediction is non-critical */ }
    });
  }

  private getUserIdFromToken(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = payload?.userId ?? payload?.user_id ?? 0;
      return typeof id === 'number' ? id : parseInt(id, 10) || 0;
    } catch {
      return 0;
    }
  }

  reserveSpot(): void {
    if (!this.event) return;

    const userId = this.getUserIdFromToken();
    if (!userId) {
      alert('Please log in to reserve a spot.');
      return;
    }

    this.reservationStatus = 'loading';
    
    const request: ReservationRequest = {
      eventId: this.event.id,
      participantId: userId
    };

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.reservationStatus = 'success';
        this.reservationId = response.id;
        this.ticketCode = response.ticketCode;
        // Automatically download PDF
        setTimeout(() => {
          if (this.reservationId) {
            this.reservationService.downloadTicket(this.reservationId);
          }
        }, 500);
      },
      error: () => {
        this.reservationStatus = 'error';
      }
    });
  }

  downloadTicket(): void {
    if (this.reservationId) {
      this.reservationService.downloadTicket(this.reservationId);
    }
  }
}
