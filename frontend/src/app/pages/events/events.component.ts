import { Component, OnInit } from '@angular/core';
import { ReservationService, ReservationRequest } from '../../services/reservation.service';
import { EventService } from '../../services/event.service';
import { Event as BackendEvent } from '../../models/event.model';
import { environment } from '../../../environments/environment';

interface DisplayEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  image: string;
  category?: string;
  status?: string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
  standalone: false,
})
export class EventsComponent implements OnInit {
  events: DisplayEvent[] = [];
  loading = true;
  error: string | null = null;
  private backendUrl = environment.apiBase.replace(/\/?api$/, '');

  reservedEvents: Set<number> = new Set();
  currentUserId = 1; // TODO: Get from auth service

  constructor(
    private reservationService: ReservationService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadMyReservations();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (backendEvents) => {
        // Transform backend events to frontend format
        this.events = backendEvents.map(event => ({
          id: event.id,
          title: event.name,
          description: event.description,
          date: event.date,
          time: '6:00 PM', // Default time since backend doesn't have it
          location: event.location,
          participants: event.reservedPlaces,
          image: event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : this.backendUrl + event.photoUrl) : 'assets/images/course-img-1.jpg',
          category: event.category.toString(),
          status: event.status.toString()
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Impossible de charger les événements';
        this.loading = false;
      }
    });
  }

  loadMyReservations() {
    this.reservationService.getMyReservations(this.currentUserId).subscribe({
      next: (reservations) => {
        reservations.forEach(reservation => {
          // Find the event by name (since we're using mock data)
          const event = this.events.find(e => e.title === reservation.eventName);
          if (event) {
            this.reservedEvents.add(event.id);
          }
        });
      },
      error: (error) => console.error('Error loading reservations:', error)
    });
  }

  joinEvent(event: DisplayEvent): void {
    if (this.reservedEvents.has(event.id)) {
      alert('Vous avez déjà réservé cet événement!');
      return;
    }

    const request: ReservationRequest = {
      eventId: event.id,
      participantId: this.currentUserId
    };

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.reservedEvents.add(event.id);
        alert(`✅ ${response.message}\nCode: ${response.ticketCode}`);
        
        // Ask if user wants to download ticket
        if (confirm('Voulez-vous télécharger votre ticket maintenant?')) {
          this.reservationService.downloadTicket(response.id);
        }
      },
      error: (error) => {
        alert(`❌ Erreur: ${error.error || 'Impossible de réserver'}`);
      }
    });
  }

  viewEvent(event: DisplayEvent): void {
    console.log('View event:', event.title);
  }

  isReserved(eventId: number): boolean {
    return this.reservedEvents.has(eventId);
  }
}
