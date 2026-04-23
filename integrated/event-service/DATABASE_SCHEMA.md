# 🗄️ Schéma de Base de Données - Module Event

## 📊 Diagramme des Relations

```
┌─────────────────┐
│   Organizer     │
│─────────────────│
│ id (PK)         │
│ name            │
│ email           │
│ phone           │
└────────┬────────┘
         │
         │ 1
         │
         │ N
┌────────▼────────────────────┐
│         Event               │
│─────────────────────────────│
│ id (PK)                     │
│ name                        │
│ category (ENUM)             │
│ status (ENUM)               │
│ date                        │
│ placesLimit                 │
│ reservedPlaces              │
│ description                 │
│ location                    │
│ photoUrl                    │
│ organizerFirstName          │
│ organizerLastName           │
│ organizer_id (FK)           │
└──────┬──────────────┬───────┘
       │              │
       │ N            │ N
       │              │
       │ N            │ N
┌──────▼──────┐  ┌───▼──────────┐
│ EventLike   │  │ Reservation  │
│─────────────│  │──────────────│
│ id (PK)     │  │ id (PK)      │
│ event_id    │  │ event_id     │
│ participant │  │ participant  │
│ likedAt     │  │ ticketCode   │
└──────┬──────┘  │ reservationD │
       │         │ status       │
       │ N       └──────┬───────┘
       │                │ N
       │                │
       │ N              │ N
┌──────▼────────────────▼──────┐
│       Participant            │
│──────────────────────────────│
│ id (PK)                      │
│ fullName                     │
│ email                        │
│ attended                     │
└──────────────────────────────┘

┌────────────────────────────┐
│ event_participants         │
│ (Table de jointure M2M)    │
│────────────────────────────│
│ event_id (FK)              │
│ participant_id (FK)        │
└────────────────────────────┘
```

## 📋 Tables Détaillées

### 1. Event
```sql
CREATE TABLE event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    places_limit INT NOT NULL,
    reserved_places INT DEFAULT 0,
    description VARCHAR(1000) NOT NULL,
    location VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    organizer_first_name VARCHAR(255) NOT NULL,
    organizer_last_name VARCHAR(255) NOT NULL,
    organizer_id BIGINT,
    FOREIGN KEY (organizer_id) REFERENCES organizer(id),
    CHECK (places_limit >= 50),
    CHECK (reserved_places >= 0),
    CHECK (reserved_places <= places_limit)
);
```

**Enums:**
- `category`: WORKSHOP, WEBINAR, CONFERENCE, TRAINING, EXAM_PREPARATION, BUSINESS_ENGLISH, CULTURAL_EVENT
- `status`: Upcoming, Ongoing, Completed, Cancelled

### 2. Participant
```sql
CREATE TABLE participant (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    attended BOOLEAN DEFAULT FALSE
);
```

### 3. Organizer
```sql
CREATE TABLE organizer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50)
);
```

### 4. Reservation
```sql
CREATE TABLE reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    reservation_date DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participant(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reservation (event_id, participant_id)
);
```

**Enum:**
- `status`: CONFIRMED, CANCELLED, ATTENDED

**Index:**
- `ticket_code` (UNIQUE)
- `event_id, participant_id` (UNIQUE COMPOSITE)

### 5. EventLike
```sql
CREATE TABLE event_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    liked_at DATETIME NOT NULL,
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participant(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (event_id, participant_id)
);
```

**Index:**
- `event_id, participant_id` (UNIQUE COMPOSITE)

### 6. event_participants (Table de jointure ManyToMany)
```sql
CREATE TABLE event_participants (
    event_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    PRIMARY KEY (event_id, participant_id),
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participant(id) ON DELETE CASCADE
);
```

## 🔗 Relations

### Event ↔ Organizer
- **Type:** ManyToOne
- **Cardinalité:** N:1
- **Description:** Un événement a un organisateur, un organisateur peut organiser plusieurs événements

### Event ↔ Participant (via event_participants)
- **Type:** ManyToMany
- **Cardinalité:** N:N
- **Description:** Un événement peut avoir plusieurs participants, un participant peut assister à plusieurs événements

### Event ↔ Reservation
- **Type:** OneToMany
- **Cardinalité:** 1:N
- **Description:** Un événement peut avoir plusieurs réservations

### Participant ↔ Reservation
- **Type:** OneToMany
- **Cardinalité:** 1:N
- **Description:** Un participant peut avoir plusieurs réservations

### Event ↔ EventLike
- **Type:** OneToMany
- **Cardinalité:** 1:N
- **Description:** Un événement peut avoir plusieurs likes

### Participant ↔ EventLike
- **Type:** OneToMany
- **Cardinalité:** 1:N
- **Description:** Un participant peut liker plusieurs événements

## 📝 Contraintes d'Intégrité

### Contraintes CHECK
1. `event.places_limit >= 50` - Minimum 50 places
2. `event.reserved_places >= 0` - Pas de places négatives
3. `event.reserved_places <= places_limit` - Pas de surréservation

