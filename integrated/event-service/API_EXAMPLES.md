# 📚 Exemples d'API - Module Event

## Table des matières
1. [Statistiques Dashboard](#statistiques-dashboard)
2. [Like/Unlike](#likeunlike)
3. [Réservations](#réservations)
4. [Validation Ticket](#validation-ticket)
5. [CRUD Events](#crud-events)

---

## Statistiques Dashboard

### Request
```http
GET /api/events/statistics HTTP/1.1
Host: localhost:8080
```

### Response
```json
{
  "totalEvents": 25,
  "totalReservations": 150,
  "totalParticipants": 120,
  "topReservedEvents": [
    {
      "id": 1,
      "name": "Workshop Spring Boot Avancé",
      "category": "WORKSHOP",
      "status": "UPCOMING",
      "date": "2026-03-15",
      "placesLimit": 100,
      "reservedPlaces": 85,
      "description": "Apprenez Spring Boot de A à Z",
      "location": "Tunis, Tunisia",
      "photoUrl": "/uploads/1709414966123_workshop.png",
      "organizerFirstName": "Ahmed",
      "organizerLastName": "Ben Ali"
    },
    {
      "id": 2,
      "name": "Webinar React & TypeScript",
      "category": "WEBINAR",
      "status": "UPCOMING",
      "date": "2026-03-20",
      "placesLimit": 200,
      "reservedPlaces": 78,
      "description": "Maîtrisez React avec TypeScript",
      "location": "Online",
      "photoUrl": "/uploads/default-event.jpg",
      "organizerFirstName": "Sara",
      "organizerLastName": "Mansour"
    }
  ],
  "eventsByCategory": {
    "WORKSHOP": 10,
    "WEBINAR": 8,
    "CONFERENCE": 5,
    "TRAINING": 2,
    "EXAM_PREPARATION": 0,
    "BUSINESS_ENGLISH": 0,
    "CULTURAL_EVENT": 0
  }
}
```

### Utilisation pour Charts
```javascript
// Pie Chart - Répartition par catégorie
const chartData = {
  labels: Object.keys(stats.eventsByCategory),
  datasets: [{
    data: Object.values(stats.eventsByCategory),
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
  }]
};

// Cards - Statistiques principales
<div class="stats-card">
  <h3>{stats.totalEvents}</h3>
  <p>Total Events</p>
</div>
<div class="stats-card">
  <h3>{stats.totalReservations}</h3>
  <p>Total Reservations</p>
</div>
<div class="stats-card">
  <h3>{stats.totalParticipants}</h3>
  <p>Total Participants</p>
</div>
```

---

## Like/Unlike

### 1. Aimer un événement

#### Request
```http
POST /api/events/likes/1/participant/5 HTTP/1.1
Host: localhost:8080
```

#### Response Success
```json
"Événement ajouté aux favoris"
```

#### Response Already Liked
```json
"Vous avez déjà aimé cet événement"
```

### 2. Ne plus aimer

#### Request
```http
DELETE /api/events/likes/1/participant/5 HTTP/1.1
Host: localhost:8080
```

#### Response Success
```json
"Événement retiré des favoris"
```

#### Response Not Liked
```json
"Vous n'avez pas aimé cet événement"
```

### 3. Vérifier le status

#### Request
```http
GET /api/events/likes/1/participant/5/status HTTP/1.1
Host: localhost:8080
```

#### Response
```json
true
```

### 4. Compter les likes

#### Request
```http
GET /api/events/likes/1/count HTTP/1.1
Host: localhost:8080
```

#### Response
```json
42
```

### Frontend Implementation
```javascript
class EventLikeManager {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async toggleLike(eventId, participantId, isLiked) {
    const method = isLiked ? 'DELETE' : 'POST';
    const url = `${this.baseUrl}/api/events/likes/${eventId}/participant/${participantId}`;
    
    const response = await fetch(url, { method });
    const message = await response.text();
    
    // Update UI
    const count = await this.getLikesCount(eventId);
    return { message, count };
  }

  async getLikesCount(eventId) {
    const response = await fetch(`${this.baseUrl}/api/events/likes/${eventId}/count`);
    return await response.json();
  }

  async checkLikeStatus(eventId, participantId) {
    const response = await fetch(
      `${this.baseUrl}/api/events/likes/${eventId}/participant/${participantId}/status`
    );
    return await response.json();
  }
}

// Usage
const likeManager = new EventLikeManager('http://localhost:8080/back');
const result = await likeManager.toggleLike(1, 5, false);
console.log(result.message); // "Événement ajouté aux favoris"
console.log(result.count);   // 43
```

---

## Réservations

### 1. Créer une réservation

#### Request
```http
POST /api/reservations HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "eventId": 1,
  "participantId": 5
}
```

#### Response Success
```json
{
  "id": 15,
  "ticketCode": "TKT-A7B3C9D2",
  "reservationDate": "2026-03-02T22:45:30.123",
  "status": "CONFIRMED",
  "eventName": "Workshop Spring Boot Avancé",
  "participantName": "John Doe",
  "message": "Réservation confirmée avec succès!"
}
```

#### Response Error - Event Full
```json
"Désolé, cet événement est complet."
```

#### Response Error - Already Reserved
```json
"Vous avez déjà réservé cet événement."
```

#### Response Error - Event Expired
```json
"Désolé, cet événement est expiré."
```

#### Response Error - Event Not Available
```json
"Désolé, cet événement n'est plus disponible. Status: CANCELLED"
```

### 2. Télécharger le ticket PDF

#### Request
```http
GET /api/reservations/15/ticket HTTP/1.1
Host: localhost:8080
```

#### Response
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ticket-15.pdf"

[Binary PDF Data]
```

#### Frontend Implementation
```javascript
async function downloadTicket(reservationId) {
  try {
    const response = await fetch(
      `http://localhost:8080/back/api/reservations/${reservationId}/ticket`
    );
    
    if (!response.ok) {
      throw new Error('Failed to download ticket');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${reservationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Ticket téléchargé avec succès');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}
```

### 3. Annuler une réservation

#### Request
```http
DELETE /api/reservations/15 HTTP/1.1
Host: localhost:8080
```

#### Response Success
```json
"Réservation annulée avec succès"
```

#### Response Error
```json
"Cette réservation est déjà annulée"
```

### 4. Réservations par événement

#### Request
```http
GET /api/reservations/event/1 HTTP/1.1
Host: localhost:8080
```

#### Response
```json
[
  {
    "id": 1,
    "ticketCode": "TKT-A7B3C9D2",
    "reservationDate": "2026-03-01T10:30:00",
    "status": "CONFIRMED",
    "eventName": "Workshop Spring Boot Avancé",
    "participantName": "John Doe"
  },
  {
    "id": 2,
    "ticketCode": "TKT-B8C4D1E3",
    "reservationDate": "2026-03-01T11:15:00",
    "status": "CONFIRMED",
    "eventName": "Workshop Spring Boot Avancé",
    "participantName": "Jane Smith"
  }
]
```

### 5. Réservations par participant

#### Request
```http
GET /api/reservations/participant/5 HTTP/1.1
Host: localhost:8080
```

#### Response
```json
[
  {
    "id": 15,
    "ticketCode": "TKT-A7B3C9D2",
    "reservationDate": "2026-03-02T22:45:30",
    "status": "CONFIRMED",
    "eventName": "Workshop Spring Boot Avancé",
    "participantName": "John Doe"
  },
  {
    "id": 18,
    "ticketCode": "TKT-F5G6H7I8",
    "reservationDate": "2026-03-03T09:20:00",
    "status": "CONFIRMED",
    "eventName": "Webinar React & TypeScript",
    "participantName": "John Doe"
  }
]
```

---

## Validation Ticket

### 1. Valider un ticket (Scan QR Code)

#### Request
```http
GET /api/reservations/validate/TKT-A7B3C9D2 HTTP/1.1
Host: localhost:8080
```

#### Response - Ticket Valide
```json
{
  "valid": true,
  "message": "✅ Ticket valide - Bienvenue!",
  "ticketCode": "TKT-A7B3C9D2",
  "eventName": "Workshop Spring Boot Avancé",
  "eventDate": "2026-03-15",
  "eventLocation": "Tunis, Tunisia",
  "participantName": "John Doe",
  "participantEmail": "john.doe@example.com",
  "status": "CONFIRMED",
  "reservationDate": "2026-03-02T22:45:30",
  "alreadyUsed": false
}
```

#### Response - Ticket Invalide
```json
{
  "valid": false,
  "message": "❌ Ticket invalide - Code introuvable",
  "ticketCode": "TKT-INVALID"
}
```

#### Response - Ticket Déjà Utilisé
```json
{
  "valid": false,
  "message": "⚠️ Ticket déjà utilisé",
  "ticketCode": "TKT-A7B3C9D2",
  "eventName": "Workshop Spring Boot Avancé",
  "eventDate": "2026-03-15",
  "eventLocation": "Tunis, Tunisia",
  "participantName": "John Doe",
  "participantEmail": "john.doe@example.com",
  "status": "CONFIRMED",
  "reservationDate": "2026-03-02T22:45:30",
  "alreadyUsed": true
}
```

#### Response - Réservation Annulée
```json
{
  "valid": false,
  "message": "❌ Ticket invalide - Réservation annulée",
  "ticketCode": "TKT-A7B3C9D2",
  "eventName": "Workshop Spring Boot Avancé",
  "participantName": "John Doe",
  "status": "CANCELLED"
}
```

### 2. Marquer le ticket comme utilisé

#### Request
```http
POST /api/reservations/validate/TKT-A7B3C9D2/use HTTP/1.1
Host: localhost:8080
```

#### Response Success
```json
"Ticket marqué comme utilisé"
```

#### Response Error
```json
"Ticket introuvable"
```

### Frontend QR Scanner Implementation
```javascript
class TicketScanner {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async validateTicket(ticketCode) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/reservations/validate/${ticketCode}`
      );
      const data = await response.json();
      
      return this.handleValidationResult(data);
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  handleValidationResult(data) {
    if (data.valid) {
      // Ticket valide - afficher les infos et demander confirmation
      return {
        success: true,
        message: data.message,
        participant: data.participantName,
        event: data.eventName,
        ticketCode: data.ticketCode
      };
    } else {
      // Ticket invalide
      return {
        success: false,
        message: data.message,
        alreadyUsed: data.alreadyUsed
      };
    }
  }

  async markAsUsed(ticketCode) {
    const response = await fetch(
      `${this.baseUrl}/api/reservations/validate/${ticketCode}/use`,
      { method: 'POST' }
    );
    return await response.text();
  }
}

// Usage avec un scanner QR
const scanner = new TicketScanner('http://localhost:8080/back');

// Quand un QR code est scanné
async function onQRCodeScanned(qrContent) {
  // Le QR contient: "TICKET:TKT-A7B3C9D2|EVENT:1|PARTICIPANT:5"
  const ticketCode = qrContent.split('|')[0].split(':')[1];
  
  const result = await scanner.validateTicket(ticketCode);
  
  if (result.success) {
    // Afficher modal de confirmation
    showConfirmationModal({
      title: '✅ Ticket Valide',
      message: result.message,
      participant: result.participant,
      event: result.event,
      onConfirm: async () => {
        await scanner.markAsUsed(result.ticketCode);
        showSuccess('Entrée autorisée');
      }
    });
  } else {
    // Afficher erreur
    showError({
      title: '❌ Ticket Invalide',
      message: result.message,
      alreadyUsed: result.alreadyUsed
    });
  }
}
```

---

## CRUD Events

### 1. Créer un événement

#### Request (Multipart Form-Data)
```http
POST /api/events HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data

name=Workshop Spring Boot
category=WORKSHOP
status=Upcoming
date=2026-03-15
placesLimit=100
description=Apprenez Spring Boot
location=Tunis
organizerFirstName=Ahmed
organizerLastName=Ben Ali
photo=[binary file data]
```

#### Response
```json
{
  "id": 26,
  "name": "Workshop Spring Boot",
  "category": "WORKSHOP",
  "status": "UPCOMING",
  "date": "2026-03-15",
  "placesLimit": 100,
  "reservedPlaces": 0,
  "description": "Apprenez Spring Boot",
  "location": "Tunis",
  "photoUrl": "/uploads/1709414966123_workshop.png",
  "organizerFirstName": "Ahmed",
  "organizerLastName": "Ben Ali"
}
```

### 2. Recherche et filtrage

#### Request
```http
GET /api/events/search?keyword=spring&category=WORKSHOP&status=UPCOMING&page=0&size=10 HTTP/1.1
Host: localhost:8080
```

#### Response
```json
{
  "content": [
    {
      "id": 1,
      "name": "Workshop Spring Boot Avancé",
      "category": "WORKSHOP",
      "status": "UPCOMING",
      "date": "2026-03-15",
      "placesLimit": 100,
      "reservedPlaces": 85,
      "description": "Apprenez Spring Boot de A à Z",
      "location": "Tunis, Tunisia"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

---

## 🔗 Liens Utiles

- [Documentation complète](./API_DOCUMENTATION.md)
- [Fonctionnalités avancées](./ADVANCED_FEATURES.md)
- [Guide de démarrage](./QUICK_START.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
