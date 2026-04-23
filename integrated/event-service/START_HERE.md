# 🎉 Bienvenue dans le Module Event Management !

## 👋 Commencez ici

Vous êtes développeur backend, frontend, ou testeur ? Ce guide vous aidera à démarrer rapidement.

---

## 🚀 Démarrage Ultra-Rapide (5 minutes)

### 1️⃣ Configuration (1 min)
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE event_db;
exit;
```

### 2️⃣ Lancement (1 min)
```bash
cd BackRahma
mvn spring-boot:run
```

### 3️⃣ Test (3 min)
```bash
# Tester l'API
curl http://localhost:8080/api/events

# Ou importer POSTMAN_COLLECTION.json dans Postman
```

✅ **C'est prêt !** L'API tourne sur http://localhost:8080

---

## 🎯 Vous êtes...

### 👨‍💻 Développeur Backend ?

**Lisez dans cet ordre :**
1. 📖 [README_EVENT_MODULE.md](README_EVENT_MODULE.md) - Vue d'ensemble (15 min)
2. 🗄️ [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Schéma BDD (15 min)
3. 🔌 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Endpoints REST (30 min)
4. 🎟️ [RESERVATION_FLOW.md](RESERVATION_FLOW.md) - Logique métier (10 min)

**Ensuite :**
- Explorez le code dans `src/main/java/pi/backrahma/`
- Lancez les tests : `mvn test`
- Consultez [MAVEN_COMMANDS.md](MAVEN_COMMANDS.md) pour les commandes utiles

### 🎨 Développeur Frontend ?

**Lisez dans cet ordre :**
1. 📱 [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) - Guide Angular (20 min)
2. 🔌 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Services et exemples (30 min)
3. 📋 [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json) - Tester les endpoints

**Ensuite :**
- Créez votre projet Angular : `ng new event-frontend`
- Copiez les services depuis API_DOCUMENTATION.md
- Configurez le proxy : voir FRONTEND_GUIDE.md

### 🧪 Testeur / QA ?

**Outils disponibles :**
1. 📮 [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json) - Collection complète
2. 💻 [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) - Scripts de test
3. 🗄️ [TEST_DATA.sql](TEST_DATA.sql) - Données de test

**Scénarios de test :**
- Réservation réussie
- Réservation échouée (événement complet)
- Réservation échouée (événement expiré)
- Like/Unlike
- Recherche et filtrage

### 📊 Chef de Projet ?

**Documents clés :**
1. 📖 [README_EVENT_MODULE.md](README_EVENT_MODULE.md) - Vue d'ensemble
2. ✅ [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Fonctionnalités
3. 📚 [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Index complet

**Fonctionnalités livrées :**
- ✅ CRUD événements
- ✅ Système de réservation avec validation
- ✅ Génération tickets PDF + QR code
- ✅ Système de likes
- ✅ Recherche et filtrage
- ✅ Statistiques admin

---

## 📚 Documentation Complète

### 🎯 Essentiel
| Fichier | Description | Temps |
|---------|-------------|-------|
| [QUICK_START.md](QUICK_START.md) | Démarrage en 5 min | ⚡ 5 min |
| [README_EVENT_MODULE.md](README_EVENT_MODULE.md) | Documentation principale | 📖 15 min |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Résumé complet | ✅ 10 min |

### 🔧 Technique
| Fichier | Description | Temps |
|---------|-------------|-------|
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Endpoints REST + exemples | 🔌 30 min |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Schéma BDD | 🗄️ 15 min |
| [RESERVATION_FLOW.md](RESERVATION_FLOW.md) | Flux de réservation | 🎟️ 10 min |

### 💻 Frontend
| Fichier | Description | Temps |
|---------|-------------|-------|
| [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) | Guide Angular | 🎨 20 min |

### 🧪 Tests
| Fichier | Description | Type |
|---------|-------------|------|
| [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json) | Collection Postman | 📮 Import |
| [CURL_EXAMPLES.sh](CURL_EXAMPLES.sh) | Scripts curl | 💻 Script |
| [TEST_DATA.sql](TEST_DATA.sql) | Données de test | 🗄️ SQL |

### 🔧 Utilitaires
| Fichier | Description |
|---------|-------------|
| [MAVEN_COMMANDS.md](MAVEN_COMMANDS.md) | Commandes Maven utiles |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Index complet |

---

## 🎓 Parcours d'Apprentissage

### 🟢 Niveau Débutant (30 min)
```
START_HERE.md (vous y êtes !)
    ↓
QUICK_START.md (5 min)
    ↓
README_EVENT_MODULE.md (15 min)
    ↓
