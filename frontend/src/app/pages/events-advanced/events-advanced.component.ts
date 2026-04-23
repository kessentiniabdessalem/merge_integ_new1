import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { ReservationService, ReservationRequest } from '../../services/reservation.service';
import { EventLikeService } from '../../services/event-like.service';
import { Event } from '../../models/event.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-events-advanced',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="events-page">
      <div class="page-header">
        <h1>🎉 Événements</h1>
        <p>Découvrez et réservez vos événements</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement des événements...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="error">
        <p>❌ {{ error }}</p>
      </div>

      <!-- Events Grid -->
      <div *ngIf="!loading && !error" class="events-grid">
        <div *ngFor="let event of events" class="event-card">
          <div class="event-image">
            <img [src]="getImageUrl(event.photoUrl)" [alt]="event.name">
            <span class="event-category">{{ event.category }}</span>
          </div>
          
          <div class="event-content">
            <h3>{{ event.name }}</h3>
            <p class="event-description">{{ event.description }}</p>
            
            <div class="event-meta">
              <span>📅 {{ event.date }}</span>
              <span>📍 {{ event.location }}</span>
              <span>👥 {{ event.reservedPlaces }}/{{ event.placesLimit }}</span>
            </div>

            <div class="event-actions">
              <!-- Like Button -->
              <button 
                class="btn-like" 
                [class.liked]="isLiked(event.id)"
                (click)="toggleLike(event.id)"
                [disabled]="likingEvents.has(event.id)">
                {{ isLiked(event.id) ? '❤️' : '🤍' }}
                <span>{{ getLikeCount(event.id) }}</span>
              </button>

              <!-- Reserve Button -->
              <button 
                class="btn-reserve"
                [class.reserved]="isReserved(event.id)"
                (click)="reserve(event)"
                [disabled]="isReserved(event.id) || reservingEvents.has(event.id)">
                {{ isReserved(event.id) ? '✅ Réservé' : '🎫 Réserver' }}
              </button>
            </div>

            <!-- Download PDF if reserved -->
            <div *ngIf="getReservationId(event.id)" class="download-section">
              <button class="btn-download" (click)="downloadPDF(getReservationId(event.id)!)">
                📄 Télécharger le Ticket PDF
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="events.length === 0" class="no-events">
          <p>Aucun événement disponible pour le moment.</p>
        </div>
      </div>

      <!-- Scanner Section -->
      <div class="scanner-section">
        <h2>🔍 Scanner un Ticket</h2>
        <div class="scanner-form">
          <input 
            type="text" 
            [(ngModel)]="ticketCode" 
            placeholder="Entrez le code du ticket (ex: TKT-ABC12345)"
            class="ticket-input">
          <button class="btn-scan" (click)="scanTicket()" [disabled]="!ticketCode || scanning">
            {{ scanning ? 'Validation...' : '✓ Valider' }}
          </button>
        </div>

        <div *ngIf="scanResult" class="scan-result" [class.valid]="scanResult.valid" [class.invalid]="!scanResult.valid">
          <h3>{{ scanResult.message }}</h3>
          <div *ngIf="scanResult.valid" class="ticket-details">
            <p><strong>Événement:</strong> {{ scanResult.eventName }}</p>
            <p><strong>Participant:</strong> {{ scanResult.participantName }}</p>
            <p><strong>Date:</strong> {{ scanResult.eventDate }}</p>
            <p><strong>Lieu:</strong> {{ scanResult.eventLocation }}</p>
            <p><strong>Statut:</strong> {{ scanResult.status }}</p>
          </div>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="stats-section">
        <h2>📊 Statistiques</h2>
        <div *ngIf="stats" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ stats.totalEvents }}</div>
            <div class="stat-label">Événements</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎟️</div>
            <div class="stat-value">{{ stats.totalReservations }}</div>
            <div class="stat-label">Réservations</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ stats.totalParticipants }}</div>
            <div class="stat-label">Participants</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .events-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .page-header { text-align: center; margin-bottom: 40px; h1 { font-size: 36px; margin: 0 0 10px; } p { color: #666; } }
    .loading, .error { text-align: center; padding: 40px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; margin-bottom: 60px; }
    .event-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.3s; &:hover { transform: translateY(-5px); } }
    .event-image { position: relative; height: 200px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
    .event-category { position: absolute; top: 10px; right: 10px; background: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .event-content { padding: 20px; h3 { margin: 0 0 10px; font-size: 20px; } }
    .event-description { color: #666; font-size: 14px; margin: 0 0 15px; line-height: 1.5; }
    .event-meta { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; span { font-size: 13px; color: #888; } }
    .event-actions { display: flex; gap: 10px; margin-bottom: 15px; }
    .btn-like { flex: 0 0 auto; padding: 10px 20px; border: 2px solid #e74c3c; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s; display: flex; align-items: center; gap: 5px; &.liked { background: #e74c3c; color: white; } &:hover:not(:disabled) { transform: scale(1.05); } &:disabled { opacity: 0.5; cursor: not-allowed; } }
    .btn-reserve { flex: 1; padding: 12px; border: none; background: #27ae60; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; &.reserved { background: #95a5a6; } &:hover:not(:disabled) { background: #229954; } &:disabled { opacity: 0.7; cursor: not-allowed; } }
    .download-section { margin-top: 10px; }
    .btn-download { width: 100%; padding: 10px; border: 2px solid #3498db; background: white; color: #3498db; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; &:hover { background: #3498db; color: white; } }
    .scanner-section, .stats-section { background: white; border-radius: 16px; padding: 30px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); h2 { margin: 0 0 20px; font-size: 24px; } }
    .scanner-form { display: flex; gap: 10px; margin-bottom: 20px; }
    .ticket-input { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; &:focus { outline: none; border-color: #3498db; } }
    .btn-scan { padding: 12px 30px; border: none; background: #3498db; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; &:hover:not(:disabled) { background: #2980b9; } &:disabled { opacity: 0.7; cursor: not-allowed; } }
    .scan-result { padding: 20px; border-radius: 8px; margin-top: 20px; &.valid { background: #d4edda; border: 2px solid #28a745; h3 { color: #155724; } } &.invalid { background: #f8d7da; border: 2px solid #dc3545; h3 { color: #721c24; } } h3 { margin: 0 0 15px; } }
    .ticket-details { p { margin: 8px 0; font-size: 14px; strong { font-weight: 600; } } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat-card { text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; }
    .stat-icon { font-size: 40px; margin-bottom: 10px; }
    .stat-value { font-size: 36px; font-weight: 700; margin-bottom: 5px; }
    .stat-label { font-size: 14px; opacity: 0.9; }
    .no-events { text-align: center; padding: 60px 20px; color: #999; }
  `]
})
export class EventsAdvancedComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  
  // Likes
  likedEvents = new Set<number>();
  likeCounts = new Map<number, number>();
  likingEvents = new Set<number>();
  
  // Reservations
  reservedEvents = new Map<number, number>(); // eventId -> reservationId
  reservingEvents = new Set<number>();
  
  // Scanner
  ticketCode = '';
  scanning = false;
  scanResult: any = null;
  
  // Stats
  stats: any = null;
  
  currentUserId = 1; // TODO: Get from auth service
  backendUrl = environment.apiBase.replace(/\/api$/, '');

  constructor(
    private eventService: EventService,
    private reservationService: ReservationService,
    private likeService: EventLikeService
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadStatistics();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
        // Load likes for each event
        events.forEach(event => {
          this.loadLikeStatus(event.id);
          this.loadLikeCount(event.id);
        });
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Impossible de charger les événements';
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.stats = {
          totalEvents: events.length,
          totalReservations: this.reservedEvents.size,
          totalParticipants: this.currentUserId
        };
      }
    });
  }

  getImageUrl(photoUrl: string): string {
    if (!photoUrl) return 'assets/images/default-event.jpg';
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${this.backendUrl}${photoUrl}`;
  }

  // Likes
  loadLikeStatus(eventId: number) {
    this.likeService.isLiked(eventId, this.currentUserId).subscribe({
      next: (liked) => {
        if (liked) this.likedEvents.add(eventId);
      }
    });
  }

  loadLikeCount(eventId: number) {
    this.likeService.getLikesCount(eventId).subscribe({
      next: (count) => this.likeCounts.set(eventId, count)
    });
  }

  isLiked(eventId: number): boolean {
    return this.likedEvents.has(eventId);
  }

  getLikeCount(eventId: number): number {
    return this.likeCounts.get(eventId) || 0;
  }

  toggleLike(eventId: number) {
    this.likingEvents.add(eventId);
    const isLiked = this.isLiked(eventId);
    
    const action = isLiked 
      ? this.likeService.unlikeEvent(eventId, this.currentUserId)
      : this.likeService.likeEvent(eventId, this.currentUserId);

    action.subscribe({
      next: () => {
        if (isLiked) {
          this.likedEvents.delete(eventId);
          this.likeCounts.set(eventId, this.getLikeCount(eventId) - 1);
        } else {
          this.likedEvents.add(eventId);
          this.likeCounts.set(eventId, this.getLikeCount(eventId) + 1);
        }
        this.likingEvents.delete(eventId);
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.likingEvents.delete(eventId);
      }
    });
  }

  // Reservations
  isReserved(eventId: number): boolean {
    return this.reservedEvents.has(eventId);
  }

  getReservationId(eventId: number): number | undefined {
    return this.reservedEvents.get(eventId);
  }

  reserve(event: Event) {
    this.reservingEvents.add(event.id);
    
    const request: ReservationRequest = {
      eventId: event.id,
      participantId: this.currentUserId
    };

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.reservedEvents.set(event.id, response.id);
        this.reservingEvents.delete(event.id);
        alert(`✅ Réservation confirmée!\nCode: ${response.ticketCode}\n\nVous pouvez maintenant télécharger votre ticket PDF.`);
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        alert(`❌ Erreur: ${error.error || 'Impossible de réserver'}`);
        this.reservingEvents.delete(event.id);
      }
    });
  }

  downloadPDF(reservationId: number) {
    this.reservationService.downloadTicket(reservationId);
  }

  // Scanner
  scanTicket() {
    if (!this.ticketCode) return;
    
    this.scanning = true;
    this.scanResult = null;

    // Import TicketValidationService
    import('../../services/ticket-validation.service').then(module => {
      const service = new module.TicketValidationService(
        this.reservationService['http']
      );
      
      service.validateTicket(this.ticketCode).subscribe({
        next: (result) => {
          this.scanResult = result;
          this.scanning = false;
        },
        error: (error) => {
          console.error('Error validating ticket:', error);
          this.scanResult = {
            valid: false,
            message: 'Erreur lors de la validation du ticket'
          };
          this.scanning = false;
        }
      });
    });
  }
}
