# 🚀 Fonctionnalités Avancées - Module Event

## 1️⃣ STATISTIQUES (Dashboard Admin)

### Endpoint
```
GET /api/events/statistics
```

### Réponse JSON
```json
{
  "totalEvents": 25,
  "totalReservations": 150,
  "totalParticipants": 120,
  "topReservedEvents": [
    {
      "id": 1,
      "name": "Workshop Spring Boot",
      "category": "WORKSHOP",
      "status": "UPCOMING",
      "date": "2026-03-15",
      "placesLimit": 100,
      "reservedPlaces": 85,
      "description": "...",
      "location": "Tunis"
    }
  ],
  "eventsByCategory": {
    "WORKSHOP": 10,
    "WEBINAR": 8,
    "CONFERENCE": 5,
    "TRAINING": 2
  }
}
```

### Requêtes JPA
```java
// EventRepository.java
@Query("SELECT e FROM Event e ORDER BY e.reservedPlaces DESC")
List<Event> findTopReservedEvents(Pageable pageable);

@Query("SELECT e.category, COUNT(e) FROM Event e GROUP BY e.category")
List<Object[]> countEventsByCategory();

// ReservationRepository.java
@Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = 'CONFIRMED'")
long countTotalReservations();
```

### Utilisation Frontend
```javascript
// Récupérer les statistiques
fetch('http://localhost:8080/back/api/events/statistics')
  .then(res => res.json())
  .then(data => {
    console.log('Total Events:', data.totalEvents);
    console.log('Total Reservations:', data.totalReservations);
    console.log('Total Participants:', data.totalParticipants);
    
    // Pour un chart (pie/bar)
    const categories = Object.keys(data.eventsByCategory);
    const counts = Object.values(data.eventsByCategory);
  });
```

---

## 2️⃣ LIKE / UNLIKE (Aimer / ne pas aimer)

### Entité EventLike
```java
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "participant_id"}))
public class EventLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Event event;
    
    @ManyToOne
    private Participant participant;
    
    private LocalDateTime likedAt;
}
```

### Endpoints

#### Aimer un événement
```
POST /api/events/likes/{eventId}/participant/{participantId}
```

**Réponse:**
```json
"Événement ajouté aux favoris"
```

#### Ne plus aimer un événement
```
DELETE /api/events/likes/{eventId}/participant/{participantId}
```

**Réponse:**
```json
"Événement retiré des favoris"
```

#### Vérifier si un participant a aimé
```
GET /api/events/likes/{eventId}/participant/{participantId}/status
```

**Réponse:**
```json
true
```

#### Nombre total de likes
```
GET /api/events/likes/{eventId}/count
```

**Réponse:**
```json
42
```

### Repository
```java
public interface EventLikeRepository extends JpaRepository<EventLike, Long> {
    boolean existsByEventIdAndParticipantId(Long eventId, Long participantId);
    long countByEventId(Long eventId);
    void deleteByEventIdAndParticipantId(Long eventId, Long participantId);
}
```

### Exemples cURL
```bash
# Aimer un événement
curl -X POST http://localhost:8080/back/api/events/likes/1/participant/1

# Ne plus aimer
curl -X DELETE http://localhost:8080/back/api/events/likes/1/participant/1

# Vérifier le status
curl http://localhost:8080/back/api/events/likes/1/participant/1/status

# Compter les likes
curl http://localhost:8080/back/api/events/likes/1/count
```

---

## 3️⃣ GÉNÉRATION DE TICKET PDF

### Service QRCodeService
```java
@Service
public class QRCodeService {
    public byte[] generateQRCode(String text, int width, int height) 
            throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}
```

### Service PDFTicketService
```java
@Service
public class PDFTicketService {
    @Autowired
    private QRCodeService qrCodeService;
    
    public byte[] generateTicketPDF(Reservation reservation) {
        // Génère un PDF avec:
        // - Titre "TICKET D'ÉVÉNEMENT"
        // - Nom de l'événement
        // - Date et lieu
        // - Nom du participant
        // - Code du ticket
        // - QR Code
        // - Instructions
    }
}
```

### Endpoint
```
GET /api/reservations/{reservationId}/ticket
```

**Réponse:** Fichier PDF téléchargeable

### Contenu du QR Code
```
TICKET:TKT-ABC12345|EVENT:1|PARTICIPANT:5
```

### Exemple cURL
```bash
# Télécharger le ticket PDF
curl -o ticket.pdf http://localhost:8080/back/api/reservations/1/ticket
```

### Utilisation Frontend
```javascript
// Télécharger le ticket
function downloadTicket(reservationId) {
  fetch(`http://localhost:8080/back/api/reservations/${reservationId}/ticket`)
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${reservationId}.pdf`;
      a.click();
    });
}
```

