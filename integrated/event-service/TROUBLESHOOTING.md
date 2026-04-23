# 🔧 Guide de Dépannage - Module Event

## 🐛 Problèmes Courants et Solutions

---

## 1. Erreur Content-Type multipart/form-data

### ❌ Erreur
```
Content-Type 'multipart/form-data;boundary=...;charset=UTF-8' is not supported
```

### 🔍 Cause
Le frontend envoie `multipart/form-data` avec `charset=UTF-8`, mais Spring Boot attend exactement `multipart/form-data` sans paramètres supplémentaires.

### ✅ Solution
**Déjà corrigé !** Les annotations `@PostMapping` et `@PutMapping` dans `EventController` n'ont plus de restriction `consumes`, ce qui permet d'accepter tous les Content-Types.

**Avant :**
```java
@PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
```

**Après :**
```java
@PostMapping  // Accepte tous les Content-Types
```

### 🧪 Test
```bash
# Tester avec curl
curl -X POST http://localhost:8080/api/events \
  -F "name=Test Event" \
  -F "category=WORKSHOP" \
  -F "status=Upcoming" \
  -F "date=2026-05-01" \
  -F "placesLimit=100" \
  -F "description=Test" \
  -F "location=Test Location" \
  -F "organizerFirstName=John" \
  -F "organizerLastName=Doe"
```

---

## 2. Erreur CORS

### ❌ Erreur
```
Access to XMLHttpRequest has been blocked by CORS policy
```

### 🔍 Cause
Le frontend (port 4200) essaie d'accéder au backend (port 8080) mais CORS n'est pas configuré.

### ✅ Solution 1 : Utiliser le Proxy (Recommandé)
Le fichier `FrontOffice-main/proxy.conf.json` est déjà configuré :

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

**Dans le frontend, utilisez :**
```typescript
// ✅ BON - Utilise le proxy
this.http.get('/api/events')

// ❌ MAUVAIS - Appel direct
this.http.get('http://localhost:8080/api/events')
```

### ✅ Solution 2 : Configuration CORS Backend
Le fichier `WebConfig.java` est déjà configuré avec CORS :

```java
@CrossOrigin(origins = "*")
```

---

## 3. Port 8080 déjà utilisé

### ❌ Erreur
```
Port 8080 was already in use
```

### ✅ Solution
Modifier le port dans `application.properties` :

```properties
server.port=8081
```

Puis mettre à jour le proxy frontend :
```json
{
  "/api": {
    "target": "http://localhost:8081",
    ...
  }
}
```

---

## 4. Port 4200 déjà utilisé

### ❌ Erreur
```
Port 4200 is already in use
```

### ✅ Solution
Lancer sur un autre port :

```bash
npm start -- --port 4201
```

Ou modifier `package.json` :
```json
{
  "scripts": {
    "start": "ng serve --port 4201"
  }
}
```

---

## 5. Erreur de connexion MySQL

### ❌ Erreur
```
Communications link failure
```

### ✅ Solution

**Vérifier que MySQL tourne :**
```bash
# Windows
net start MySQL80

# Linux
sudo service mysql start

# Mac
brew services start mysql
```

**Vérifier les credentials :**
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE
```

**Créer la base de données :**
```sql
CREATE DATABASE event_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 6. Erreur "Table doesn't exist"

### ❌ Erreur
```
Table 'event_db.event' doesn't exist
```

### ✅ Solution

**Option 1 : Laisser Hibernate créer les tables**
```properties
# application.properties
spring.jpa.hibernate.ddl-auto=update
```

**Option 2 : Créer manuellement**
Voir `DATABASE_SCHEMA.md` pour les scripts SQL.

---

## 7. Erreur de compilation Maven

### ❌ Erreur
```
Compilation failure
```

### ✅ Solution

```bash
# Nettoyer complètement
mvn clean

# Forcer la mise à jour des dépendances
mvn clean install -U

# Vérifier la version de Java
java -version  # Doit être 17+
```

---

## 8. Erreur "npm not found"

### ❌ Erreur
```
'npm' is not recognized as an internal or external command
```

### ✅ Solution

1. Installer Node.js depuis : https://nodejs.org/
2. Redémarrer le terminal
3. Vérifier :
```bash
node --version
npm --version
```

