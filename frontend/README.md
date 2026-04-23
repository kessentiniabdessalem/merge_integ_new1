# Learnify — Frontend (Angular)

Angular 17 frontend for the **Learnify** English-learning platform. Communicates exclusively with the backend via the API Gateway at `http://localhost:8080`.

---

## Tech Stack

| | |
|---|---|
| Framework | Angular 17 (module-based, `AppModule`) |
| Styling | SCSS + CSS custom properties |
| Icons | Tabler Icons (`ti ti-*`) |
| HTTP | Angular `HttpClient` → API Gateway `:8080` |
| Auth | JWT stored in `localStorage` (`token`, `role`, `email`); `userId` decoded from token payload |
| Build | Angular CLI (`ng serve` / `ng build`) |

---

## Project Structure

```
src/app/
├── admin/                  # Admin panel pages
│   ├── courses/            # Course CRUD (list, create, edit, detail)
│   ├── events/             # Event CRUD
│   └── ...
├── pages/                  # Client-facing pages
│   ├── courses/            # Course catalog, detail, study plan AI
│   ├── events/             # Event list, event detail (AI prediction banner)
│   ├── jobs/               # Job board
│   └── ...
├── ai/
│   ├── models/ai.models.ts      # AI request/response interfaces
│   └── services/ai.service.ts  # AI HTTP service
├── services/
│   └── course.service.ts        # Course HTTP service
├── core/
│   └── data.service.ts          # Shared data service (courses + mock events/clubs)
├── models/                      # Shared domain interfaces
├── environments/
│   ├── environment.ts           # Dev: apiBase, courseApiBase, apiGatewayUrl
│   └── environment.prod.ts      # Prod: same keys, same gateway URL
└── app.module.ts                # Root module
```

---

## Environment Configuration

```ts
// environment.ts (dev)
export const environment = {
  production: false,
  apiBase: 'http://localhost:8080/api',
  courseApiBase: 'http://localhost:8080/api/courses',
  apiGatewayUrl: 'http://localhost:8080'
};
```

The same values are mirrored in `environment.prod.ts` for production builds.

---

## Key Features

### Authentication
- JWT login/register via user-service (`/api/auth/**`)
- Google OAuth2 social login
- WebAuthn passkey support
- App PIN secondary lock
- Role-based routing (`ADMIN` vs `USER`)
- `userId` is decoded from the JWT payload (`atob(token.split('.')[1])`), not stored in localStorage

### Course Module
- Public course catalog with search, category, and level filters
- Course detail with module/lesson tree
- Admin CRUD: create, edit, delete courses, modules, and lessons
- AI **Study Plan** generation per course (Gemini-powered)

### Event Module
- Public event list with category filter
- Event detail with reservation flow
- AI **Completion Risk Prediction** banner (`RISQUE_ELEVE` / `RISQUE_FAIBLE`) shown on event detail
- AI **Event Recommendations** section on event list — user selects liked categories, gets top-5 personalized suggestions

### Job Module
- Job board with listings, applications, and saved jobs
- CV profile management
- Meeting scheduling and ratings

### Quiz & Feedback
- Quiz attempts with scoring
- Feedback display per attempt

### Payments & Certificates
- Payment flow for course enrollment
- Certificate display on course completion

### AI Features (via `ai.service.ts`)
| Method | Endpoint | Description |
|---|---|---|
| `generateStudyPlan()` | `POST /api/ai/study-plan` | Generate a multi-week study plan |
| `predictEventCompletion()` | `POST /api/ai/events/predict` | Predict event fill risk |
| `recommendEvents()` | `POST /api/ai/events/recommend` | Get personalized event recommendations |

---

## Running Locally

### Prerequisites
- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`

### Install dependencies

```bash
npm install
```

### Start dev server

```bash
ng serve
```

App available at `http://localhost:4200`. Make sure the backend gateway is running at `http://localhost:8080`.

### Production build

```bash
ng build --configuration production
```

Output in `dist/`. Serve with any static file server or nginx.

---

## API Base URLs

All HTTP calls go through the API Gateway. No service is called directly from the frontend.

| `environment` key | Value | Used by |
|---|---|---|
| `apiBase` | `http://localhost:8080/api` | General API calls |
| `courseApiBase` | `http://localhost:8080/api/courses` | `CourseService` |
| `apiGatewayUrl` | `http://localhost:8080` | AI service, auth, etc. |
