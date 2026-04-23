import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CourseListComponent } from './pages/courses/course-list/course-list.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { EventsComponent } from './pages/events/events.component';
import { MessengerComponent } from './pages/messenger/messenger.component';
import { PreevaluationShellComponent } from './pages/preevaluation/preevaluation-shell.component';
import { PreevaluationIntroComponent } from './pages/preevaluation/preevaluation-intro.component';
import { PreevaluationProfileComponent } from './pages/preevaluation/preevaluation-profile.component';
import { PreevaluationTestComponent } from './pages/preevaluation/preevaluation-test.component';
import { PreevaluationResultComponent } from './pages/preevaluation/preevaluation-result.component';
import { PreevaluationCheatingTerminatedComponent } from './pages/preevaluation/preevaluation-cheating-terminated.component';
import { LanguageOralInterviewComponent } from './pages/preevaluation/language-oral-interview.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { CertificateComponent } from './pages/certificate/certificate.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { CvComponent } from './pages/cv/cv.component';
import { JobOffersComponent } from './pages/job-offers/job-offers.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { RateTutorComponent } from './pages/rate-tutor/rate-tutor.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';

// Client Interface Components
import { ClientCoursesListComponent } from './pages/courses/client-courses-list/client-courses-list.component';
import { ClientCourseDetailsComponent } from './pages/courses/client-course-details/client-course-details.component';
import { ClientEventsListComponent } from './pages/events/client-events-list/client-events-list.component';
import { ClientEventDetailsComponent } from './pages/events/client-event-details/client-event-details.component';
import { ClientClubsListComponent } from './pages/clubs/client-clubs-list/client-clubs-list.component';
import { ClientClubDetailsComponent } from './pages/clubs/client-club-details/client-club-details.component';

// Event features (PI)
import { EventStatisticsComponent } from './components/event-statistics/event-statistics.component';
import { TicketScannerComponent } from './components/ticket-scanner/ticket-scanner.component';
import { EventsAdvancedComponent } from './pages/events-advanced/events-advanced.component';

// Payment/Cart (CODE2)
import { CartComponent } from './pages/cart/cart.component';

// Quiz-Feedback (CODE3)
import { QuizListComponent } from './quiz-feedback/components/quiz/quiz-list/quiz-list.component';
import { QuizDetailComponent } from './quiz-feedback/components/quiz/quiz-detail/quiz-detail.component';
import { QuizFormComponent } from './quiz-feedback/components/quiz/quiz-form/quiz-form.component';
import { TakeQuizComponent } from './quiz-feedback/components/quiz-attempt/take-quiz/take-quiz.component';
import { AttemptResultComponent } from './quiz-feedback/components/quiz-attempt/attempt-result/attempt-result.component';
import { FeedbackListComponent } from './quiz-feedback/components/feedback/feedback-list/feedback-list.component';
import { FeedbackFormComponent } from './quiz-feedback/components/feedback/feedback-form/feedback-form.component';

// Auth guard
import { guestGuard } from './guards/guest.guard';
import { adminGuard, authGuard } from './guards/auth.guard';
import { studentPreevaluationGateGuard } from './guards/student-preevaluation.guard';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';

// OAuth2 redirect component (inline — Spring sends the browser here after Google login)
import { Oauth2Redirect } from './user-management/oauth2Redirect/oauth2-redirect';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [studentPreevaluationGateGuard] },

  // Client Courses
  { path: 'courses', component: ClientCoursesListComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'courses/:id', component: ClientCourseDetailsComponent, canActivate: [studentPreevaluationGateGuard] },

  // Client Events
  { path: 'events', component: ClientEventsListComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'events/:id', component: ClientEventDetailsComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'events-advanced', component: EventsAdvancedComponent, canActivate: [studentPreevaluationGateGuard] },

  // Client Clubs
  { path: 'clubs', component: ClientClubsListComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'clubs/:id', component: ClientClubDetailsComponent, canActivate: [studentPreevaluationGateGuard] },

  // Event features (PI)
  { path: 'statistics', component: EventStatisticsComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'scanner', component: TicketScannerComponent, canActivate: [studentPreevaluationGateGuard] },

  // Cart (CODE2)
  { path: 'cart', component: CartComponent, canActivate: [studentPreevaluationGateGuard] },

  // Quizzes (CODE3)
  { path: 'quizzes', component: QuizListComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'quizzes/new', component: QuizFormComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'quizzes/:id', component: QuizDetailComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'quizzes/:id/edit', component: QuizFormComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'quizzes/:id/take', component: TakeQuizComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'attempts/:id/result', component: AttemptResultComponent, canActivate: [studentPreevaluationGateGuard] },

  // Feedbacks (CODE3)
  { path: 'feedbacks', component: FeedbackListComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'feedbacks/new', component: FeedbackFormComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'feedbacks/:id/edit', component: FeedbackFormComponent, canActivate: [studentPreevaluationGateGuard] },

  // Legacy routes (keeping for backward compatibility)
  { path: 'courses/manage', component: CourseManagementComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'messenger', component: MessengerComponent, canActivate: [studentPreevaluationGateGuard] },
  {
    path: 'preevaluation',
    component: PreevaluationShellComponent,
    canActivate: [studentPreevaluationGateGuard, authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'start' },
      { path: 'start', component: PreevaluationIntroComponent },
      { path: 'profile', component: PreevaluationProfileComponent },
      { path: 'test', component: PreevaluationTestComponent },
      { path: 'result', component: PreevaluationResultComponent },
      { path: 'cheating-terminated', component: PreevaluationCheatingTerminatedComponent },
      { path: 'oral-interview', component: LanguageOralInterviewComponent },
    ],
  },
  { path: 'quiz', component: QuizComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'certificate', component: CertificateComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'cv', component: CvComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'job-offers', component: JobOffersComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'my-applications', component: MyApplicationsComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'rate-tutor', component: RateTutorComponent, canActivate: [studentPreevaluationGateGuard] },
  { path: 'schedule', component: ScheduleComponent, canActivate: [studentPreevaluationGateGuard] },

  // Auth module (lazy-loaded) — guest guard prevents access when already logged in
  {
    path: 'auth',
    loadChildren: () =>
      import('./user-management/user-management-module').then(m => m.UserManagementModule),
    canActivate: [guestGuard],
  },

  // Top-level OAuth2 redirect — Spring redirects here after Google login
  // Must be at root level because Spring is configured with redirectUri ending in /oauth2/redirect
  { path: 'oauth2/redirect', component: Oauth2Redirect },

  // Admin (lazy-loaded)
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [adminGuard],
  },

  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [studentPreevaluationGateGuard, authGuard],
  },

  /** Entretien oral FR/EN — même composant que /preevaluation/oral-interview (accès direct depuis le menu) */
  {
    path: 'oral-interview',
    component: LanguageOralInterviewComponent,
    canActivate: [studentPreevaluationGateGuard, authGuard],
  },

  { path: '**', redirectTo: '' },
];
