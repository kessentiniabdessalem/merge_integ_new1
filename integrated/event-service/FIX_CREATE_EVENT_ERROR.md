# 🔧 Correction "Failed to create event"

## ❌ Problème

L'erreur "Failed to create event" se produit lors de la création d'un événement.

## 🔍 Causes Identifiées

### 1. Photo Obligatoire
Le champ `photoUrl` avait la validation `@NotBlank` mais on ne fournit pas toujours de photo.

### 2. Date Future Obligatoire
La validation `@Future` empêchait de créer des événements pour aujourd'hui.

### 3. Message d'Erreur Peu Informatif
Le catch ne retournait pas le message d'erreur détaillé.

## ✅ Corrections Appliquées

### 1. Event.java - Photo Optionnelle

**Avant :**
```java
@NotBlank(message = "Photo obligatoire")
private String photoUrl;
```

**Après :**
```java
private String photoUrl; // Photo optionnelle
```

### 2. Event.java - Date Flexible

**Avant :**
```java
@Future(message = "La date doit être supérieure à aujourd'hui")
private LocalDate date;
```

**Après :**
```java
@NotNull(message = "Date obligatoire")
private LocalDate date;
```

### 3. EventController.java - Photo par Défaut

**Ajout :**
```java
if (photo != null && !photo.isEmpty()) {
    // Upload de la photo
    event.setPhotoUrl("/" + filePath);
} else {
    // Photo par défaut si aucune photo n'est fournie
    event.setPhotoUrl("/uploads/default-event.jpg");
}
```

### 4. EventController.java - Message d'Erreur Détaillé

**Avant :**
```java
catch (Exception e) {
    logger.error("error creating event", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Failed to create event");
}
```

**Après :**
```java
catch (Exception e) {
    logger.error("Error creating event", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Failed to create event: " + e.getMessage());
}
```

## 🚀 Pour Appliquer les Corrections

### 1. Arrêter le Backend

```bash
# Dans le terminal Spring Boot
Ctrl + C
```

### 2. Nettoyer et Recompiler

```bash
cd BackRahma
mvn clean install
```

### 3. Relancer le Backend

```bash
mvn spring-boot:run
```

### 4. Attendre le Démarrage

Attendre : `Started BackRahmaApplication`

## 🧪 Tester la Correction

### Test 1 : Sans Photo

```bash
curl -X POST http://localhost:8080/back/api/events \
  -F "name=Test Event Sans Photo" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=2026-05-01" \
  -F "placesLimit=100" \
  -F "description=Test sans photo" \
  -F "location=Test Location" \
  -F "organizerFirstName=John" \
  -F "organizerLastName=Doe"
```

**Résultat attendu :** ✅ Événement créé avec photo par défaut

### Test 2 : Avec Photo

```bash
curl -X POST http://localhost:8080/back/api/events \
  -F "name=Test Event Avec Photo" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=2026-05-01" \
  -F "placesLimit=100" \
  -F "description=Test avec photo" \
  -F "location=Test Location" \
  -F "organizerFirstName=John" \
  -F "organizerLastName=Doe" \
  -F "photo=@/chemin/vers/image.jpg"
```

**Résultat attendu :** ✅ Événement créé avec la photo uploadée

### Test 3 : Date Aujourd'hui

```bash
curl -X POST http://localhost:8080/back/api/events \
  -F "name=Test Event Aujourd'hui" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=$(date +%Y-%m-%d)" \
  -F "placesLimit=100" \
  -F "description=Test date aujourd'hui" \
  -F "location=Test Location" \
  -F "organizerFirstName=John" \
  -F "organizerLastName=Doe"
```

**Résultat attendu :** ✅ Événement créé pour aujourd'hui

### Test 4 : Depuis le Frontend

```typescript
// Dans votre service Angular
const formData = new FormData();
formData.append('name', 'Test Event Frontend');
formData.append('category', 'WORKSHOP');
formData.append('status', 'Upcoming');
formData.append('date', '2026-05-01');
formData.append('placesLimit', '100');
formData.append('description', 'Test depuis frontend');
formData.append('location', 'Test Location');
formData.append('organizerFirstName', 'John');
formData.append('organizerLastName', 'Doe');
// Photo optionnelle
// formData.append('photo', file);

this.http.post('/api/events', formData).subscribe(
  response => console.log('✅ Success:', response),
  error => console.error('❌ Error:', error.error)
);
```

## 🔍 Vérifier les Logs