### Contraintes UNIQUE
1. `participant.email` - Email unique par participant
2. `organizer.email` - Email unique par organisateur
3. `reservation.ticket_code` - Code ticket unique
4. `reservation(event_id, participant_id)` - Un participant ne peut réserver qu'une fois le même événement
5. `event_like(event_id, participant_id)` - Un participant ne peut liker qu'une fois le même événement

### Contraintes FOREIGN KEY avec CASCADE
- Suppression d'un événement → supprime ses réservations et likes
- Suppression d'un participant → supprime ses réservations et likes
- Suppression d'un organisateur → les événements restent (organizer_id devient NULL)

## 🔍 Index Recommandés

```sql
-- Index pour améliorer les performances des recherches
CREATE INDEX idx_event_status ON event(status);
CREATE INDEX idx_event_category ON event(category);
CREATE INDEX idx_event_date ON event(date);
CREATE INDEX idx_reservation_status ON reservation(status);
CREATE INDEX idx_reservation_event ON reservation(event_id);
CREATE INDEX idx_reservation_participant ON reservation(participant_id);
CREATE INDEX idx_like_event ON event_like(event_id);
CREATE INDEX idx_like_participant ON event_like(participant_id);
```

## 📊 Requêtes SQL Utiles

### 1. Événements avec places disponibles
```sql
SELECT * FROM event 
WHERE status = 'Upcoming' 
  AND reserved_places < places_limit 
  AND date >= CURDATE()
ORDER BY date ASC;
```

### 2. Top 5 événements les plus réservés
```sql
SELECT id, name, category, reserved_places 
FROM event 
ORDER BY reserved_places DESC 
LIMIT 5;
```

### 3. Nombre de réservations par événement
```sql
SELECT e.name, COUNT(r.id) as total_reservations
FROM event e
LEFT JOIN reservation r ON e.id = r.event_id
WHERE r.status = 'CONFIRMED'
GROUP BY e.id, e.name
ORDER BY total_reservations DESC;
```

### 4. Événements likés par un participant
```sql
SELECT e.* 
FROM event e
INNER JOIN event_like el ON e.id = el.event_id
WHERE el.participant_id = ?;
```

### 5. Participants d'un événement
```sql
SELECT p.* 
FROM participant p
INNER JOIN event_participants ep ON p.id = ep.participant_id
WHERE ep.event_id = ?;
```

### 6. Statistiques globales
```sql
SELECT 
    (SELECT COUNT(*) FROM event) as total_events,
    (SELECT COUNT(*) FROM reservation WHERE status = 'CONFIRMED') as total_reservations,
    (SELECT COUNT(*) FROM participant) as total_participants,
    (SELECT COUNT(*) FROM event_like) as total_likes;
```

### 7. Vérifier disponibilité avant réservation
```sql
SELECT 
    e.id,
    e.name,
    e.status,
    e.date,
    e.places_limit,
    e.reserved_places,
    (e.places_limit - e.reserved_places) as available_places,
    EXISTS(
        SELECT 1 FROM reservation 
        WHERE event_id = e.id 
          AND participant_id = ? 
          AND status = 'CONFIRMED'
    ) as already_reserved
FROM event e
WHERE e.id = ?;
```

## 🎯 Données de Test

```sql
-- Organizers
INSERT INTO organizer (name, email, phone) VALUES
('Tech Academy', 'contact@techacademy.com', '+216 71 123 456'),
('Digital Learning', 'info@digitallearning.tn', '+216 71 789 012');

-- Participants
INSERT INTO participant (full_name, email, attended) VALUES
('Mohamed Salah', 'mohamed.salah@email.com', false),
('Fatma Ben Ali', 'fatma.benali@email.com', false),
('Ahmed Trabelsi', 'ahmed.trabelsi@email.com', false);

-- Events
INSERT INTO event (name, category, status, date, places_limit, reserved_places, 
                   description, location, photo_url, organizer_first_name, 
                   organizer_last_name, organizer_id) VALUES
('Workshop Angular Avancé', 'WORKSHOP', 'Upcoming', '2026-04-15', 100, 0,
 'Atelier pratique sur Angular 19 avec les dernières fonctionnalités',
 'Salle A, Bâtiment 3', '/uploads/angular.jpg', 'Ahmed', 'Mansour', 1),
 
('Webinar: Intelligence Artificielle', 'WEBINAR', 'Upcoming', '2026-04-20', 200, 0,
 'Découvrez les applications de l\'IA dans le développement web',
 'En ligne - Zoom', '/uploads/ai.jpg', 'Sarah', 'Khalil', 2),
 
('Conférence DevOps 2026', 'CONFERENCE', 'Upcoming', '2026-05-10', 150, 0,
 'Les meilleures pratiques DevOps pour 2026',
 'Centre de Conférences', '/uploads/devops.jpg', 'Karim', 'Bouaziz', 1);
```

## 🔄 Migrations

Si vous utilisez Flyway ou Liquibase, voici la structure:

```
src/main/resources/db/migration/
├── V1__create_organizer_table.sql
├── V2__create_participant_table.sql
├── V3__create_event_table.sql
├── V4__create_reservation_table.sql
├── V5__create_event_like_table.sql
├── V6__create_event_participants_table.sql
└── V7__insert_test_data.sql
```
