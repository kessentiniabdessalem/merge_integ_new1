# Documentation — Module IA (`/ai`)

> **Emplacement :** `frontend/src/app/ai/`  
> **Backend cible :** API Gateway → `http://<gateway>/api/ai`  
> **Port local du service IA :** `8082`

---

## Table des matières

1. [Architecture du module](#1-architecture-du-module)
2. [Service principal — `AiService`](#2-service-principal--aiservice)
3. [Modèles de données — `ai.models.ts`](#3-modèles-de-données--aimodelsts)
4. [Composants](#4-composants)
   - [QuizGeneratorComponent](#41-quizgeneratorcomponent)
   - [AiFeedbackComponent](#42-aifeedbackcomponent)
5. [Routes](#5-routes)
6. [Tableau récapitulatif des endpoints](#6-tableau-récapitulatif-des-endpoints)

---

## 1. Architecture du module

```
src/app/ai/
├── ai.module.ts                          # Module Angular (lazy-loaded)
├── ai.routes.ts                          # Routes enfants du module
├── AI-SERVICE.md                         # Cette documentation
├── models/
│   └── ai.models.ts                      # Interfaces TypeScript (DTOs)
├── services/
│   └── ai.service.ts                     # Service HTTP centralisé
└── components/
    ├── quiz-generator/
    │   ├── quiz-generator.component.ts   # Logique génération de quiz
    │   ├── quiz-generator.component.html # Formulaire + affichage du quiz
    │   └── quiz-generator.component.scss # Styles
    └── ai-feedback/
        ├── ai-feedback.component.ts      # Logique feedback personnalisé
        ├── ai-feedback.component.html    # Affichage forces / faiblesses
        └── ai-feedback.component.scss    # Styles
```

Le module est **lazy-loaded** via `RouterModule.forChild(AI_ROUTES)` — il n'est chargé que lorsqu'une route `/ai/**` est visitée.

---

## 2. Service principal — `AiService`

**Fichier :** `services/ai.service.ts`  
**Injection :** `providedIn: 'root'` (singleton global)  
**Base URL :** `environment.apiGatewayUrl + /api/ai`

### Méthodes disponibles

---

### `generateQuiz(request: QuizGenerationRequest): Observable<GeneratedQuiz>`

Génère un quiz complet via Google Gemini en fournissant un sujet, une difficulté et un type de question.

```
POST /api/ai/quiz/generate
Body : QuizGenerationRequest
```

**Utilisé par :** `QuizGeneratorComponent`

---

### `getSuggestedTopics(): Observable<string[]>`

Récupère une liste de sujets suggérés à proposer à l'utilisateur dans le formulaire de génération.

```
GET /api/ai/quiz/topics
```

**Utilisé par :** `QuizGeneratorComponent.loadSuggestedTopics()`

---

### `analyzeFeedback(request: FeedbackAnalysisRequest): Observable<PersonalizedFeedback>`

Analyse les résultats d'une tentative de quiz et retourne un feedback personnalisé (forces, faiblesses, recommandations, message motivant).

```
POST /api/ai/feedback/analyze
Body : FeedbackAnalysisRequest
```

**Utilisé par :** `AiFeedbackComponent`

---

### `generateFeedbackSuggestions(request: FeedbackSuggestionRequest): Observable<FeedbackSuggestion>`

Génère des suggestions de feedback courtes et ciblées pour un quiz donné (sans passer par une tentative complète).

```
POST /api/ai/feedback/suggestions
Body : FeedbackSuggestionRequest
```

---

### `generateStudyPlan(request: StudyPlanRequest): Observable<StudyPlanResponse>`

Génère un plan d'étude personnalisé pour un cours donné en fonction du niveau et de la durée disponible.

```
POST /api/ai/study-plan/generate
Body : StudyPlanRequest
```

---

### `chat(message: string): Observable<any>`

Envoie un message au chatbot IA et retourne la réponse.

```
POST /api/ai/chatbot/chat
Body : { message: string }
```

---

### `predictEventCompletion(request: EventPredictionRequest): Observable<EventPredictionResponse>`

Prédit le niveau de risque d'un événement (risque de remplissage / annulation) à partir de ses statistiques (likes, réservations, places restantes).

```
POST /api/ai/events/predict
Body : EventPredictionRequest
```

**Valeurs retournées :** `'RISQUE_ELEVE'` ou `'RISQUE_FAIBLE'`

---

### `recommendEvents(request: EventRecommendationRequest): Observable<EventRecommendedEvent[]>`

Recommande des événements à un utilisateur en fonction de ses catégories préférées et des événements disponibles.

```
POST /api/ai/events/recommend
Body : EventRecommendationRequest
```

---

### `evaluateOralAssessment(request: OralAssessmentRequestDto): Observable<OralAssessmentResponseDto>`

Évalue un entretien oral en langue étrangère. Retourne le niveau CEFR estimé, le degré de confiance, les forces et faiblesses, et un résumé en français et en anglais.  
Prend en compte les **strikes de sécurité** (anti-fraude) et si la session a été terminée prématurément.

```
POST /api/ai/oral-assessment/evaluate
Body : OralAssessmentRequestDto
```

**Utilisé par :** `LanguageOralInterviewComponent` (module `preevaluation`)

---

## 3. Modèles de données — `ai.models.ts`

**Fichier :** `models/ai.models.ts`

---

### `QuizGenerationRequest`

Paramètres envoyés pour demander la génération d'un quiz.

| Champ | Type | Description |
|---|---|---|
| `topic` | `string` | Sujet du quiz (ex : "Java OOP", "SQL Basics") |
| `difficulty` | `string` | Niveau : `'EASY'` / `'MEDIUM'` / `'HARD'` |
| `questionCount` | `number` | Nombre de questions (1 – 20) |
| `questionType` | `string` | Type : `'MULTIPLE_CHOICE'` / `'TRUE_FALSE'` / `'SHORT_ANSWER'` |

---

### `GeneratedQuiz`

Quiz retourné par l'IA après génération.

| Champ | Type | Description |
|---|---|---|
| `title` | `string` | Titre du quiz généré |
| `description` | `string` | Description du contenu |
| `suggestedPassingScore` | `number?` | Score de passage conseillé (%) |
| `suggestedTimeLimit` | `number?` | Durée conseillée en minutes |
| `questions` | `GeneratedQuestion[]` | Liste des questions générées |

---

### `GeneratedQuestion`

Une question générée par l'IA.

| Champ | Type | Description |
|---|---|---|
| `text` | `string` | Énoncé de la question |
| `type` | `string` | Type de question |
| `options` | `string[]` | Choix de réponse (vide pour SHORT_ANSWER) |
| `correctAnswer` | `string` | Réponse correcte |
| `points` | `number` | Points attribués |
| `explanation` | `string` | Explication de la bonne réponse |

---

### `FeedbackAnalysisRequest`

Données d'une tentative de quiz à analyser.

| Champ | Type | Description |
|---|---|---|
| `attemptId` | `number` | Identifiant de la tentative |
| `quizTitle` | `string` | Titre du quiz |
| `score` | `number` | Score obtenu |
| `totalPoints` | `number` | Score maximum possible |
| `questionResults` | `QuestionResult[]` | Détail par question |

---

### `QuestionResult`

Résultat pour une question individuelle.

| Champ | Type | Description |
|---|---|---|
| `questionText` | `string` | Texte de la question |
| `userAnswer` | `string` | Réponse donnée par l'utilisateur |
| `correctAnswer` | `string` | Bonne réponse |
| `isCorrect` | `boolean` | Si la réponse était correcte |

---

### `PersonalizedFeedback`

Feedback retourné après analyse d'une tentative.

| Champ | Type | Description |
|---|---|---|
| `overallFeedback` | `string` | Bilan général de la performance |
| `strengths` | `string[]` | Points forts identifiés |
| `weaknesses` | `string[]` | Points à améliorer |
| `recommendations` | `string[]` | Conseils personnalisés |
| `motivationalMessage` | `string` | Message d'encouragement |

---

### `FeedbackSuggestionRequest`

Requête pour générer des suggestions de feedback rapides.

| Champ | Type | Description |
|---|---|---|
| `quizId` | `number?` | Identifiant du quiz |
| `quizTitle` | `string` | Titre du quiz |
| `attemptId` | `number?` | Identifiant de la tentative |
| `score` | `number` | Score obtenu |
| `totalPoints` | `number` | Score maximum |
| `difficulty` | `string?` | Difficulté du quiz |
| `topic` | `string?` | Sujet abordé |

---

### `FeedbackSuggestion`

Suggestions courtes retournées.

| Champ | Type | Description |
|---|---|---|
| `suggestions` | `string[]` | Liste de suggestions textuelles |
| `tone` | `string` | Ton employé (encourageant, neutre…) |
| `focusArea` | `string` | Domaine à travailler en priorité |

---

### `StudyPlanRequest`

Paramètres pour générer un plan d'étude.

| Champ | Type | Description |
|---|---|---|
| `courseTitle` | `string` | Titre du cours |
| `courseDescription` | `string?` | Description du cours |
| `level` | `string?` | Niveau de l'étudiant |
| `durationMinutes` | `number?` | Temps disponible pour étudier |
| `extraContext` | `string?` | Contexte supplémentaire libre |

---

### `StudyPlanResponse`

Plan d'étude retourné.

| Champ | Type | Description |
|---|---|---|
| `courseTitle` | `string` | Titre du cours concerné |
| `advice` | `string` | Plan d'étude en texte libre |

---

### `OralAssessmentRequestDto`

Données de l'entretien oral à évaluer (utilisé par la pré-évaluation).

| Champ | Type | Description |
|---|---|---|
| `language` | `string` | Langue de l'entretien (`'fr'` / `'en'`) |
| `targetLevel` | `string` | Niveau CEFR visé (`'B2'` / `'C1'`) |
| `items` | `OralAssessmentItemDto[]` | Paires question / réponse transcrites |
| `securityStrikes` | `number` | Nombre d'alertes anti-fraude déclenchées |
| `sessionTerminatedEarly` | `boolean` | `true` si la session a été arrêtée pour fraude |

---

### `OralAssessmentItemDto`

Une paire question / réponse de l'entretien.

| Champ | Type | Description |
|---|---|---|
| `question` | `string` | Question posée par l'examinateur IA |
| `answer` | `string` | Transcription de la réponse du candidat |

---

### `OralAssessmentResponseDto`

Évaluation retournée après l'entretien oral.

| Champ | Type | Description |
|---|---|---|
| `cefrLevel` | `string` | Niveau CEFR estimé (ex : `'B2'`, `'C1'`) |
| `confidence` | `number` | Degré de confiance de l'évaluation (0–1) |
| `strengthsFr` | `string[]` | Points forts en français |
| `weaknessesFr` | `string[]` | Points faibles en français |
| `summaryFr` | `string` | Résumé de l'évaluation en français |
| `summaryEn` | `string` | Résumé de l'évaluation en anglais |
| `provider` | `string` | Fournisseur IA utilisé (ex : `'gemini'`) |

---

### `EventPredictionRequest`

Données pour prédire le risque d'un événement.

| Champ | Type | Description |
|---|---|---|
| `likes` | `number` | Nombre de likes sur l'événement |
| `reservations` | `number` | Nombre de réservations actuelles |
| `placesRestantes` | `number` | Places encore disponibles |

---

### `EventPredictionResponse`

Résultat de la prédiction.

| Champ | Type | Description |
|---|---|---|
| `result` | `'RISQUE_ELEVE' \| 'RISQUE_FAIBLE'` | Niveau de risque prédit |
| `reason` | `string` | Explication textuelle du résultat |

---

### `EventRecommendationRequest`

Données pour obtenir des recommandations d'événements.

| Champ | Type | Description |
|---|---|---|
| `categoriesLiked` | `string[]` | Catégories appréciées par l'utilisateur |
| `availableEvents` | `EventRecommendedEvent[]` | Événements candidats à recommander |

---

### `EventRecommendedEvent`

Un événement candidat à la recommandation.

| Champ | Type | Description |
|---|---|---|
| `id` | `number` | Identifiant de l'événement |
| `name` | `string` | Nom de l'événement |
| `category` | `string` | Catégorie |
| `date` | `string` | Date au format ISO |
| `description` | `string` | Description courte |
| `availableSeats` | `number` | Places disponibles |

---

## 4. Composants

### 4.1 `QuizGeneratorComponent`

**Route :** `/ai/generator`  
**Fichier :** `components/quiz-generator/quiz-generator.component.ts`

#### Rôle

Formulaire interactif permettant à un instructeur de générer un quiz via l'IA, de le visualiser question par question, puis de le sauvegarder sur la plateforme.

#### Flux principal

```
1. ngOnInit → getSuggestedTopics()      // Charge les sujets suggérés
2. Utilisateur remplit le formulaire
3. generateQuiz() → AiService.generateQuiz()
4. Affichage du quiz en accordéon
5. saveQuiz() → QuizService.create()    // Crée le quiz en base
              → QuestionService.create() (×N) // Sauvegarde chaque question
6. reset()                              // Réinitialise le formulaire
```

#### État du composant

| Propriété | Type | Description |
|---|---|---|
| `request` | `QuizGenerationRequest` | Paramètres du formulaire |
| `generatedQuiz` | `GeneratedQuiz \| null` | Quiz retourné par l'IA |
| `loading` | `boolean` | Indicateur de chargement |
| `error` | `string` | Message d'erreur affiché |
| `successMessage` | `string` | Message de succès après sauvegarde |
| `courseId` | `number` | ID du cours cible pour la sauvegarde |
| `suggestedTopics` | `string[]` | Sujets proposés dans le formulaire |

#### Gestion des erreurs

| Code HTTP | Message affiché |
|---|---|
| `0` (réseau) | Service IA inaccessible, vérifier le port 8082 |
| `500` | Erreur de génération, vérifier la clé API Gemini |
| Autre | Message d'erreur générique |

---

### 4.2 `AiFeedbackComponent`

**Route :** `/ai/feedback/:attemptId`  
**Fichier :** `components/ai-feedback/ai-feedback.component.ts`

#### Rôle

Affiche un feedback personnalisé généré par l'IA après qu'un étudiant a complété une tentative de quiz.

#### Flux principal

```
1. ngOnInit → lecture du paramètre attemptId depuis l'URL
2. QuizAttemptService.getById(attemptId) → récupère les données de la tentative
3. AiService.analyzeFeedback(request) → génère le feedback IA
4. Affichage : bilan général, forces, faiblesses, recommandations, message motivant
```

#### Sections affichées

| Section | Condition d'affichage |
|---|---|
| Bilan général (`overallFeedback`) | Toujours |
| Forces (`strengths`) | `strengths.length > 0` |
| Points à améliorer (`weaknesses`) | `weaknesses.length > 0` |
| Recommandations | `recommendations.length > 0` |
| Message motivant | Toujours (fond dégradé violet) |

---

## 5. Routes

**Fichier :** `ai.routes.ts`

| Chemin | Composant | Description |
|---|---|---|
| `/ai` | — | Redirige vers `/ai/generator` |
| `/ai/generator` | `QuizGeneratorComponent` | Générateur de quiz IA |
| `/ai/feedback/:attemptId` | `AiFeedbackComponent` | Feedback personnalisé post-quiz |

---

## 6. Tableau récapitulatif des endpoints

| Méthode | Endpoint | Modèle envoyé | Modèle reçu | Fonctionnalité |
|---|---|---|---|---|
| `POST` | `/api/ai/quiz/generate` | `QuizGenerationRequest` | `GeneratedQuiz` | Génération de quiz via Gemini |
| `GET` | `/api/ai/quiz/topics` | — | `string[]` | Sujets suggérés |
| `POST` | `/api/ai/feedback/analyze` | `FeedbackAnalysisRequest` | `PersonalizedFeedback` | Analyse d'une tentative |
| `POST` | `/api/ai/feedback/suggestions` | `FeedbackSuggestionRequest` | `FeedbackSuggestion` | Suggestions de feedback rapides |
| `POST` | `/api/ai/study-plan/generate` | `StudyPlanRequest` | `StudyPlanResponse` | Plan d'étude personnalisé |
| `POST` | `/api/ai/chatbot/chat` | `{ message: string }` | `any` | Chatbot IA |
| `POST` | `/api/ai/events/predict` | `EventPredictionRequest` | `EventPredictionResponse` | Prédiction risque événement |
| `POST` | `/api/ai/events/recommend` | `EventRecommendationRequest` | `EventRecommendedEvent[]` | Recommandation d'événements |
| `POST` | `/api/ai/oral-assessment/evaluate` | `OralAssessmentRequestDto` | `OralAssessmentResponseDto` | Évaluation entretien oral CEFR |
