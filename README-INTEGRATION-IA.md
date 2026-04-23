# Intégration de l’intelligence artificielle (Learnify / merge_integ)

Ce document décrit **ce qui a été mis en place** pour l’IA dans le projet : architecture, services, endpoints, configuration et parcours utilisateur. Il complète le code sous `integrated/ai-service`, le front Angular et, le cas échéant, la pré-évaluation.

---

## 1. Vue d’ensemble

L’application s’appuie sur **plusieurs usages de l’IA**, avec des responsabilités séparées :

| Zone | Rôle | Moteur / API typique |
|------|------|----------------------|
| **Microservice `ai-service`** | Fonctions transverses (quiz, chat, feedback, événements, **évaluation orale CEFR**) | **Google Gemini** (`gemini-2.5-flash`) via REST |
| **Pré-évaluation (`preevaluation-service`)** | Explications d’erreurs après le test QCM, chat de suivi pédagogique | Fournisseur configurable (**Groq** / compatible OpenAI), clé `GROQ_API_KEY` ou équivalent |
| **Front Angular** | Appels HTTP vers la gateway ou le proxy de dev | `AiService`, pages pré-évaluation |

Le principe général : **les secrets (clés API) ne sont pas commités** ; ils passent par des **variables d’environnement** ou des fichiers locaux listés dans `.gitignore` (voir sections dédiées).

---

## 2. Microservice `ai-service` (port 8085)

### 2.1 Rôle

`ai-service` centralise les fonctionnalités IA consommées par le front (directement ou via **API Gateway**). Il utilise **`GeminiService`** pour appeler l’API **Generative Language** de Google.

### 2.2 Configuration Gemini

Fichier principal : `integrated/ai-service/src/main/resources/application.yml`.

- **`gemini.api.url`** : pointe vers le modèle `gemini-2.5-flash` (`generateContent`).
- **`gemini.api.key`** : lue via **`GEMINI_API_KEY`** ou fichier optionnel **`application-secrets.yml`** (voir `application-secrets.yml.example` — ne pas versionner les vraies clés).

En développement avec Angular (`ng serve`), le proxy (`frontend/proxy.conf.mjs`) route souvent **`/api/ai`** vers **`127.0.0.1:8085`**.

### 2.3 Deux modes d’appel dans `GeminiService`

1. **`chat(systemPrompt, userMessage)`** — texte libre, température ~0,7, utilisé par le chatbot, quiz, feedback, plans d’étude, recommandations d’événements, etc.
2. **`generateJson(fullPrompt, temperature, maxTokens)`** — même endpoint Gemini mais avec **`responseMimeType: application/json`** et température basse (~0,2) pour des réponses **JSON stables** (notamment l’évaluation orale).

Les deux passent la clé en **query parameter** `?key=...`, conformément à l’usage courant de l’API Gemini.

### 2.4 Endpoints REST sous `/api/ai`

Contrôleurs typiques (préfixe **`/api/ai`** aligné avec la gateway) :

| Préfixe / chemin | Usage |
|------------------|--------|
| `/api/ai/chatbot/...` | Chat assistant |
| `/api/ai/quiz/...` | Génération de quiz |
| `/api/ai/feedback/...` | Analyse de feedback / suggestions |
| `/api/ai/study-plan/...` | Plan d’étude |
| `/api/ai/events/...` | Prédiction / recommandation d’événements |
| **`/api/ai/oral-assessment/evaluate`** | **Évaluation du niveau oral (CEFR)** — voir §3 |

En cas d’erreur runtime lors de l’évaluation orale, le contrôleur peut répondre **503** sans corps (service indisponible).

---

## 3. Évaluation orale « réelle » (niveau CEFR par IA)

### 3.1 Problème résolu

L’entretien oral dans le navigateur produit des **transcriptions** et une **estimation locale** (heuristiques dans `oral-interview.scoring.ts`). Pour un **niveau perçu comme plus « réel »**, le backend envoie l’historique **question / réponse** à **Gemini**, qui renvoie une grille CEFR structurée.

### 3.2 Backend

- **DTOs** : `OralAssessmentItem` (question + réponse), `OralAssessmentRequest` (langue `fr`/`en`, niveau cible `B2`/`C1`, liste d’items, strikes anti-triche, session interrompue), `OralAssessmentResponse` (niveau CEFR, confiance, listes forces/faiblesses en français, résumés FR/EN, fournisseur).
- **`OralAssessmentService`** : construit un prompt **examinateur CEFR** (consignes strictes : refus de répondre, hors sujet, strikes → baisse de niveau / confiance), appelle **`generateJson`**, parse le JSON en `OralAssessmentResponse`.
- **`OralAssessmentController`** : `POST /api/ai/oral-assessment/evaluate` avec corps JSON validé (`@Valid`).