---

## 9. Erreur lors de la génération du PDF

### ❌ Erreur
```
Error generating PDF
```

### ✅ Solution

**Vérifier les dépendances :**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

**Recompiler :**
```bash
mvn clean install
```

---

## 10. Erreur lors de la génération du QR Code

### ❌ Erreur
```
Error generating QR Code
```

### ✅ Solution

**Vérifier les dépendances :**
```xml
<!-- pom.xml -->
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
```

---

## 11. Erreur "Désolé, cet événement est complet"

### ❌ Message
```
Désolé, cet événement est complet.
```

### 🔍 Cause
L'événement a atteint sa limite de places (`reservedPlaces >= placesLimit`).

### ✅ Solution

**Option 1 : Augmenter la limite**
```bash
# Via API (Admin)
curl -X PUT http://localhost:8080/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{"placesLimit": 200, ...}'
```

**Option 2 : Vérifier les places**
```bash
curl http://localhost:8080/api/events/1
```

---

## 12. Erreur "Désolé, cet événement est expiré"

### ❌ Message
```
Désolé, cet événement est expiré.
```

### 🔍 Cause
La date de l'événement est dans le passé.

### ✅ Solution

**Modifier la date :**
```bash
curl -X PUT http://localhost:8080/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-12-31", ...}'
```

---

## 13. Erreur "Vous avez déjà réservé cet événement"

### ❌ Message
```
Vous avez déjà réservé cet événement.
```

### 🔍 Cause
Le participant a déjà une réservation pour cet événement.

### ✅ Solution

**Vérifier les réservations :**
```bash
curl http://localhost:8080/api/reservations/participant/1
```

**Annuler la réservation existante :**
```bash
curl -X DELETE http://localhost:8080/api/reservations/{reservationId}
```

---

## 14. Frontend ne se connecte pas au Backend

### ❌ Erreur
```
ERR_CONNECTION_REFUSED
```

### ✅ Solution

**Vérifier que le backend tourne :**
```bash
curl http://localhost:8080/api/events
```

**Vérifier le proxy :**
```json
// FrontOffice-main/proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

**Relancer le frontend :**
```bash
cd FrontOffice-main
npm start
```

---

## 15. Erreur 404 sur les endpoints

### ❌ Erreur
```
404 Not Found
```

### ✅ Solution

**Vérifier l'URL :**
```bash
# ✅ BON
http://localhost:8080/api/events

# ❌ MAUVAIS
http://localhost:8080/events
```

**Vérifier que le contrôleur est bien annoté :**
```java
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController { ... }
```

---

## 16. Erreur 500 Internal Server Error

### ❌ Erreur
```
500 Internal Server Error
```

### ✅ Solution

**Consulter les logs :**
```bash
# Les logs s'affichent dans le terminal où tourne Spring Boot
```

**Activer les logs détaillés :**
```properties
# application.properties
logging.level.pi.backrahma=DEBUG
spring.jpa.show-sql=true
```

---

## 🔍 Commandes de Diagnostic

### Vérifier que tout fonctionne

```bash
# Backend
curl http://localhost:8080/api/events

# Frontend
curl http://localhost:4200

# MySQL
mysql -u root -p
USE event_db;
SHOW TABLES;
SELECT COUNT(*) FROM event;
exit;
```

### Logs

```bash
# Backend (dans le terminal Spring Boot)
# Les logs s'affichent automatiquement

# Frontend (dans le terminal Angular)
# Les logs s'affichent automatiquement

# MySQL
mysql -u root -p
SHOW PROCESSLIST;
exit;
```

---

## 📚 Ressources

- **Documentation API :** `API_DOCUMENTATION.md`
- **Guide Frontend :** `FRONTEND_GUIDE.md`
- **Schéma BDD :** `DATABASE_SCHEMA.md`
- **Démarrage :** `QUICK_START.md`

---

## 📞 Besoin d'Aide ?

1. Consulter ce guide de dépannage
2. Vérifier les logs (backend et frontend)
3. Tester avec Postman (`POSTMAN_COLLECTION.json`)
4. Consulter la documentation complète

---

**La plupart des problèmes sont déjà résolus dans le code ! 🎉**
