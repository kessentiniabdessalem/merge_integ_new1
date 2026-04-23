# 📚 Documentation API - Module Event

## 🏗️ Architecture

### Entités et Relations

```
Event (1) ←→ (N) Reservation (N) ←→ (1) Participant
Event (1) ←→ (N) EventLike (N) ←→ (1) Participant
Event (N) ←→ (1) Organizer
```

### Entités créées

1. **Event** (existant, amélioré)
2. **Reservation** - Gère les réservations avec ticket unique
3. **EventLike** - Système de likes
4. **ReservationStatus** - CONFIRMED, CANCELLED, ATTENDED

---

## 🔌 Endpoints REST

### 📋 Events (CRUD + Recherche)

#### 1. Liste tous les événements
```http
GET /api/events
```

#### 2. Recherche et filtrage avec pagination
```http
GET /api/events/search?keyword=workshop&category=WORKSHOP&status=Upcoming&page=0&size=10
```

**Paramètres:**
- `keyword` (optionnel): recherche dans name et location
- `category` (optionnel): WORKSHOP, WEBINAR, CONFERENCE, TRAINING, EXAM_PREPARATION, BUSINESS_ENGLISH, CULTURAL_EVENT
- `status` (optionnel): Upcoming, Ongoing, Completed, Cancelled
- `page` (défaut: 0)
- `size` (défaut: 10)

**Réponse:**
```json
{
  "content": [...],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}
```

#### 3. Obtenir un événement
```http
GET /api/events/{id}
```

#### 4. Créer un événement (Admin)
```http
POST /api/events
Content-Type: application/json

{
  "name": "Workshop Angular",
  "category": "WORKSHOP",
  "status": "Upcoming",
  "date": "2026-04-15",
  "placesLimit": 100,
  "description": "Atelier pratique sur Angular",
  "location": "Salle A, Bâtiment 3",
  "photoUrl": "/uploads/angular.jpg",
  "organizerFirstName": "Ahmed",
  "organizerLastName": "Ben Ali"
}
```

#### 5. Modifier un événement (Admin)
```http
PUT /api/events/{id}
Content-Type: application/json
```

#### 6. Supprimer un événement (Admin)
```http
DELETE /api/events/{id}
```

#### 7. Changer le status (Admin)
```http
PATCH /api/events/{id}/status?status=Ongoing
```

#### 8. Statistiques (Admin)
```http
GET /api/events/statistics
```

**Réponse:**
```json
{
  "totalEvents": 45,
  "totalReservations": 320,
  "topReservedEvents": [
    {
      "id": 1,
      "name": "Workshop Angular",
      "reservedPlaces": 95
    }
  ]
}
```

---

### 🎟️ Réservations

#### 1. Créer une réservation
```http
POST /api/reservations
Content-Type: application/json

{
  "eventId": 1,
  "participantId": 5
}
```

**Réponse succès:**
```json
{
  "id": 12,
  "ticketCode": "TKT-A3F8B2C1",
  "reservationDate": "2026-03-02T14:30:00",
  "status": "CONFIRMED",
  "eventName": "Workshop Angular",
  "participantName": "Mohamed Salah",
  "message": "Réservation confirmée avec succès!"
}
```

**Réponse erreur:**
```json
{
  "timestamp": "2026-03-02T14:30:00",
  "message": "Désolé, cet événement est complet.",
  "status": 400
}
```

**Cas d'erreur possibles:**
- "Désolé, cet événement n'est plus disponible. Status: Cancelled"
- "Désolé, cet événement est expiré."
- "Désolé, cet événement est complet."
- "Vous avez déjà réservé cet événement."

#### 2. Télécharger le ticket PDF
```http
GET /api/reservations/{reservationId}/ticket
```

Retourne un fichier PDF avec:
- Nom de l'événement
- Date et lieu
- Nom du participant
- Code unique du ticket
- QR Code

#### 3. Réservations par événement (Admin)
```http
GET /api/reservations/event/{eventId}
```

#### 4. Réservations par participant
```http
GET /api/reservations/participant/{participantId}
```

#### 5. Annuler une réservation
```http
DELETE /api/reservations/{reservationId}
```

---

### ❤️ Likes

#### 1. Aimer un événement
```http
POST /api/events/likes/{eventId}/participant/{participantId}
```

**Réponse:** `"Événement ajouté aux favoris"`

#### 2. Ne plus aimer un événement
```http
DELETE /api/events/likes/{eventId}/participant/{participantId}
```

**Réponse:** `"Événement retiré des favoris"`

#### 3. Vérifier si un participant a aimé
```http
GET /api/events/likes/{eventId}/participant/{participantId}/status
```

**Réponse:** `true` ou `false`

#### 4. Nombre de likes
```http
GET /api/events/likes/{eventId}/count
```

**Réponse:** `42`

---

## 🔐 Logique Métier - Réservation

### Validations automatiques

Lors d'une réservation, le système vérifie:

1. ✅ **Status = Upcoming**
   - Si Cancelled, Completed ou Ongoing → Erreur

