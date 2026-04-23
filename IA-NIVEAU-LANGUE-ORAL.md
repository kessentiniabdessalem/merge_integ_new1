# IA de niveau de langue (entretien oral) — description

Ce fichier décrit **l’intelligence artificielle** qui attribue un **niveau CEFR** après l’entretien oral FR/EN, **ce que nous avons codé**, et **ce qu’elle utilise / interprète** (ce n’est pas une détection technique type caméra : tout repose sur le **texte** des questions/réponses + le **contexte anti-triche** envoyé au modèle).

---

## 1. Qu’est-ce que cette IA ?

- **Moteur** : **Google Gemini** (`gemini-2.5-flash`), appelé depuis le microservice **`ai-service`** (Java).
- **Rôle** : jouer le rôle d’un **examinateur CEFR** sur un entretien **professionnel** : à partir des **échanges écrits/transcrits** (questions posées + réponses du candidat), le modèle produit :
  - un **niveau global** : **A1, A2, B1, B2, C1 ou C2** ;
  - un **score de confiance** entre **0 et 1** ;
  - des **points forts** et **points faibles** (listes en français) ;
  - un **résumé court** en français et en anglais.
- **Format** : le backend impose une réponse **JSON** (`responseMimeType: application/json`) avec une **température basse** (≈ 0,2) pour des résultats plus stables.

Ce n’est **pas** une analyse audio brute (pas de fichier vocal envoyé à l’IA) : les réponses viennent de la **reconnaissance vocale du navigateur** et/ou de la **saisie manuelle**, comme texte.

---

## 2. Qu’est-ce que nous avons fait (implémentation) ?

### Côté backend (`integrated/ai-service`)

| Élément | Rôle |
|--------|------|
| `OralAssessmentService` | Construit le **prompt système** (consignes examinateur CEFR) + le **corps utilisateur** (contexte + Q/R), appelle Gemini en mode JSON, **parse** la réponse en objet Java. |
| `GeminiService.generateJson(...)` | Appel API Gemini avec **`responseMimeType: application/json`**. |
| `OralAssessmentController` | Expose **`POST /api/ai/oral-assessment/evaluate`**. En cas d’erreur d’appel : réponse **503**. |
| DTO `OralAssessmentRequest` | Langue (`fr` / `en`), niveau cible (`B2` / `C1`), liste de **question + réponse**, **nombre de strikes** anti-triche, **session terminée tôt** (fraude). |
| DTO `OralAssessmentResponse` | `cefrLevel`, `confidence`, `strengthsFr`, `weaknessesFr`, `summaryFr`, `summaryEn`, `provider`. |
| Configuration | Clé API **`GEMINI_API_KEY`** (ou fichier local non commité type `application-secrets.yml`). |

### Côté frontend (`frontend`)

| Élément | Rôle |
|--------|------|
| `AiService.evaluateOralAssessment(...)` | Envoie le **POST** vers `/api/ai/oral-assessment/evaluate`. |
| `LanguageOralInterviewComponent` | À la fin d’un entretien **réussi**, construit la liste **question (texte lu par l’examinatrice) + réponse**, appelle l’API, affiche le **bloc « analyse IA »** en priorité. |
| `oral-interview.scoring.ts` | **Estimation locale** (règles sur le texte) : **secours** si l’API IA échoue ou est indisponible. |

### Routage

- En dev, le proxy Angular envoie souvent **`/api/ai`** vers le port **8085**.
- En intégration complète, l’**API Gateway** route **`/api/ai/**`** vers **`ai-service`**.

---

## 3. Qu’est-ce que l’IA « détecte » ou prend en compte ?

Ici, **« détecter »** signifie : **ce que le modèle lit dans le texte** et **ce que les consignes lui demandent d’en déduire**, plus **deux nombres de contexte** envoyés par l’application (pas calculés par Gemini).

### 3.1 Données envoyées explicitement au modèle

Pour chaque tour, le backend envoie :

- **La question** telle qu’elle est dans le script oral (texte de l’examinatrice).
- **La réponse** du candidat (transcription + saisie fusionnées côté front).
- **Contexte global** :
  - **`securityStrikes`** : nombre d’**alertes sécurité** pendant la session (ex. visage absent, onglet masqué, etc.) ;
  - **`sessionTerminatedEarly`** : `true` si la session a été **coupée** pour fraude (normalement ce cas n’envoie pas toujours l’évaluation « OK » selon le parcours).

Le modèle **ne reçoit pas** de flux vidéo ni de fichier audio : uniquement **texte** et ces **deux indicateurs** de contexte.

### 3.2 Comportements que les consignes demandent à l’IA d’interpréter (qualitatif)

Dans le prompt système, nous demandons à Gemini de **baisser le niveau** ou la **confiance** lorsque le contenu ou le contexte correspond à :

| Thème | Intention dans le prompt |
|--------|---------------------------|
| **Refus / vide / hors sujet** | Si le candidat **refuse souvent de répondre**, donne des réponses **vides** ou **hors sujet**, le niveau doit **fortement baisser** (souvent vers **A2–B1** selon le cas). |
| **Anti-triche** | Si **strikes élevés** ou **session terminée tôt**, **pénaliser la confiance** et le **niveau** (l’évaluation est moins fiable ou plus sévère). |
| **Niveau CEFR global** | Une synthèse sur **tout l’entretien**, en tenant compte de la **langue** (`fr` / `en`) et du **niveau cible** du parcours (`B2` / `C1`). |

Concrètement, l’IA **analyse le langage** dans les réponses : richesse lexicale, cohérence, capacité à développer, pertinence par rapport à la question — de manière **holistique** (comme un correcteur humain lisant le script), **sans liste fermée de regex** côté serveur.

### 3.3 Estimation locale (secours) — ce que le navigateur « détecte » en plus

Si l’appel Gemini échoue, l’UI s’appuie sur **`estimateOralLevel`** (`oral-interview.scoring.ts`). Là, ce sont des **règles déterministes** sur le texte, par exemple :

- phrases type **« je ne sais pas »** / **I don’t know** avec peu de mots ;
- réponses **trop courtes** (seuil de mots) ;
- **diversité lexicale**, **mots longs**, **pénalités** liées aux strikes, **plafonds** de niveau avec **messages explicatifs** (FR/EN).

Cette partie **n’est pas Gemini** : elle sert de **filet de sécurité** et d’**indication** si l’IA n’est pas disponible.

---

## 4. Limites importantes

- L’évaluation IA dépend de la **qualité de la transcription** (micro, navigateur, langue).
- Sans **clé `GEMINI_API_KEY`** valide, l’endpoint ne peut pas répondre correctement (erreur ou 503).
- Le niveau reste une **indication pédagogique**, pas un certificat officiel.

---

## 5. Fichiers de code utiles

- Backend : `integrated/ai-service/src/main/java/pi/integrated/ai/service/OralAssessmentService.java`, `GeminiService.java`, `controller/OralAssessmentController.java`, `dto/OralAssessment*.java`
- Front : `frontend/src/app/pages/preevaluation/language-oral-interview.component.ts`, `frontend/src/app/ai/services/ai.service.ts`, `frontend/src/app/pages/preevaluation/oral-interview.scoring.ts`

---

*Document généré pour décrire l’IA de niveau de langue (oral) telle qu’implémentée dans ce dépôt.*