IMPLEMENTATION_SUMMARY.md (10 min)
```

### 🟡 Niveau Intermédiaire (1h30)
```
DATABASE_SCHEMA.md (15 min)
    ↓
API_DOCUMENTATION.md (30 min)
    ↓
RESERVATION_FLOW.md (10 min)
    ↓
Explorer le code (30 min)
    ↓
Lancer les tests (5 min)
```

### 🔴 Niveau Avancé (2h)
```
Tout lire ci-dessus
    ↓
FRONTEND_GUIDE.md (20 min)
    ↓
Créer un projet Angular (30 min)
    ↓
Implémenter les services (30 min)
    ↓
Créer les composants (40 min)
```

---

## 🔥 Quick Actions

### Je veux...

#### 🚀 Lancer l'application
```bash
cd BackRahma
mvn spring-boot:run
```

#### 🧪 Tester l'API
```bash
# Avec curl
bash CURL_EXAMPLES.sh

# Avec Postman
# Importer POSTMAN_COLLECTION.json
```

#### 📊 Voir les statistiques
```bash
curl http://localhost:8080/api/events/statistics
```

#### 🎟️ Créer une réservation
```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"eventId": 1, "participantId": 1}'
```

#### 📥 Télécharger un ticket
```
http://localhost:8080/api/reservations/1/ticket
```

#### 🗄️ Insérer des données de test
```bash
mysql -u root -p event_db < TEST_DATA.sql
```

#### 🔍 Rechercher des événements
```bash
curl "http://localhost:8080/api/events/search?keyword=workshop"
```

---

## 🎯 Fonctionnalités Principales

### Pour les Administrateurs
- ✅ CRUD complet des événements
- ✅ Gestion du status (Upcoming, Ongoing, Completed, Cancelled)
- ✅ Consultation des réservations
- ✅ Statistiques (total events, réservations, top events)

### Pour les Participants
- ✅ Consulter les événements
- ✅ Recherche par mot-clé
- ✅ Filtrage par catégorie et status
- ✅ Pagination
- ✅ Like / Unlike
- ✅ Réserver un événement
- ✅ Télécharger ticket PDF avec QR code

### Système de Réservation
- ✅ Validation automatique (status, date, places)
- ✅ Génération code unique (TKT-XXXXXXXX)
- ✅ Génération QR code
- ✅ Export PDF professionnel
- ✅ Messages d'erreur personnalisés

---

## 🛠️ Technologies Utilisées

### Backend
- ☕ Java 17
- 🍃 Spring Boot 3.3.2
- 🗄️ MySQL 8.0
- 📦 Maven
- 🔧 Lombok

### Librairies
- 📄 iText7 (PDF)
- 📱 ZXing (QR Code)
- ✅ JUnit 5 (Tests)

### Frontend (Recommandé)
- 🅰️ Angular 19
- 🎨 Angular Material / PrimeNG
- 🎯 TypeScript

---

## 📞 Besoin d'Aide ?

### 🔍 Recherche Rapide
Consultez [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) pour trouver rapidement ce que vous cherchez.

### 🐛 Problèmes Courants

**Port 8080 déjà utilisé ?**
```properties
# application.properties
server.port=8081
```

**Erreur de connexion MySQL ?**
```bash
# Vérifier MySQL
sudo service mysql status

# Vérifier les credentials
mysql -u root -p
```

**Dépendances Maven ?**
```bash
mvn clean install -U
```

### 📚 Ressources Externes
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Angular Docs](https://angular.io/docs)
- [MySQL Docs](https://dev.mysql.com/doc/)

---

## ✨ Prochaines Étapes

### Immédiat
1. ✅ Lancer l'application
2. ✅ Tester avec Postman
3. ✅ Explorer la documentation

### Court Terme
1. 🔐 Ajouter l'authentification (Spring Security + JWT)
2. 📧 Système de notifications par email
3. 🧪 Tests d'intégration

### Long Terme
1. 💳 Paiement en ligne
2. 📊 Analytics avancés
3. 📱 Application mobile

---

## 🎉 Félicitations !

Vous avez maintenant toutes les informations pour :
- ✅ Comprendre le système
- ✅ Lancer l'application
- ✅ Tester les fonctionnalités
- ✅ Développer le frontend
- ✅ Étendre les fonctionnalités

**Bon développement ! 🚀**

---

## 📋 Checklist de Démarrage

- [ ] Base de données créée
- [ ] application.properties configuré
- [ ] Application lancée
- [ ] Données de test insérées
- [ ] API testée avec Postman
- [ ] Documentation lue
- [ ] Prêt à développer !

---

**💡 Astuce :** Gardez ce fichier ouvert pendant votre développement pour accéder rapidement à la documentation !
