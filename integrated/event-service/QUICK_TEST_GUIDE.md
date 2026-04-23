# 🧪 Guide de Test Rapide - Module Event

## ✅ Serveurs en cours d'exécution

- **Backend**: http://localhost:8080/back ✅
- **Frontend**: http://localhost:52948 ✅

---

## 🚀 Tests Rapides (5 minutes)

### 1️⃣ Test Statistiques Dashboard (30 sec)

```bash
curl http://localhost:8080/back/api/events/statistics
```

**Résultat attendu**: JSON avec totalEvents, totalReservations, totalParticipants, topReservedEvents, eventsByCategory

---

### 2️⃣ Test Création d'Événement (1 min)

#### Avec cURL (sans photo)
```bash
curl -X POST http://localhost:8080/back/api/events \
  -F "name=Test Workshop" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=2026-04-15" \
  -F "placesLimit=50" \
  -F "description=Test description" \
  -F "location=Tunis" \
  -F "organizerFirstName=Test" \
  -F "organizerLastName=User"
```

#### Avec Frontend
1. Ouvrir http://localhost:52948
2. Cliquer sur "Create Event"
3. Remplir le formulaire
4. Cliquer sur "Create"

**Résultat attendu**: Événement créé avec photoUrl par défaut

---

### 3️⃣ Test Système Like/Unlike (1 min)

```bash
# Aimer un événement
curl -X POST http://localhost:8080/back/api/events/likes/1/participant/1

# Vérifier
curl http://localhost:8080/back/api/events/likes/1/participant/1/status

# Compter
curl http://localhost:8080/back/api/events/likes/1/count

# Ne plus aimer
curl -X DELETE http://localhost:8080/back/api/events/likes/1/participant/1
```

**Résultat attendu**: 
- POST → "Événement ajouté aux favoris"
- GET status → true
- GET count → nombre de likes
- DELETE → "Événement retiré des favoris"

---

### 4️⃣ Test Réservation + Ticket PDF (2 min)

#### Étape 1: Créer une réservation
```bash
curl -X POST http://localhost:8080/back/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "participantId": 1
  }'
```

**Résultat attendu**: JSON avec ticketCode (ex: TKT-A7B3C9D2)

#### Étape 2: Télécharger le ticket PDF
```bash
curl -o ticket.pdf http://localhost:8080/back/api/reservations/1/ticket
```

**Résultat attendu**: Fichier ticket.pdf téléchargé

#### Étape 3: Ouvrir le PDF
- Ouvrir ticket.pdf
- Vérifier: nom événement, participant, date, lieu, code, QR code

---

### 5️⃣ Test Validation Ticket (1 min)

#### Valider un ticket (remplacer par votre ticketCode)
```bash
curl http://localhost:8080/back/api/reservations/validate/TKT-A7B3C9D2
```

**Résultat attendu**: 
```json
{
  "valid": true,
  "message": "✅ Ticket valide - Bienvenue!",
  "ticketCode": "TKT-A7B3C9D2",
  "eventName": "...",
  "participantName": "...",
  "alreadyUsed": false
}
```

#### Marquer comme utilisé
```bash
curl -X POST http://localhost:8080/back/api/reservations/validate/TKT-A7B3C9D2/use
```

#### Valider à nouveau (doit être refusé)
```bash
curl http://localhost:8080/back/api/reservations/validate/TKT-A7B3C9D2
```

**Résultat attendu**: 
```json
{
  "valid": false,
  "message": "⚠️ Ticket déjà utilisé",
  "alreadyUsed": true
}
```

---

## 🔍 Tests Avancés

### Test Recherche et Filtrage
```bash
# Recherche par mot-clé
curl "http://localhost:8080/back/api/events/search?keyword=workshop"

# Filtrage par catégorie
curl "http://localhost:8080/back/api/events/search?category=WORKSHOP"

# Filtrage par status
curl "http://localhost:8080/back/api/events/search?status=UPCOMING"

# Combinaison + pagination
curl "http://localhost:8080/back/api/events/search?keyword=spring&category=WORKSHOP&status=UPCOMING&page=0&size=10"
```

### Test Annulation de Réservation
```bash
curl -X DELETE http://localhost:8080/back/api/reservations/1
```

### Test Réservations par Événement
```bash
curl http://localhost:8080/back/api/reservations/event/1
```

### Test Réservations par Participant
```bash
curl http://localhost:8080/back/api/reservations/participant/1
```

---

## 🐛 Tests d'Erreurs

### Réservation - Événement complet
```bash
# Créer un événement avec placesLimit=1
# Faire 2 réservations
# La 2ème doit échouer avec: "Désolé, cet événement est complet."
```