2. ✅ **Date >= Aujourd'hui**
   - Si date passée → "Événement expiré"

3. ✅ **Places disponibles**
   - Si `reservedPlaces >= placesLimit` → "Événement complet"

4. ✅ **Pas de doublon**
   - Si participant déjà inscrit → "Déjà réservé"

### Actions automatiques

Si toutes les validations passent:

1. Création de la réservation
2. Génération d'un code unique: `TKT-XXXXXXXX`
3. Incrémentation de `event.reservedPlaces`
4. Association ManyToMany (event ↔ participant)
5. Génération du QR Code
6. Ticket PDF disponible au téléchargement

---

## 📱 Frontend - Exemples Angular

### Service Event

```typescript
// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  // Recherche et filtrage
  searchEvents(keyword?: string, category?: string, status?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (keyword) params = params.set('keyword', keyword);
    if (category) params = params.set('category', category);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  getEvent(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Admin
  createEvent(event: any): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  updateEvent(id: number, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }
}
```

### Service Réservation

```typescript
// reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  createReservation(eventId: number, participantId: number): Observable<any> {
    return this.http.post(this.apiUrl, { eventId, participantId });
  }

  downloadTicket(reservationId: number): void {
    window.open(`${this.apiUrl}/${reservationId}/ticket`, '_blank');
  }

  getMyReservations(participantId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/participant/${participantId}`);
  }

  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}`);
  }
}
```

### Service Like

