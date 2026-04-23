# 🎯 Module Event Management - Documentation Complète

## 📖 Vue d'ensemble

Système complet de gestion d'événements pour une plateforme e-learning avec :
- Gestion CRUD des événements (Admin)
- Système de réservation avec validation
- Génération de tickets PDF avec QR code
- Système de likes
- Recherche et filtrage avancés
- Statistiques pour administrateurs

## 🚀 Démarrage Rapide

### Prérequis
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- (Optionnel) Postman pour tester l'API

### Installation

1. **Cloner le projet**
```bash
cd BackRahma
```

2. **Configurer la base de données**

Créer la base de données :
```sql
CREATE DATABASE event_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Modifier `src/main/resources/application.properties` :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

3. **Installer les dépendances**
```bash
mvn clean install
```

4. **Lancer l'application**
```bash
mvn spring-boot:run
```

L'API sera disponible sur : `http://localhost:8080`

5. **Insérer les données de test** (optionnel)
```bash
mysql -u root -p event_db < TEST_DATA.sql
```

## 📚 Documentation

### Fichiers de documentation disponibles

| Fichier | Description |
|---------|-------------|
| `API_DOCUMENTATION.md` | Documentation complète des endpoints REST avec exemples |
| `DATABASE_SCHEMA.md` | Schéma de la base de données avec relations |
| `FRONTEND_GUIDE.md` | Guide pour implémenter le frontend Angular |
| `IMPLEMENTATION_SUMMARY.md` | Résumé de l'implémentation |
| `POSTMAN_COLLECTION.json` | Collection Postman pour tester l'API |
| `TEST_DATA.sql` | Script SQL avec données de test |

### Endpoints principaux

```
Events:
GET    /api/events                    - Liste des événements
GET    /api/events/search             - Recherche et filtrage
POST   /api/events                    - Créer (Admin)
PUT    /api/events/{id}               - Modifier (Admin)
DELETE /api/events/{id}               - Supprimer (Admin)
GET    /api/events/statistics         - Statistiques (Admin)

Réservations:
POST   /api/reservations              - Réserver un événement
GET    /api/reservations/{id}/ticket  - Télécharger ticket PDF
DELETE /api/reservations/{id}         - Annuler réservation

Likes:
POST   /api/events/likes/{eventId}/participant/{participantId}  - Liker
DELETE /api/events/likes/{eventId}/participant/{participantId}  - Unliker
```

## 🏗️ Architecture

### Structure du projet

```
BackRahma/
├── src/main/java/pi/backrahma/
│   ├── entity/              # Entités JPA
│   │   ├── Event.java
│   │   ├── Reservation.java
│   │   ├── EventLike.java
│   │   ├── Participant.java
│   │   └── Organizer.java
│   ├── Repository/          # Repositories Spring Data
│   │   ├── EventRepository.java
│   │   ├── ReservationRepository.java
│   │   └── EventLikeRepository.java
│   ├── Service/             # Logique métier
│   │   ├── EventServiceImp.java
│   │   ├── ReservationService.java
│   │   ├── EventLikeService.java
│   │   ├── QRCodeService.java
│   │   └── PDFTicketService.java
│   ├── Controller/          # Endpoints REST
│   │   ├── EventController.java
│   │   ├── ReservationController.java
│   │   └── EventLikeController.java
│   ├── dto/                 # Data Transfer Objects
│   │   ├── ReservationRequest.java
│   │   ├── ReservationResponse.java
│   │   └── EventStatistics.java
│   └── exception/           # Gestion des erreurs
│       ├── ReservationException.java
│       └── GlobalExceptionHandler.java
└── src/test/java/           # Tests unitaires
    └── ReservationServiceTest.java
```

### Technologies utilisées

- **Spring Boot 3.3.2** - Framework backend
- **Spring Data JPA** - Persistence
- **MySQL** - Base de données
- **Lombok** - Réduction du boilerplate
- **ZXing** - Génération QR codes
- **iText7** - Génération PDF
- **JUnit 5** - Tests unitaires

## 🎯 Fonctionnalités

### Pour les Administrateurs

✅ CRUD complet des événements  
✅ Gestion du status (Upcoming, Ongoing, Completed, Cancelled)  
✅ Consultation des réservations par événement  
✅ Statistiques :
  - Nombre total d'événements
  - Nombre total de réservations
  - Top 5 événements les plus réservés

### Pour les Participants

