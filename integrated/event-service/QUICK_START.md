# ⚡ Quick Start - Module Event

## 🎯 En 5 minutes

### 1️⃣ Configuration Base de Données (1 min)

```sql
CREATE DATABASE event_db;
```

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=
```

### 2️⃣ Lancer l'application (1 min)

```bash
cd BackRahma
mvn spring-boot:run
```

### 3️⃣ Insérer des données de test (1 min)

```bash
mysql -u root -p event_db < TEST_DATA.sql
```

### 4️⃣ Tester l'API (2 min)

**Importer dans Postman :** `POSTMAN_COLLECTION.json`

Ou tester directement :

```bash
# Liste des événements
curl http://localhost:8080/api/events

# Recherche
curl "http://localhost:8080/api/events/search?keyword=workshop&page=0&size=10"

# Créer une réservation
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1, "participantId": 1}'

# Liker un événement
curl -X POST http://localhost:8080/api/events/likes/1/participant/1
```

## 📊 Vérifier que tout fonctionne

### Statistiques Admin
```bash
curl http://localhost:8080/api/events/statistics
```

Devrait retourner :
```json
{
  "totalEvents": 12,
  "totalReservations": 16,
  "topReservedEvents": [...]
}
```

### Télécharger un ticket PDF
```
http://localhost:8080/api/reservations/1/ticket
```

## 🎨 Frontend (Optionnel)

```bash
# Créer le projet Angular
ng new event-frontend
cd event-frontend

# Générer les services
ng g service services/event
ng g service services/reservation
ng g service services/event-like

# Générer les composants
ng g component components/event-list
ng g component components/event-detail

# Lancer
ng serve
```

Copier le code des services depuis `API_DOCUMENTATION.md`

## 📚 Documentation Complète

| Fichier | Contenu |
|---------|---------|
| `README_EVENT_MODULE.md` | Documentation principale |
| `API_DOCUMENTATION.md` | Tous les endpoints + exemples Angular |
| `DATABASE_SCHEMA.md` | Schéma BDD complet |
| `FRONTEND_GUIDE.md` | Guide frontend détaillé |
| `IMPLEMENTATION_SUMMARY.md` | Résumé de l'implémentation |

## ✅ Checklist

- [ ] Base de données créée
- [ ] application.properties configuré
- [ ] Application lancée (port 8080)
- [ ] Données de test insérées
- [ ] API testée avec Postman
- [ ] Ticket PDF généré avec succès

## 🚨 Problèmes Courants

### Port 8080 déjà utilisé
```properties
# application.properties
server.port=8081
```

### Erreur de connexion MySQL
```bash
# Vérifier que MySQL est lancé
sudo service mysql status

# Vérifier les credentials
mysql -u root -p
```

### Dépendances Maven
```bash
mvn clean install -U
```

## 🎉 C'est prêt !

Votre module Event est maintenant opérationnel avec :
- ✅ CRUD événements
- ✅ Système de réservation
- ✅ Génération tickets PDF + QR code
- ✅ Système de likes
- ✅ Recherche et filtrage
- ✅ Statistiques admin

**Prochaine étape :** Implémenter le frontend Angular (voir `FRONTEND_GUIDE.md`)
