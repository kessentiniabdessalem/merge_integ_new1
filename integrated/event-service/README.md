# 🎯 Module Event Management

> Système complet de gestion d'événements pour plateforme e-learning avec réservation, génération de tickets PDF et QR codes.

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Démarrage Rapide

```bash
# 1. Créer la base de données
mysql -u root -p
CREATE DATABASE event_db;
exit;

# 2. Lancer l'application
cd BackRahma
mvn spring-boot:run

# 3. Tester
curl http://localhost:8080/api/events
```

**✅ C'est prêt !** L'API tourne sur http://localhost:8080

---

## 📚 Documentation

### 🎯 Commencez ici

| Document | Description | Temps |
|----------|-------------|-------|
| [**START_HERE.md**](START_HERE.md) | 🎯 Point d'entrée principal | 5 min |
| [**QUICK_START.md**](QUICK_START.md) | ⚡ Démarrage en 5 minutes | 5 min |
| [**README_EVENT_MODULE.md**](README_EVENT_MODULE.md) | 📖 Documentation complète | 15 min |

### 📖 Documentation Complète

- [**API_DOCUMENTATION.md**](API_DOCUMENTATION.md) - Tous les endpoints REST + exemples Angular
- [**DATABASE_SCHEMA.md**](DATABASE_SCHEMA.md) - Schéma de la base de données
- [**FRONTEND_GUIDE.md**](FRONTEND_GUIDE.md) - Guide pour le frontend Angular
- [**RESERVATION_FLOW.md**](RESERVATION_FLOW.md) - Diagramme de flux de réservation
- [**IMPLEMENTATION_SUMMARY.md**](IMPLEMENTATION_SUMMARY.md) - Résumé de l'implémentation
- [**DOCUMENTATION_INDEX.md**](DOCUMENTATION_INDEX.md) - Index complet de la documentation

### 🧪 Tests

- [**POSTMAN_COLLECTION.json**](POSTMAN_COLLECTION.json) - Collection Postman complète
- [**CURL_EXAMPLES.sh**](CURL_EXAMPLES.sh) - Scripts curl pour tests rapides
- [**TEST_DATA.sql**](TEST_DATA.sql) - Données de test SQL

### 🔧 Utilitaires

- [**MAVEN_COMMANDS.md**](MAVEN_COMMANDS.md) - Commandes Maven utiles
- [**VERIFICATION_CHECKLIST.sh**](VERIFICATION_CHECKLIST.sh) - Script de vérification
- [**CHANGELOG.md**](CHANGELOG.md) - Historique des versions
- [**FILES_CREATED.md**](FILES_CREATED.md) - Liste des fichiers créés

---

## ✨ Fonctionnalités

### Pour les Administrateurs
- ✅ CRUD complet des événements
- ✅ Gestion du status (Upcoming, Ongoing, Completed, Cancelled)
- ✅ Consultation des réservations par événement
- ✅ Statistiques (total events, réservations, top events)

### Pour les Participants
- ✅ Consulter les événements
- ✅ Recherche par mot-clé (name, location)
- ✅ Filtrage par catégorie et status
- ✅ Pagination
- ✅ Like / Unlike un événement
- ✅ Réserver un événement
- ✅ Télécharger ticket PDF avec QR code

### Système de Réservation
- ✅ Validation automatique (status, date, places)
- ✅ Génération code unique (TKT-XXXXXXXX)
- ✅ Génération QR code
- ✅ Export PDF professionnel
- ✅ Messages d'erreur personnalisés

---

## 🏗️ Architecture

```
Backend (Spring Boot)
├── Entités (5)
│   ├── Event, Reservation, EventLike
│   └── Participant, Organizer
├── Repositories (5)
│   └── CRUD + requêtes personnalisées
├── Services (5)
│   ├── Logique métier
│   ├── Génération QR codes
│   └── Génération PDF
└── Controllers (3)
    └── 24 endpoints REST

Frontend (Angular - Recommandé)
├── Services
│   ├── EventService
│   ├── ReservationService
│   └── EventLikeService
└── Composants
    ├── Liste événements
    ├── Détail événement
    └── Mes réservations
```

---

## 🛠️ Technologies

- **Backend:** Java 17, Spring Boot 3.3.2, Spring Data JPA
- **Base de données:** MySQL 8.0+
- **Build:** Maven 3.6+
- **QR Code:** ZXing 3.5.2
- **PDF:** iText7 7.2.5
- **Tests:** JUnit 5
- **Frontend (Recommandé):** Angular 19, TypeScript

---

## 📊 Endpoints Principaux

### Events
```
GET    /api/events                    - Liste des événements
GET    /api/events/search             - Recherche et filtrage
POST   /api/events                    - Créer (Admin)
PUT    /api/events/{id}               - Modifier (Admin)
DELETE /api/events/{id}               - Supprimer (Admin)
GET    /api/events/statistics         - Statistiques (Admin)
```

### Réservations
```
POST   /api/reservations              - Réserver un événement
GET    /api/reservations/{id}/ticket  - Télécharger ticket PDF
DELETE /api/reservations/{id}         - Annuler réservation
```

### Likes
```
POST   /api/events/likes/{eventId}/participant/{participantId}  - Liker
DELETE /api/events/likes/{eventId}/participant/{participantId}  - Unliker
```

Voir [API_DOCUMENTATION.md](API_DOCUMENTATION.md) pour la liste complète.

---

## 🧪 Tests

### Avec Postman
```bash
# Importer la collection
POSTMAN_COLLECTION.json
```

### Avec curl
```bash
# Exécuter les scripts de test
bash CURL_EXAMPLES.sh
```

### Tests unitaires
```bash
mvn test
```

---

## 📦 Installation

### Prérequis
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Étapes

1. **Cloner le projet**
```bash
git clone <repository-url>
cd BackRahma
```

2. **Configurer la base de données**
```sql
CREATE DATABASE event_db;
```

```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

3. **Installer les dépendances**
```bash
mvn clean install
```

4. **Lancer l'application**
```bash
mvn spring-boot:run
```

5. **Insérer des données de test** (optionnel)
```bash
mysql -u root -p event_db < TEST_DATA.sql
```

---

## 📈 Statistiques

- **Lignes de code:** ~3000
- **Endpoints REST:** 24
- **Entités JPA:** 5
- **Services:** 5
- **Controllers:** 3
- **Tests unitaires:** 6
- **Documentation:** 15 fichiers

---

## 🎓 Exemples

### Créer une Réservation

```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "participantId": 1
  }'
```

**Réponse:**
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

### Rechercher des Événements

```bash
curl "http://localhost:8080/api/events/search?keyword=workshop&category=WORKSHOP&status=Upcoming"
```

---

## 🚨 Avant la Production

**À ajouter :**
- [ ] Authentification (Spring Security + JWT)
- [ ] Autorisation basée sur les rôles
- [ ] HTTPS
- [ ] Rate limiting
- [ ] Monitoring

Voir [CHANGELOG.md](CHANGELOG.md) pour la roadmap complète.

---

## 📞 Support

- **Documentation:** Consultez les 15 fichiers de documentation
- **Tests:** Utilisez Postman ou curl
- **Issues:** Créez une issue sur GitHub

---

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Contributeurs

- Équipe Backend - Développement du module
- Équipe Frontend - Spécifications et tests
- Équipe QA - Tests et validation

---

## 🎉 Remerciements

Merci d'utiliser le Module Event Management !

Pour commencer, consultez [**START_HERE.md**](START_HERE.md) 🚀

---

**Version:** 1.0.0  
**Date:** Mars 2026  
**Status:** ✅ Production Ready (après authentification)
