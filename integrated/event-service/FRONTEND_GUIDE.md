# 📱 Guide Frontend - Module Event

## 🏗️ Structure des Pages

### Pages Participant
1. **Liste des événements** (`/events`)
2. **Détail d'un événement** (`/events/:id`)
3. **Mes réservations** (`/my-reservations`)
4. **Mes événements favoris** (`/my-favorites`)

### Pages Admin
1. **Dashboard** (`/admin/dashboard`)
2. **Gestion des événements** (`/admin/events`)
3. **Créer un événement** (`/admin/events/new`)
4. **Modifier un événement** (`/admin/events/:id/edit`)
5. **Réservations par événement** (`/admin/events/:id/reservations`)

## 📦 Services Angular

Créer 3 services principaux:
- `event.service.ts` - Gestion des événements
- `reservation.service.ts` - Gestion des réservations
- `event-like.service.ts` - Gestion des likes

Voir API_DOCUMENTATION.md pour le code complet des services.

## 🎨 Composants Recommandés

### 1. EventCardComponent
Affiche un événement sous forme de carte avec:
- Image
- Nom, catégorie, status
- Date et lieu
- Places disponibles
- Boutons Like et Réserver

### 2. EventFiltersComponent
Barre de recherche et filtres:
- Input recherche (keyword)
- Select catégorie
- Select status
- Bouton rechercher

### 3. PaginationComponent
Navigation entre les pages:
- Bouton Précédent
- Numéro de page actuelle
- Bouton Suivant

### 4. ReservationModalComponent
Modal de confirmation de réservation:
- Affiche les détails de l'événement
- Bouton confirmer
- Gestion des erreurs
- Téléchargement du ticket après succès

### 5. StatisticsCardComponent (Admin)
Carte affichant une statistique:
- Titre
- Valeur (grand nombre)
- Icône

## 🔄 Flux Utilisateur

### Flux Réservation

```
1. Participant clique sur "Réserver"
   ↓
2. Appel API POST /api/reservations
   ↓
3a. Succès → Afficher message + bouton télécharger ticket
3b. Erreur → Afficher message d'erreur personnalisé
   ↓
4. Clic sur "Télécharger ticket"
   ↓
5. Appel API GET /api/reservations/{id}/ticket
   ↓
6. Téléchargement du PDF
```

### Flux Like/Unlike

```
1. Participant clique sur icône coeur
   ↓
2. Vérifier si déjà liké (isLiked)
   ↓
3a. Si liké → Appel DELETE (unlike)
3b. Si pas liké → Appel POST (like)
   ↓
4. Mettre à jour l'UI (icône + compteur)
```

### Flux Recherche

```
1. Utilisateur tape dans la recherche ou change un filtre
   ↓
2. Appel API GET /api/events/search avec paramètres
   ↓
3. Afficher les résultats paginés
   ↓
4. Charger les likes pour chaque événement
```

## 🎯 Gestion des Erreurs

### Messages d'erreur à gérer

```typescript
const ERROR_MESSAGES = {
  'event_full': 'Désolé, cet événement est complet.',
  'event_expired': 'Désolé, cet événement est expiré.',
  'event_cancelled': 'Désolé, cet événement est annulé.',
  'already_reserved': 'Vous avez déjà réservé cet événement.',
  'event_not_available': 'Désolé, cet événement n\'est plus disponible.'
};
```

### Exemple de gestion

```typescript
reserveEvent() {
  this.reservationService.createReservation(eventId, participantId)
    .subscribe({
      next: (response) => {
        this.showSuccess(response.message);
        this.reservationId = response.id;
      },
      error: (error) => {
        const message = error.error.message || error.error;
        this.showError(message);
      }
    });
}
```

## 🔐 Authentification (À implémenter)

Pour l'instant, le `participantId` est hardcodé. À terme:

```typescript
// auth.service.ts
export class AuthService {
  getCurrentUser(): Observable<User> {
    return this.http.get<User>('/api/auth/me');
  }
  
  getCurrentUserId(): number {
    return this.currentUser?.id || 0;
  }
}
```

Puis dans les composants:

```typescript
constructor(
  private authService: AuthService,
  private reservationService: ReservationService
) {}

ngOnInit() {
  this.participantId = this.authService.getCurrentUserId();
}
```

## 📱 Responsive Design

### Breakpoints recommandés

```css
/* Mobile */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🚀 Optimisations

### 1. Lazy Loading des images

```html
<img [src]="event.photoUrl" loading="lazy" alt="{{ event.name }}" />
```

### 2. Debounce sur la recherche

```typescript
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

searchControl = new FormControl('');

ngOnInit() {
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(keyword => {
      this.keyword = keyword;
      this.search();
    });
}
```

### 3. Cache des likes

```typescript
private likesCache = new Map<number, boolean>();

isLiked(eventId: number): Observable<boolean> {
  if (this.likesCache.has(eventId)) {
    return of(this.likesCache.get(eventId)!);
  }
  
  return this.likeService.isLiked(eventId, this.participantId)
    .pipe(tap(isLiked => this.likesCache.set(eventId, isLiked)));
}
```

## 📊 Exemple de Routing

```typescript
// app-routing.module.ts
const routes: Routes = [
  // Public
  { path: '', redirectTo: '/events', pathMatch: 'full' },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'my-reservations', component: MyReservationsComponent },
  { path: 'my-favorites', component: MyFavoritesComponent },
  
  // Admin
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'events', component: AdminEventListComponent },
      { path: 'events/new', component: AdminEventFormComponent },
      { path: 'events/:id/edit', component: AdminEventFormComponent },
      { path: 'events/:id/reservations', component: AdminReservationsComponent }
    ]
  }
];
```

## 🎨 Librairies UI Recommandées

- **Angular Material** - Composants UI
- **PrimeNG** - Composants riches
- **Tailwind CSS** - Utility-first CSS
- **Bootstrap** - Framework CSS classique

## 📦 Installation

```bash
# Créer le projet
ng new event-frontend
cd event-frontend

# Installer HttpClient (déjà inclus)
# Installer Angular Material (optionnel)
ng add @angular/material

# Générer les services
ng generate service services/event
ng generate service services/reservation
ng generate service services/event-like

# Générer les composants
ng generate component components/event-list
ng generate component components/event-detail
ng generate component components/event-card
ng generate component components/event-filters
ng generate component components/my-reservations
ng generate component components/admin-dashboard

# Lancer le serveur
ng serve
```

## 🔗 Configuration Proxy (Éviter CORS)

Créer `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Modifier `angular.json`:

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

Puis utiliser dans les services:

```typescript
private apiUrl = '/api/events'; // au lieu de http://localhost:8080/api/events
```
