# Documentation des Fonctionnalités IA — LearnHub 🎓

Ce document récapitule les intégrations d'Intelligence Artificielle (IA) dans le projet **LearnHub**, à utiliser pour la validation avec le professeur.

---

## 🚀 1. Technologies Utilisées
*   **Modèle d'IA** : Google Gemini (via l'API Gemini 1.5).
*   **Architecture** : Un microservice dédié (`ai-service`) en Spring Boot qui communique avec Google Cloud.
*   **Frontend** : Angular 19 utilisant des services dédiés (`ai.service.ts`) pour appeler le backend via une API Gateway.
*   **Computer Vision (Proctoring)** : Utilisation de l'API `FaceDetector` native du navigateur et de traitements d'image sur Canvas.

---

## 🛠️ 2. Fonctionnalités IA par Page

### 🎙️ Page : Entretien Oral (`LanguageOralInterview`)
C'est la fonctionnalité la plus avancée du projet. Elle combine deux types d'IA :
1.  **Évaluation Linguistique** : 
    *   L'IA analyse les réponses de l'étudiant à une série de questions.
    *   Elle renvoie un niveau **CEFR (A1-C2)**, un score de confiance, et un feedback détaillé (points forts/faibles) en français ou anglais.
2.  **Surveillance Anti-Triche (Smart Proctoring)** :
    *   **Détection Faciale** : Vérifie en temps réel que l'étudiant est présent devant la caméra.
    *   **Détection Multi-visages** : Alerte si une deuxième personne est détectée (aide extérieure).
    *   **Analyse du Regard** : Détecte les mouvements de tête excessifs (suspicion de lecture de notes).
    *   **Focus & Fullscreen** : Détecte si l'utilisateur change d'onglet ou quitte le mode plein écran.
    *   **Arrêt Limite** : Le système bloque l'examen automatiquement après 2 alertes majeures.

### 📚 Page : Détails du Cours
*   **Génération de Plan d'Étude** :
    *   L'étudiant peut demander à l'IA de créer un planning d'étude personnalisé.
    *   L'IA analyse le sujet du cours et propose une répartition par semaines avec des objectifs précis.

### 📅 Page : Liste des Événements
*   **Système de Recommandation** :
    *   L'IA suggère les 5 meilleurs événements basés sur les catégories préférées de l'utilisateur.
    *   C'est un moteur de recommandation "Content-Based" alimenté par Gemini.

### 📍 Page : Détails d'un Événement
*   **Prédiction de Risque (Event Risk Prediction)** :
    *   L'IA analyse les données de l'événement et prédit si celui-ci risque d'être complet rapidement ou s'il a peu de succès.
    *   Affiche un badge : `RISQUE ÉLEVÉ` ou `RISQUE FAIBLE`.

---

## 🔄 3. Workflow de l'IA (Flux de données)

Voici le processus étape par étape lorsqu'un utilisateur interagit avec une fonctionnalité IA (ex: validation de l'entretien oral) :

1.  **Étape 1 : Frontend (Angular)** :
    *   Le composant récupère les données (ex: transcription de la voix).
    *   Le `AiService` prépare une requête HTTP POST vers l'**API Gateway** (port 8080).

2.  **Étape 2 : API Gateway** :
    *   La Gateway reçoit l'appel et identifie qu'il concerne l'IA.
    *   Elle redirige la requête vers le microservice **`ai-service`** (port 8085).

3.  **Étape 3 : Backend (Spring Boot)** :
    *   Le **Controller** réceptionne les données.
    *   Le **Service** prépare le prompt final en combinant les réponses de l'élève avec des instructions d'expert (System Prompt).
    *   Le système utilise la **GEMINI_API_KEY** (configurée dans `docker-compose.yml`) pour appeler l'API Google Cloud.

4.  **Étape 4 : Google Gemini (Cloud)** :
    *   L'IA de Google traite la demande et génère une réponse structurée (JSON).

5.  **Étape 5 : Retour & Affichage** :
    *   Le résultat revient au `ai-service`, puis à la Gateway, et enfin au Frontend.
    *   Le composant Angular met à jour l'interface en temps réel pour afficher le résultat.

---

## 💡 4. Points clés pour la Validation (Questions de la Prof)

**Q : Comment l'IA sait-elle si l'élève triche ?**
*R : On utilise le flux vidéo de la caméra que l'on dessine dans un Canvas invisible pour l'analyser chaque seconde via l'API FaceDetector. On suit également les événements système du navigateur (blur, visibilitychange, fullscreen).*

**Q : Quel est l'avantage d'utiliser Gemini par rapport à un algo classique ?**
*R : Gemini est un modèle de langage multimodal. Il ne se contente pas de chercher des mots-clés, il comprend le CONTEXTE et la grammaire de l'étudiant pour donner un score CEFR réaliste, très proche d'une évaluation humaine.*