### 3.3 Frontend

- **`AiService.evaluateOralAssessment(...)`** → `POST` vers **`/api/ai/oral-assessment/evaluate`** (URL de base = `environment.apiGatewayUrl` + `/api/ai`, ou relatif en dev derrière proxy).
- **`LanguageOralInterviewComponent`** : à la fin d’un entretien réussi, envoie les paires **texte de la question (script oral)** + **réponse transcrite/saisie**, les **strikes**, puis affiche en priorité le **bloc « analyse IA »** ; l’**estimation locale** reste affichée en **secours** si l’API échoue (chargement, erreur réseau, 503).

Routes possibles : `/preevaluation/oral-interview`, `/oral-interview` (selon `app.routes.ts`).

### 3.4 Fichiers utiles (références)

- Backend : `integrated/ai-service/src/main/java/pi/integrated/ai/service/OralAssessmentService.java`, `GeminiService.java`, `controller/OralAssessmentController.java`, `dto/OralAssessment*.java`.
- Front : `frontend/src/app/ai/services/ai.service.ts`, `frontend/src/app/ai/models/ai.models.ts`, `frontend/src/app/pages/preevaluation/language-oral-interview.component.*`, `oral-interview.scoring.ts`, `oral-interview.scripts.ts`.

---

## 4. Routage via API Gateway

Dans `integrated/api-gateway`, les chemins du type **`/api/ai/**`** (ainsi que d’autres préfixes liés au chat / quiz / feedback) sont routés vers le service **`ai-service`** (load balancer Eureka : `lb://ai-service`).

En production, le front pointe en général vers l’URL de la gateway ; en local, le proxy Angular peut cibler directement le port **8085**.

---

## 5. Pré-évaluation : explications d’erreurs (autre microservice)

Le **`preevaluation-service`** n’utilise pas Gemini pour cette partie : il s’agit d’un service dédié (`PreevaluationAiExplanationService`) qui explique les **mauvaises réponses au QCM** et gère un **chat de suivi**, via un client HTTP compatible **OpenAI** (souvent **Groq** en configuration).

Configuration typique dans `application.yml` du pré-évaluation :

- `preevaluation.ai.provider`, `preevaluation.ai.api-key` ← **`GROQ_API_KEY`** (ou vide si désactivé).

Endpoints côté pré-évaluation : par ex. **`/api/preevaluation/ai/explain-mistake`**, **`/api/preevaluation/ai/follow-up`** (JWT étudiant requis).

Cela est **distinct** de l’évaluation orale Gemini dans `ai-service`, mais fait partie du **parcours pédagogique IA** global.

---

## 6. Exploitation et prérequis

### 6.1 Lancer `ai-service`

- Java 17+, Maven.
- **Clé** : définir **`GEMINI_API_KEY`** (ou `application-secrets.yml` local non commité).
- MySQL : le `application.yml` du `ai-service` peut référencer une base `ai_db` ; adaptez ou profilez selon votre environnement.
- Démarrer **Eureka** si vous utilisez la découverte de services ; sinon adaptez la gateway / le proxy.

### 6.2 Vérifier l’évaluation orale

1. Démarrer **`ai-service`** (8085 si config par défaut).
2. Démarrer le front avec proxy vers 8085 pour `/api/ai`.
3. Passer un entretien oral complet et vérifier l’appel réseau **`POST .../oral-assessment/evaluate`** et l’affichage du niveau IA.

---

## 7. Bonnes pratiques sécurité

- Ne jamais committer **`GEMINI_API_KEY`**, secrets Google OAuth, ni clés Groq.
- Utiliser **variables d’environnement** ou fichiers secrets **hors dépôt** (comme `application-secrets.yml`, `.env` pour Docker — voir `.gitignore` et fichiers `.example`).
- En cas de fuite accidentelle sur Git, **révoquer** les clés côté Google / Groq et en régénérer.

---

## 8. Résumé en une phrase

**Nous avons intégré Google Gemini dans `ai-service` pour toutes les fonctions IA centralisées, avec un flux dédié JSON pour l’évaluation orale CEFR consommée par l’entretien Angular ; la pré-évaluation QCM s’appuie sur un autre microservice avec un fournisseur type Groq pour les explications pédagogiques.**

Pour toute évolution (changement de modèle, prompts, champs de réponse), modifier surtout **`GeminiService`**, **`OralAssessmentService`** et les DTO associés, puis aligner **`ai.models.ts`** et le template de **`language-oral-interview`**.