### Réservation - Doublon
```bash
# Faire 2 réservations avec même eventId et participantId
# La 2ème doit échouer avec: "Vous avez déjà réservé cet événement."
```

### Like - Doublon
```bash
# Aimer 2 fois le même événement
# La 2ème doit retourner: "Vous avez déjà aimé cet événement"
```

### Validation - Ticket invalide
```bash
curl http://localhost:8080/back/api/reservations/validate/TKT-INVALID
# Doit retourner: "❌ Ticket invalide - Code introuvable"
```

---

## 📊 Vérification Visuelle (Frontend)

### Dashboard Admin
1. Ouvrir http://localhost:52948/admin/dashboard
2. Vérifier:
   - Nombre total d'événements
   - Nombre total de réservations
   - Nombre total de participants
   - Top 5 événements
   - Chart répartition par catégorie

### Liste des Événements
1. Ouvrir http://localhost:52948/events
2. Vérifier:
   - Liste des événements
   - Bouton "Like" (cœur)
   - Bouton "Réserver"
   - Recherche
   - Filtres (catégorie, status)
   - Pagination

### Détail d'un Événement
1. Cliquer sur un événement
2. Vérifier:
   - Photo
   - Informations complètes
   - Nombre de likes
   - Places disponibles
   - Bouton "Réserver"

### Mes Réservations
1. Ouvrir http://localhost:52948/my-reservations
2. Vérifier:
   - Liste des réservations
   - Bouton "Télécharger Ticket"
   - Bouton "Annuler"
   - Status de chaque réservation

---

## ✅ Checklist de Validation

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Connexion à la base de données OK
- [ ] Création d'événement fonctionne
- [ ] Upload de photo fonctionne
- [ ] Recherche et filtrage fonctionnent
- [ ] Système de likes fonctionne
- [ ] Création de réservation fonctionne
- [ ] Génération de PDF fonctionne
- [ ] QR Code est présent dans le PDF
- [ ] Validation de ticket fonctionne
- [ ] Marquer ticket comme utilisé fonctionne
- [ ] Statistiques s'affichent correctement
- [ ] Gestion d'erreurs fonctionne
- [ ] Annulation de réservation fonctionne

---

## 🎯 Scénario Complet (Test E2E)

### Scénario: Participant réserve et assiste à un événement

1. **Admin crée un événement**
   ```bash
   curl -X POST http://localhost:8080/back/api/events \
     -F "name=Workshop Spring Boot" \
     -F "category=WORKSHOP" \
     -F "status=Upcoming" \
     -F "date=2026-04-15" \
     -F "placesLimit=50" \
     -F "description=Apprenez Spring Boot" \
     -F "location=Tunis" \
     -F "organizerFirstName=Ahmed" \
     -F "organizerLastName=Ben Ali"
   ```

2. **Participant consulte les événements**
   ```bash
   curl http://localhost:8080/back/api/events
   ```

3. **Participant aime l'événement**
   ```bash
   curl -X POST http://localhost:8080/back/api/events/likes/1/participant/1
   ```

4. **Participant réserve**
   ```bash
   curl -X POST http://localhost:8080/back/api/reservations \
     -H "Content-Type: application/json" \
     -d '{"eventId": 1, "participantId": 1}'
   ```
   → Récupérer le ticketCode (ex: TKT-A7B3C9D2)

5. **Participant télécharge son ticket**
   ```bash
   curl -o ticket.pdf http://localhost:8080/back/api/reservations/1/ticket
   ```

6. **Le jour J - Participant arrive à l'événement**
   - Staff scanne le QR code du ticket
   
7. **Validation du ticket**
   ```bash
   curl http://localhost:8080/back/api/reservations/validate/TKT-A7B3C9D2
   ```
   → Résultat: "✅ Ticket valide - Bienvenue!"

8. **Marquer le ticket comme utilisé**
   ```bash
   curl -X POST http://localhost:8080/back/api/reservations/validate/TKT-A7B3C9D2/use
   ```

9. **Admin consulte les statistiques**
   ```bash
   curl http://localhost:8080/back/api/events/statistics
   ```

✅ **Scénario terminé avec succès!**

---

## 📞 Support

En cas de problème, consulter:
- `TROUBLESHOOTING.md` - Guide de dépannage
- `API_DOCUMENTATION.md` - Documentation complète
- `ADVANCED_FEATURES.md` - Fonctionnalités avancées

---

## 🎉 Félicitations!

Si tous les tests passent, votre module Event est **100% fonctionnel** et prêt à l'emploi!
