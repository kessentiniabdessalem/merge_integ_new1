# Installation rapide (Windows)

Guide minimal pour **cloner le projet** sur un autre PC et lancer le **front** + les **back** utiles au développement.

---

## 1. Outils à installer

| Outil | Rôle |
|--------|------|
| **Git** | Cloner le dépôt |
| **Node.js** (LTS, ex. 20.x) | Angular + `npm` |
| **Java 17** (JDK) | Microservices Spring Boot |
| **Maven** | `mvn spring-boot:run` (si pas d’IDE qui le fait pour toi) |
| **MySQL** (optionnel au début) | Certains services ; le **pré-évaluation** peut démarrer avec **H2** en mémoire selon la config |

---

## 2. Cloner le projet

**PowerShell** ou **Invite de commandes** :

```powershell
cd $HOME\Documents
git clone https://github.com/yakin653/merge_integ.git
cd merge_integ
```

Ouvre le dossier `merge_integ` dans **Cursor**, **VS Code** ou **IntelliJ**.

---

## 3. Frontend (Angular)

```powershell
cd frontend
npm install
npm start
```

Le site tourne en général sur **http://localhost:4200**.  
Le fichier **`frontend/proxy.conf.mjs`** envoie les préfixes `/api/...` vers les bons ports (ex. **8087** user, **8085** IA, **8089** pré-évaluation) : **les microservices correspondants doivent être démarrés** pour que les pages qui appellent l’API fonctionnent.

---

## 4. Variables d’environnement (secrets)

Les clés **ne sont pas** dans Git. À définir **avant** de lancer les services qui en ont besoin.

**PowerShell (session courante)** — adapte les valeurs :

```powershell
$env:GEMINI_API_KEY="ta_cle_google_gemini"
$env:GOOGLE_CLIENT_ID="ton_client_id_oauth"
$env:GOOGLE_CLIENT_SECRET="ton_secret_oauth"
$env:GROQ_API_KEY="ta_cle_groq"
```

- **Google OAuth** : aussi dans **`integrated/.env`** (copier `integrated/.env.example` → `.env`) si tu utilises **Docker Compose** pour `user-service`.
- **Gemini (IA oral / ai-service)** : voir aussi `integrated/ai-service/src/main/resources/application-secrets.yml.example` → copier vers `application-secrets.yml` **sans** le committer.

---

## 5. Lancer quelques microservices (exemple)

Depuis chaque dossier sous `integrated\`, avec Maven installé :

```powershell
cd integrated\ai-service
mvn spring-boot:run
```

```powershell
cd integrated\preevaluation-service
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

```powershell
cd integrated\user-service
mvn spring-boot:run
```

Ports **souvent** utilisés en local : user **8087**, IA **8085**, pré-évaluation **8089**, Eureka **8761**, gateway **8080** (si tu l’utilises). Vérifie `application.yml` de chaque service si un port est déjà pris.

---

## 6. Ordre conseillé pour un premier test

1. Installer les prérequis (§1).  
2. `git clone` + `npm install` + `npm start` dans `frontend`.  
3. Configurer au moins **`GEMINI_API_KEY`** si tu testes l’**entretien oral avec IA**.  
4. Démarrer **`ai-service`** (8085) + les services dont tu as besoin (ex. **user-service** pour te connecter).  
5. Ouvrir **http://localhost:4200**.

---

## 7. Docs utiles dans ce dépôt

| Fichier | Contenu |
|---------|---------|
| `README-INTEGRATION-IA.md` | Vue d’ensemble de l’intégration IA |
| `IA-NIVEAU-LANGUE-ORAL.md` | Détail de l’IA de niveau CEFR (oral) |

---

## 8. Problèmes fréquents

- **Erreur sur une page API** : le microservice du bon port n’est pas lancé ou le proxy ne correspond pas.  
- **Connexion Google** : `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` manquants ou incorrects.  
- **500 sur pré-évaluation** : base MySQL absente → avec la config actuelle du **preevaluation-service**, **H2** en mémoire peut suffire pour le dev ; sinon lire les logs Java au démarrage.