**Q : Comment assurez-vous la sécurité des données ?**
*R : Les appels à l'IA passent par notre API Gateway et notre microservice `ai-service`. La clé API de Google n'est jamais exposée sur le frontend, elle est sécurisée dans les variables d'environnement du backend.*

---

## 📁 4. Inventaire des Fichiers Clés

### 🧠 Cœur de l'Intelligence Artificielle
*   **`integrated/ai-service/` (Backend)** : 
    *   Contient les contrôleurs et services Spring Boot qui parlent à Google Gemini.
    *   Définit les "System Prompts" (instructions données à l'IA) pour qu'elle se comporte comme un examinateur ou un conseiller d'étude.
*   **`frontend/src/app/ai/services/ai.service.ts`** : 
    *   Le pont entre l'interface et l'IA. 
    *   Envoie les réponses textuelles de l'étudiant au serveur pour évaluation.
*   **`language-oral-interview.component.ts`** :
    *   Gère la **Caméra** : Capture l'image et l'analyse pour détecter les visages.
    *   Gère la **Voix** : Utilise l'API de reconnaissance vocale du navigateur pour transformer l'oral en texte avant de l'envoyer à l'IA.
*   **`oral-interview.scoring.ts`** : 
    *   Algorithme de notation locale. Si internet coupe, il calcule un score basé sur le nombre de mots et les pénalités de sécurité (strikes).

### 📑 Dossier : `pages/preevaluation/` (Le module de test)
*   **`language-oral-interview.component...` (HTML/TS/CSS)** : 
    *   **Utilité** : Interface de l'entretien oral en temps réel.
    *   **IA** : Détection de triche + Envoi des données à Gemini.
*   **`preevaluation-test.component...`** : 
    *   **Utilité** : Le quiz écrit (QCM).
    *   **Détail** : Gère les questions, les minuteurs et la validation des réponses.
*   **`preevaluation-result.component...`** : 
    *   **Utilité** : Affiche le bilan final. 
    *   **IA** : C'est ici que l'on affiche le feedback détaillé généré par l'IA (points forts et faibles).
*   **`preevaluation-cheating-terminated.component...`** : 
    *   **Utilité** : Sécurité. 
    *   **Détail** : Page de redirection forcée si l'IA détecte une triche confirmée (2/2 alertes).
*   **`preevaluation-intro.component`** : Page de bienvenue expliquant le déroulement du test.
*   **`preevaluation-profile.component`** : Formulaire de profil pour personnaliser le test (langue, niveau cible).
*   **`oral-interview.scripts.ts`** : Contient la liste des questions que l'IA pose à l'élève selon son niveau (B2 ou C1).
*   **`preevaluation-shell.component`** : Le cadre (layout) qui contient toutes les pages du module de test.

---

## 📁 5. Fichiers Essentiels à montrer à la prof
1.  **`ai.service.ts`** : Pour montrer comment vous communiquez avec le Cloud.
2.  **`language-oral-interview.component.ts`** : Pour montrer la partie complexe (Caméra/Sécurité).
3.  **`integrated/ai-service/.../GeminiService.java`** (si accessible) : Pour montrer le backend.
4.  **`preevaluation-result.component.html`** : Pour montrer comment les résultats de l'IA sont présentés proprement.




Qui gère les questions ?
Quiz Écrit : C'est le modèle Google Gemini 1.5 (via le service QuizGenerator). Il génère des questions aléatoires selon le sujet.
Entretien Oral : Pour garantir la structure, les questions sont gérées par un script fixe local (oral-interview.scripts.ts). Cependant, l'IA intervient ensuite pour analyser vos réponses.
2. Qui donne les remarques et les notes ?
Responsable : Google Gemini 1.5.
Détail : C'est l'IA qui "lit" vos réponses et décide du niveau (B2, C1) et des feedbacks. Elle est la seule capable de comprendre le sens de ce que vous dites.
3. Qui détecte la sécurité (Anti-triche) ?
Responsable : Logique Locale & Browser API (Pas l'IA Gemini).
Détail : C'est votre code frontend (language-oral-interview.component.ts) qui utilise l'API FaceDetector du navigateur et des algorithmes de détection de focus.
Pourquoi ? Parce que l'analyse doit être instantanée (chaque seconde). Envoyer le flux vidéo à l'IA de Google serait trop lent et trop coûteux.
Résumé pour la prof :
Intelligence Linguistique (Feedback/Notes) : Gérée par l'IA de pointe Google Gemini.
Intelligence Visuelle (Sécurité) : Gérée localement par le moteur de vision du navigateur (plus rapide et sécurisé).
Coordination : Le microservice ai-service orchestre le tout.