---

## 4️⃣ SCAN DU QR CODE (Validation ticket)

### DTO TicketValidationResponse
```java
@Builder
public class TicketValidationResponse {
    private boolean valid;
    private String message;
    private String ticketCode;
    private String eventName;
    private LocalDate eventDate;
    private String eventLocation;
    private String participantName;
    private String participantEmail;
    private ReservationStatus status;
    private LocalDateTime reservationDate;
    private boolean alreadyUsed;
}
```

### Endpoints

#### Valider un ticket
```
GET /api/reservations/validate/{ticketCode}
```

**Réponse - Ticket valide:**
```json
{
  "valid": true,
  "message": "✅ Ticket valide - Bienvenue!",
  "ticketCode": "TKT-ABC12345",
  "eventName": "Workshop Spring Boot",
  "eventDate": "2026-03-15",
  "eventLocation": "Tunis",
  "participantName": "John Doe",
  "participantEmail": "john@example.com",
  "status": "CONFIRMED",
  "reservationDate": "2026-03-01T10:30:00",
  "alreadyUsed": false
}
```

**Réponse - Ticket invalide:**
```json
{
  "valid": false,
  "message": "❌ Ticket invalide - Code introuvable",
  "ticketCode": "TKT-INVALID"
}
```

**Réponse - Ticket déjà utilisé:**
```json
{
  "valid": false,
  "message": "⚠️ Ticket déjà utilisé",
  "ticketCode": "TKT-ABC12345",
  "eventName": "Workshop Spring Boot",
  "participantName": "John Doe",
  "alreadyUsed": true
}
```

**Réponse - Ticket annulé:**
```json
{
  "valid": false,
  "message": "❌ Ticket invalide - Réservation annulée",
  "ticketCode": "TKT-ABC12345",
  "status": "CANCELLED"
}
```

#### Marquer le ticket comme utilisé
```
POST /api/reservations/validate/{ticketCode}/use
```

**Réponse:**
```json
"Ticket marqué comme utilisé"
```

### Logique de validation
```java
public TicketValidationResponse validateTicket(String ticketCode) {
    // 1. Chercher la réservation par ticketCode
    Reservation reservation = reservationRepository.findByTicketCode(ticketCode);
    
    // 2. Vérifier si le ticket existe
    if (reservation == null) {
        return invalid("Code introuvable");
    }
    
    // 3. Vérifier si la réservation est annulée
    if (reservation.getStatus() == CANCELLED) {
        return invalid("Réservation annulée");
    }
    
    // 4. Vérifier si le ticket a déjà été utilisé
    if (reservation.getParticipant().isAttended()) {
        return invalid("Ticket déjà utilisé");
    }
    
    // 5. Ticket valide
    return valid("Bienvenue!");
}
```

### Exemples cURL
```bash
# Valider un ticket
curl http://localhost:8080/back/api/reservations/validate/TKT-ABC12345

# Marquer comme utilisé
curl -X POST http://localhost:8080/back/api/reservations/validate/TKT-ABC12345/use
```

### Utilisation Frontend (Scanner QR)
```javascript
// Après avoir scanné le QR code
function validateTicket(ticketCode) {
  fetch(`http://localhost:8080/back/api/reservations/validate/${ticketCode}`)
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        alert(`✅ ${data.message}\nParticipant: ${data.participantName}`);
        
        // Marquer comme utilisé
        return fetch(`http://localhost:8080/back/api/reservations/validate/${ticketCode}/use`, {
          method: 'POST'
        });
      } else {
        alert(`❌ ${data.message}`);
      }
    });
}
```

---

## 📊 Résumé des Endpoints

### Statistiques
- `GET /api/events/statistics` - Dashboard admin

### Likes
- `POST /api/events/likes/{eventId}/participant/{participantId}` - Aimer
- `DELETE /api/events/likes/{eventId}/participant/{participantId}` - Ne plus aimer
- `GET /api/events/likes/{eventId}/participant/{participantId}/status` - Vérifier
- `GET /api/events/likes/{eventId}/count` - Compter

### Tickets
- `GET /api/reservations/{reservationId}/ticket` - Télécharger PDF
- `GET /api/reservations/validate/{ticketCode}` - Valider
- `POST /api/reservations/validate/{ticketCode}/use` - Marquer utilisé

---

## 🔧 Dépendances Maven

```xml
<!-- QR Code -->
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.5.2</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.5.2</version>
</dependency>

<!-- PDF -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

---

## ✅ Toutes les fonctionnalités sont implémentées!

1. ✅ Statistiques complètes (events, reservations, participants, top 5, répartition)
2. ✅ Like/Unlike avec contrainte unique
3. ✅ Génération PDF avec QR code
4. ✅ Validation de ticket avec scan QR code
