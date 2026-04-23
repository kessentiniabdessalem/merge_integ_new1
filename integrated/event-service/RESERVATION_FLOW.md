# 🎟️ Flux de Réservation - Diagramme Détaillé

## 📋 Vue d'ensemble

Ce document explique le flux complet de réservation d'un événement, de la demande initiale jusqu'à la génération du ticket PDF.

## 🔄 Diagramme de Flux

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARTICIPANT                                   │
│                                                                  │
│  1. Clique sur "Réserver" pour un événement                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
│                                                                  │
│  2. Appel API POST /api/reservations                            │
│     Body: { eventId: 1, participantId: 1 }                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - ReservationController                     │
│                                                                  │
│  3. Reçoit la requête                                           │
│  4. Appelle ReservationService.createReservation()              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - ReservationService                        │
│                                                                  │
│  5. VALIDATIONS                                                 │
│     ┌──────────────────────────────────────────────┐           │
│     │ ✓ Événement existe ?                         │           │
│     │ ✓ Participant existe ?                       │           │
│     │ ✓ Status = Upcoming ?                        │           │
│     │ ✓ Date >= Aujourd'hui ?                      │           │
│     │ ✓ Places disponibles ?                       │           │
│     │ ✓ Pas déjà réservé ?                         │           │
│     └──────────────────────────────────────────────┘           │
│                                                                  │
│  6. Si TOUTES les validations passent :                         │
│     ┌──────────────────────────────────────────────┐           │
│     │ • Créer Reservation                          │           │
│     │ • Générer ticketCode (TKT-XXXXXXXX)          │           │
│     │ • Incrémenter event.reservedPlaces           │           │
│     │ • Associer participant à event (M2M)         │           │
│     │ • Sauvegarder en base                        │           │
│     └──────────────────────────────────────────────┘           │
│                                                                  │
│  7. Si UNE validation échoue :                                  │
│     ┌──────────────────────────────────────────────┐           │
│     │ • Lancer ReservationException                │           │
│     │ • Message d'erreur personnalisé              │           │
│     └──────────────────────────────────────────────┘           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - GlobalExceptionHandler                    │
│                                                                  │
│  8. Intercepte les exceptions                                   │
│  9. Formate la réponse d'erreur                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - ReservationController                     │
│                                                                  │
│  10. Retourne la réponse :                                      │
│                                                                  │
│      SUCCÈS (200 OK):                                           │
│      {                                                          │
│        "id": 12,                                                │
│        "ticketCode": "TKT-A3F8B2C1",                            │
│        "reservationDate": "2026-03-02T14:30:00",                │
│        "status": "CONFIRMED",                                   │
│        "eventName": "Workshop Angular",                         │
│        "participantName": "Mohamed Salah",                      │
│        "message": "Réservation confirmée avec succès!"          │
│      }                                                          │
│                                                                  │
│      ERREUR (400 Bad Request):                                  │
│      {                                                          │
│        "timestamp": "2026-03-02T14:30:00",                      │
│        "message": "Désolé, cet événement est complet.",         │
│        "status": 400                                            │
│      }                                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
│                                                                  │
│  11. Traite la réponse                                          │
│                                                                  │
│      Si SUCCÈS:                                                 │
│      • Afficher message de succès                               │
│      • Afficher bouton "Télécharger ticket"                     │
│      • Mettre à jour l'UI (places réservées)                    │
│                                                                  │
│      Si ERREUR:                                                 │
│      • Afficher message d'erreur                                │
│      • Désactiver le bouton réserver                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARTICIPANT                                   │
│                                                                  │
│  12. Voit le résultat                                           │
│  13. Clique sur "Télécharger ticket" (si succès)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
│                                                                  │
│  14. Appel API GET /api/reservations/{id}/ticket               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - ReservationController                     │
│                                                                  │
│  15. Appelle ReservationService.generateTicketPDF()             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - ReservationService                        │
│                                                                  │
│  16. Récupère la réservation                                    │
│  17. Appelle PDFTicketService.generateTicketPDF()               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - PDFTicketService                          │
│                                                                  │
│  18. Crée le document PDF avec iText7                           │
│      ┌──────────────────────────────────────────────┐           │
│      │ • Titre "TICKET D'ÉVÉNEMENT"                 │           │
│      │ • Nom de l'événement                         │           │
│      │ • Date et lieu                               │           │
│      │ • Nom du participant                         │           │
│      │ • Code du ticket                             │           │
│      └──────────────────────────────────────────────┘           │
│                                                                  │
│  19. Appelle QRCodeService.generateQRCode()                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - QRCodeService                             │
│                                                                  │
│  20. Génère le QR code avec ZXing                               │
│      Contenu: "TICKET:TKT-XXX|EVENT:1|PARTICIPANT:1"            │
│  21. Retourne l'image PNG en bytes                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - PDFTicketService                          │
│                                                                  │
│  22. Intègre le QR code dans le PDF                             │
│  23. Ajoute le footer                                           │
│  24. Retourne le PDF en bytes                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND - ReservationController                     │
│                                                                  │
│  25. Retourne le PDF avec headers HTTP:                         │
│      Content-Type: application/pdf                              │
│      Content-Disposition: attachment; filename="ticket-12.pdf"  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
│                                                                  │
│  26. Reçoit le fichier PDF                                      │
│  27. Déclenche le téléchargement                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARTICIPANT                                   │
│                                                                  │
│  28. Télécharge le ticket PDF                                   │
│  29. Peut l'imprimer ou le présenter sur mobile                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Détails des Validations