```typescript
// event-like.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventLikeService {
  private apiUrl = 'http://localhost:8080/api/events/likes';

  constructor(private http: HttpClient) {}

  likeEvent(eventId: number, participantId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${eventId}/participant/${participantId}`, {}, { responseType: 'text' });
  }

  unlikeEvent(eventId: number, participantId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${eventId}/participant/${participantId}`, { responseType: 'text' });
  }

  isLiked(eventId: number, participantId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${eventId}/participant/${participantId}/status`);
  }

  getLikesCount(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${eventId}/count`);
  }
}
```

### Composant Liste des Événements

```typescript
// event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { EventService } from './event.service';
import { EventLikeService } from './event-like.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html'
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  keyword = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 0;
  totalPages = 0;
  participantId = 1; // À récupérer depuis l'authentification

  categories = ['WORKSHOP', 'WEBINAR', 'CONFERENCE', 'TRAINING', 'EXAM_PREPARATION', 'BUSINESS_ENGLISH', 'CULTURAL_EVENT'];
  statuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

  constructor(
    private eventService: EventService,
    private likeService: EventLikeService
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.searchEvents(
      this.keyword || undefined,
      this.selectedCategory || undefined,
      this.selectedStatus || undefined,
      this.currentPage,
      10
    ).subscribe(response => {
      this.events = response.content;
      this.totalPages = response.totalPages;
      
      // Charger le status des likes pour chaque événement
      this.events.forEach(event => {
        this.likeService.isLiked(event.id, this.participantId).subscribe(isLiked => {
          event.isLiked = isLiked;
        });
        this.likeService.getLikesCount(event.id).subscribe(count => {
          event.likesCount = count;
        });
      });
    });
  }

  search() {
    this.currentPage = 0;
    this.loadEvents();
  }

  toggleLike(event: any) {
    if (event.isLiked) {
      this.likeService.unlikeEvent(event.id, this.participantId).subscribe(() => {
        event.isLiked = false;
        event.likesCount--;
      });
    } else {
      this.likeService.likeEvent(event.id, this.participantId).subscribe(() => {
        event.isLiked = true;
        event.likesCount++;
      });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadEvents();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadEvents();
    }
  }
}
```

### Template HTML

```html
<!-- event-list.component.html -->
<div class="container">
  <!-- Barre de recherche et filtres -->
  <div class="search-filters">
    <input 
      type="text" 
      [(ngModel)]="keyword" 
      placeholder="Rechercher par nom ou lieu..."
      (keyup.enter)="search()"
    />
    
    <select [(ngModel)]="selectedCategory" (change)="search()">
      <option value="">Toutes les catégories</option>
      <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
    </select>
    
    <select [(ngModel)]="selectedStatus" (change)="search()">
      <option value="">Tous les status</option>
      <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
    </select>
    
    <button (click)="search()">Rechercher</button>
  </div>

  <!-- Liste des événements -->
  <div class="events-grid">
    <div *ngFor="let event of events" class="event-card">
      <img [src]="event.photoUrl" alt="{{ event.name }}" />
      
      <h3>{{ event.name }}</h3>
      <p>{{ event.description }}</p>
      <p><strong>Date:</strong> {{ event.date }}</p>
      <p><strong>Lieu:</strong> {{ event.location }}</p>
      <p><strong>Places:</strong> {{ event.reservedPlaces }} / {{ event.placesLimit }}</p>
      
      <div class="actions">
        <button (click)="toggleLike(event)" [class.liked]="event.isLiked">
          {{ event.isLiked ? '❤️' : '🤍' }} {{ event.likesCount }}
        </button>
        
        <button (click)="reserveEvent(event)" [disabled]="event.status !== 'Upcoming'">
          Réserver
        </button>
      </div>
    </div>
  </div>

  <!-- Pagination -->
  <div class="pagination">
    <button (click)="previousPage()" [disabled]="currentPage === 0">Précédent</button>
    <span>Page {{ currentPage + 1 }} / {{ totalPages }}</span>
    <button (click)="nextPage()" [disabled]="currentPage >= totalPages - 1">Suivant</button>
  </div>
</div>
```

### Composant Réservation

```typescript
// event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from './event.service';
import { ReservationService } from './reservation.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  event: any;
  participantId = 1; // À récupérer depuis l'authentification
  errorMessage = '';
  successMessage = '';
  reservationId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.eventService.getEvent(id).subscribe(event => {
      this.event = event;
    });
  }

  reserveEvent() {
    this.errorMessage = '';
    this.successMessage = '';

    this.reservationService.createReservation(this.event.id, this.participantId)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.reservationId = response.id;
          this.event.reservedPlaces++;
        },
        error: (error) => {
          this.errorMessage = error.error.message || error.error;
        }
      });
  }

  downloadTicket() {
    if (this.reservationId) {
      this.reservationService.downloadTicket(this.reservationId);
    }
  }
}
```

### Template Détail

```html
<!-- event-detail.component.html -->
<div class="event-detail" *ngIf="event">
  <img [src]="event.photoUrl" alt="{{ event.name }}" />
  
  <h1>{{ event.name }}</h1>
  <p class="category">{{ event.category }}</p>
  <p class="status" [class]="event.status">{{ event.status }}</p>
  
  <div class="info">
    <p><strong>Date:</strong> {{ event.date }}</p>
    <p><strong>Lieu:</strong> {{ event.location }}</p>
    <p><strong>Places disponibles:</strong> {{ event.placesLimit - event.reservedPlaces }}</p>
    <p><strong>Organisateur:</strong> {{ event.organizerFirstName }} {{ event.organizerLastName }}</p>
  </div>
  
  <p class="description">{{ event.description }}</p>
  
  <!-- Messages -->
  <div *ngIf="errorMessage" class="alert alert-error">
    {{ errorMessage }}
  </div>
  
  <div *ngIf="successMessage" class="alert alert-success">
    {{ successMessage }}
    <button (click)="downloadTicket()">📥 Télécharger le ticket</button>
  </div>
  
  <!-- Bouton réserver -->
  <button 
    (click)="reserveEvent()" 
    [disabled]="event.status !== 'Upcoming' || event.reservedPlaces >= event.placesLimit"
    class="btn-reserve">
    Réserver maintenant
  </button>
</div>
```

### Composant Admin - Statistiques

```typescript
// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { EventService } from './event.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  statistics: any;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.eventService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });
  }
}
```

```html
<!-- admin-dashboard.component.html -->
<div class="dashboard">
  <h1>Tableau de bord Admin</h1>
  
  <div class="stats-cards">
    <div class="card">
      <h3>Total Événements</h3>
      <p class="big-number">{{ statistics?.totalEvents }}</p>
    </div>
    
    <div class="card">
      <h3>Total Réservations</h3>
      <p class="big-number">{{ statistics?.totalReservations }}</p>
    </div>
  </div>
  
  <div class="top-events">
    <h2>Événements les plus réservés</h2>
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Catégorie</th>
          <th>Réservations</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let event of statistics?.topReservedEvents">
          <td>{{ event.name }}</td>
          <td>{{ event.category }}</td>
          <td>{{ event.reservedPlaces }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 🎨 CSS Exemple

```css
/* styles.css */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.event-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.event-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button.liked {
  background-color: #ff4444;
  color: white;
}

.alert {
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 30px 0;
}

.pagination button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 🚀 Démarrage

### Backend

1. Installer les dépendances Maven
2. Configurer `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

3. Lancer l'application: `mvn spring-boot:run`

### Frontend

1. Installer Angular CLI: `npm install -g @angular/cli`
2. Créer le projet: `ng new event-frontend`
3. Installer HttpClient dans `app.module.ts`
4. Créer les services et composants
5. Lancer: `ng serve`

---

## ✅ Résumé des fonctionnalités

### Admin
- ✅ CRUD complet des événements
- ✅ Gestion du status
- ✅ Consultation des réservations par événement
- ✅ Statistiques (total events, réservations, top events)

### Participant
- ✅ Consulter les événements
- ✅ Recherche par mot-clé (name, location)
- ✅ Filtrage par category et status
- ✅ Pagination
- ✅ Like / Unlike
- ✅ Réserver un événement avec validations
- ✅ Télécharger ticket PDF avec QR code

### Système de réservation
- ✅ Vérification status = Upcoming
- ✅ Vérification date >= aujourd'hui
- ✅ Vérification places disponibles
- ✅ Génération code unique
- ✅ Génération QR code
- ✅ Export PDF du ticket
- ✅ Messages d'erreur personnalisés