Si l'erreur persiste, consultez les logs du backend pour voir le message d'erreur détaillé :

```bash
# Les logs s'affichent dans le terminal Spring Boot
# Cherchez les lignes commençant par "Error creating event"
```

## ⚠️ Problèmes Possibles

### 1. Validation des Champs

Assurez-vous que tous les champs obligatoires sont fournis :

- ✅ `name` (String)
- ✅ `category` (WORKSHOP, WEBINAR, CONFERENCE, etc.)
- ✅ `status` (Upcoming, Ongoing, Completed, Cancelled)
- ✅ `date` (format: YYYY-MM-DD)
- ✅ `placesLimit` (Integer, minimum 50)
- ✅ `description` (String)
- ✅ `location` (String)
- ✅ `organizerFirstName` (String)
- ✅ `organizerLastName` (String)
- ⚪ `photo` (optionnel)

### 2. Format de la Date

La date doit être au format ISO : `YYYY-MM-DD`

**✅ Bon :**
```
2026-05-01
```

**❌ Mauvais :**
```
01/05/2026
05-01-2026
2026/05/01
```

### 3. Catégorie Valide

Les catégories valides sont :
- WORKSHOP
- WEBINAR
- CONFERENCE
- TRAINING
- EXAM_PREPARATION
- BUSINESS_ENGLISH
- CULTURAL_EVENT

**Attention :** En MAJUSCULES !

### 4. Status Valide

Les status valides sont :
- Upcoming (première lettre en majuscule)
- Ongoing
- Completed
- Cancelled

### 5. Places Minimum

Le nombre de places doit être >= 50

## 📊 Exemple Complet

```bash
curl -X POST http://localhost:8080/back/api/events \
  -F "name=Workshop Angular Avancé" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=2026-06-15" \
  -F "placesLimit=100" \
  -F "description=Atelier pratique sur Angular 19 avec les dernières fonctionnalités" \
  -F "location=Salle A, Bâtiment 3, Campus Universitaire" \
  -F "organizerFirstName=Ahmed" \
  -F "organizerLastName=Mansour"
```

**Réponse attendue :**
```json
{
  "id": 1,
  "name": "Workshop Angular Avancé",
  "category": "WORKSHOP",
  "status": "Upcoming",
  "date": "2026-06-15",
  "placesLimit": 100,
  "reservedPlaces": 0,
  "description": "Atelier pratique sur Angular 19...",
  "location": "Salle A, Bâtiment 3...",
  "photoUrl": "/uploads/default-event.jpg",
  "organizerFirstName": "Ahmed",
  "organizerLastName": "Mansour"
}
```

## 🎯 Checklist de Vérification

- [ ] Backend arrêté et relancé
- [ ] `mvn clean install` exécuté
- [ ] Message "Started BackRahmaApplication" affiché
- [ ] Tous les champs obligatoires fournis
- [ ] Format de date correct (YYYY-MM-DD)
- [ ] Catégorie en MAJUSCULES
- [ ] Status avec première lettre en majuscule
- [ ] Places >= 50
- [ ] Logs consultés en cas d'erreur

## 📚 Fichiers Modifiés

1. ✅ `BackRahma/src/main/java/pi/backrahma/entity/Event.java`
   - Photo optionnelle
   - Date flexible

2. ✅ `BackRahma/src/main/java/pi/backrahma/Controller/EventController.java`
   - Photo par défaut
   - Message d'erreur détaillé

## 🆘 Si l'Erreur Persiste

### 1. Consulter les Logs Détaillés

```bash
# Dans le terminal Spring Boot, cherchez :
Error creating event
```

### 2. Activer les Logs SQL

```properties
# application.properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### 3. Tester avec JSON

```bash
curl -X POST http://localhost:8080/back/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test JSON",
    "category": "WORKSHOP",
    "status": "Upcoming",
    "date": "2026-05-01",
    "placesLimit": 100,
    "description": "Test",
    "location": "Test",
    "organizerFirstName": "John",
    "organizerLastName": "Doe",
    "photoUrl": "/uploads/default-event.jpg"
  }'
```

### 4. Vérifier la Base de Données

```sql
-- Vérifier que la table existe
USE event-db1;
SHOW TABLES;
DESCRIBE event;

-- Vérifier les événements existants
SELECT * FROM event;
```

---

**L'erreur devrait maintenant être corrigée ! 🎉**

Si le problème persiste, consultez les logs du backend pour voir le message d'erreur exact.