### 1. Événement existe ?
```java
Event event = eventRepository.findById(eventId)
    .orElseThrow(() -> new ReservationException("Événement introuvable"));
```

### 2. Participant existe ?
```java
Participant participant = participantRepository.findById(participantId)
    .orElseThrow(() -> new ReservationException("Participant introuvable"));
```

### 3. Status = Upcoming ?
```java
if (event.getStatus() != EventStatus.Upcoming) {
    throw new ReservationException("Désolé, cet événement n'est plus disponible.");
}
```

### 4. Date >= Aujourd'hui ?
```java
if (event.getDate().isBefore(LocalDate.now())) {
    throw new ReservationException("Désolé, cet événement est expiré.");
}
```

### 5. Places disponibles ?
```java
if (event.getReservedPlaces() >= event.getPlacesLimit()) {
    throw new ReservationException("Désolé, cet événement est complet.");
}
```

### 6. Pas déjà réservé ?
```java
if (reservationRepository.existsByEventIdAndParticipantId(eventId, participantId)) {
    throw new ReservationException("Vous avez déjà réservé cet événement.");
}
```

## 📊 États de la Base de Données

### Avant la réservation
```
Event (id=1):
  name: "Workshop Angular"
  reservedPlaces: 50
  placesLimit: 100
  status: Upcoming
  date: 2026-04-15

Participant (id=1):
  fullName: "Mohamed Salah"
  email: "mohamed@test.com"

Reservation: (aucune pour cet event/participant)
```

### Après la réservation réussie
```
Event (id=1):
  name: "Workshop Angular"
  reservedPlaces: 51  ← Incrémenté
  placesLimit: 100
  status: Upcoming
  date: 2026-04-15

Participant (id=1):
  fullName: "Mohamed Salah"
  email: "mohamed@test.com"

Reservation (nouvelle):
  id: 12
  event_id: 1
  participant_id: 1
  ticket_code: "TKT-A3F8B2C1"  ← Généré
  reservation_date: 2026-03-02 14:30:00
  status: CONFIRMED

event_participants (nouvelle ligne):
  event_id: 1
  participant_id: 1
```

## 🎫 Contenu du Ticket PDF

```
┌─────────────────────────────────────────┐
│                                         │
│      TICKET D'ÉVÉNEMENT                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Événement: Workshop Angular            │
│  Date: 2026-04-15                       │
│  Lieu: Salle A, Bâtiment 3              │
│                                         │
│  Participant: Mohamed Salah             │
│  Email: mohamed@test.com                │
│                                         │
│  Code du ticket: TKT-A3F8B2C1           │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   [QR CODE]     │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│  Présentez ce ticket à l'entrée         │
│                                         │
└─────────────────────────────────────────┘
```

## 🔐 Contenu du QR Code

```
TICKET:TKT-A3F8B2C1|EVENT:1|PARTICIPANT:1
```

Ce QR code peut être scanné à l'entrée pour :
- Vérifier l'authenticité du ticket
- Identifier l'événement
- Identifier le participant
- Marquer la présence (attended = true)

## ⚠️ Cas d'Erreur

### Erreur 1: Événement complet
```json
{
  "timestamp": "2026-03-02T14:30:00",
  "message": "Désolé, cet événement est complet.",
  "status": 400
}
```

### Erreur 2: Événement expiré
```json
{
  "timestamp": "2026-03-02T14:30:00",
  "message": "Désolé, cet événement est expiré.",
  "status": 400
}
```

### Erreur 3: Déjà réservé
```json
{
  "timestamp": "2026-03-02T14:30:00",
  "message": "Vous avez déjà réservé cet événement.",
  "status": 400
}
```

### Erreur 4: Événement annulé
```json
{
  "timestamp": "2026-03-02T14:30:00",
  "message": "Désolé, cet événement n'est plus disponible. Status: Cancelled",
  "status": 400
}
```

## 🎯 Points Clés

1. **Atomicité** - Toutes les opérations sont dans une transaction
2. **Validation stricte** - 6 validations avant création
3. **Code unique** - Format TKT-XXXXXXXX (UUID tronqué)
4. **QR Code** - Contient toutes les infos nécessaires
5. **PDF professionnel** - Formaté avec iText7
6. **Gestion d'erreurs** - Messages personnalisés et clairs

## 🔄 Flux Alternatif: Annulation

```
Participant → DELETE /api/reservations/{id}
              ↓
ReservationService.cancelReservation()
              ↓
• Vérifier que la réservation existe
• Vérifier qu'elle n'est pas déjà annulée
• Décrémenter event.reservedPlaces
• Changer status à CANCELLED
• Sauvegarder
              ↓
Retour: "Réservation annulée avec succès"
```

---

**Note:** Ce flux garantit l'intégrité des données et une expérience utilisateur optimale.