✅ Consulter tous les événements  
✅ Recherche par mot-clé (name, location)  
✅ Filtrage par catégorie et status  
✅ Pagination  
✅ Like / Unlike un événement  
✅ Réserver un événement  
✅ Télécharger ticket PDF avec QR code  
✅ Consulter ses réservations

### Système de Réservation

Le système effectue automatiquement les validations suivantes :

1. ✅ **Status = Upcoming** - L'événement doit être à venir
2. ✅ **Date >= Aujourd'hui** - L'événement ne doit pas être expiré
3. ✅ **Places disponibles** - Vérification de la capacité
4. ✅ **Pas de doublon** - Un participant ne peut réserver qu'une fois

Si toutes les validations passent :
- Création de la réservation
- Génération d'un code unique (TKT-XXXXXXXX)
- Incrémentation automatique de `reservedPlaces`
- Génération du QR code
- Ticket PDF disponible au téléchargement

## 🧪 Tests

### Lancer les tests unitaires

```bash
mvn test
```

### Tester avec Postman

1. Importer `POSTMAN_COLLECTION.json` dans Postman
2. Lancer l'application Spring Boot
3. Exécuter les requêtes de la collection

### Scénarios de test recommandés

1. **Réservation réussie**
   - Créer un événement Upcoming avec places disponibles
   - Réserver avec un participant
   - Vérifier l'incrémentation de `reservedPlaces`
   - Télécharger le ticket PDF

2. **Réservation échouée - Événement complet**
   - Créer un événement avec `reservedPlaces = placesLimit`
   - Tenter de réserver
   - Vérifier le message d'erreur

3. **Réservation échouée - Événement expiré**
   - Créer un événement avec date passée
   - Tenter de réserver
   - Vérifier le message d'erreur

4. **Like/Unlike**
   - Liker un événement
   - Vérifier le compteur
   - Unliker
   - Vérifier la décrémentation

5. **Recherche et filtrage**
   - Rechercher par mot-clé
   - Filtrer par catégorie
   - Filtrer par status
   - Combiner les filtres

## 📊 Base de Données

### Schéma des relations

```
Organizer (1) ←→ (N) Event
Event (N) ←→ (N) Participant (via event_participants)
Event (1) ←→ (N) Reservation (N) ←→ (1) Participant
Event (1) ←→ (N) EventLike (N) ←→ (1) Participant
```

### Tables principales

- `event` - Événements
- `participant` - Participants
- `organizer` - Organisateurs
- `reservation` - Réservations avec tickets
- `event_like` - Likes
- `event_participants` - Table de jointure ManyToMany

Voir `DATABASE_SCHEMA.md` pour le schéma complet.

## 🔧 Configuration

### application.properties

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server
server.port=8080

# File upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## 🚨 Gestion des Erreurs

Le système gère automatiquement les erreurs avec des messages personnalisés :

| Erreur | Message |
|--------|---------|
| Événement complet | "Désolé, cet événement est complet." |
| Événement expiré | "Désolé, cet événement est expiré." |
| Événement annulé | "Désolé, cet événement n'est plus disponible." |
| Déjà réservé | "Vous avez déjà réservé cet événement." |

## 📱 Frontend

Pour implémenter le frontend Angular, consulter :
- `FRONTEND_GUIDE.md` - Guide complet
- `API_DOCUMENTATION.md` - Exemples de services Angular

## 🔐 Sécurité (À implémenter)

Points à ajouter pour la production :

- [ ] Authentification (Spring Security + JWT)
- [ ] Autorisation basée sur les rôles (ADMIN, PARTICIPANT)
- [ ] Protection CSRF
- [ ] Rate limiting
- [ ] Validation des entrées
- [ ] Sanitization des données

## 📈 Améliorations Futures

- [ ] Système de notifications par email
- [ ] Rappels automatiques avant événements
- [ ] Système de commentaires et notes
- [ ] Export Excel des réservations
- [ ] Tableau de bord analytics avancé
- [ ] Intégration calendrier (Google Calendar, Outlook)
- [ ] Paiement en ligne pour événements payants
- [ ] Système de badges et gamification

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

Développé pour le module Event Management de la plateforme e-learning.

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation dans les fichiers `.md`
- Vérifier les issues GitHub
- Contacter l'équipe de développement

---

**Note:** Ce module est prêt pour la production après l'ajout de l'authentification et des tests d'intégration.
