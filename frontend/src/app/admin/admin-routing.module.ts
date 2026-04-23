import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminCoursesComponent } from './courses/admin-courses.component';
import { AdminEventsComponent } from './events/admin-events.component';

// Courses CRUD
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CourseFormComponent } from './courses/course-form/course-form.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';

// Clubs CRUD
import { ClubsListComponent } from './clubs/clubs-list/clubs-list.component';
import { ClubFormComponent } from './clubs/club-form/club-form.component';
import { ClubDetailsComponent } from './clubs/club-details/club-details.component';

// Event CRUD (CODE2)
import { EventFormComponent } from './events/event-form/event-form.component';
import { EventsListComponent } from './events/events-list/events-list.component';
import { EventDetailsComponent } from './events/event-details/event-details.component';

// Payments CRUD (CODE2)
import { PaymentListComponent } from './payments/payment-list/payment-list.component';
import { PaymentFormComponent } from './payments/payment-form/payment-form.component';

// Certificates CRUD (CODE2)
import { CertificateListComponent } from './certificates/certificate-list/certificate-list.component';
import { CertificateFormComponent } from './certificates/certificate-form/certificate-form.component';

// Quiz-Feedback (CODE3)
import { QuizListComponent } from '../quiz-feedback/components/quiz/quiz-list/quiz-list.component';
import { QuizFormComponent } from '../quiz-feedback/components/quiz/quiz-form/quiz-form.component';
import { QuizDetailComponent } from '../quiz-feedback/components/quiz/quiz-detail/quiz-detail.component';
import { AttemptResultComponent } from '../quiz-feedback/components/quiz-attempt/attempt-result/attempt-result.component';
import { FeedbackListComponent } from '../quiz-feedback/components/feedback/feedback-list/feedback-list.component';
import { FeedbackFormComponent } from '../quiz-feedback/components/feedback/feedback-form/feedback-form.component';

// AI (CODE3)
import { QuizGeneratorComponent } from '../ai/components/quiz-generator/quiz-generator.component';
import { AiFeedbackComponent } from '../ai/components/ai-feedback/ai-feedback.component';

// Auth/User management components (standalone)
import { AddAdminComponent } from './admins/add-admin.component';
import { AddTutorComponent } from './tutors/add-tutor.component';
import { TutorsListComponent } from './tutors/tutors-list.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersStatsComponent } from './users-stats/users-stats.component';
import { AdminProfileComponent } from './profile/admin-profile.component';

// Jobs / Applications / Meetings / Ratings (NEW)
import { AdminJobsListComponent } from './jobs/jobs-list/admin-jobs-list.component';
import { AdminJobFormComponent } from './jobs/job-form/admin-job-form.component';
import { AdminApplicationsComponent } from './applications/admin-applications.component';
import { AdminMeetingsComponent } from './meetings/admin-meetings.component';
import { AdminRatingsComponent } from './ratings/admin-ratings.component';

const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'users', component: UsersListComponent },

            // Courses CRUD
            { path: 'courses', component: CoursesListComponent },
            { path: 'courses/create', component: CourseFormComponent },
            { path: 'courses/edit/:id', component: CourseFormComponent },
            { path: 'courses/:id', component: CourseDetailsComponent },

            // Events management + form (CODE2)
            { path: 'events', component: EventsListComponent },
            { path: 'events/create', component: EventFormComponent },
            { path: 'events/edit/:id', component: EventFormComponent },
            { path: 'events/:id', component: EventDetailsComponent },

            // Clubs CRUD
            { path: 'clubs', component: ClubsListComponent },
            { path: 'clubs/create', component: ClubFormComponent },
            { path: 'clubs/edit/:id', component: ClubFormComponent },
            { path: 'clubs/:id', component: ClubDetailsComponent },

            // Payments CRUD (CODE2)
            { path: 'payments', component: PaymentListComponent },
            { path: 'payments/create', component: PaymentFormComponent },
            { path: 'payments/:id/edit', component: PaymentFormComponent },

            // Certificates CRUD (CODE2)
            { path: 'certificates', component: CertificateListComponent },
            { path: 'certificates/create', component: CertificateFormComponent },
            { path: 'certificates/:id/edit', component: CertificateFormComponent },

            // Quizzes CRUD (CODE3)
            { path: 'quizzes', component: QuizListComponent },
            { path: 'quizzes/new', component: QuizFormComponent },
            { path: 'quizzes/:id', component: QuizDetailComponent },
            { path: 'quizzes/:id/edit', component: QuizFormComponent },
            { path: 'attempts/:id/result', component: AttemptResultComponent },

            // Feedbacks (CODE3)
            { path: 'feedbacks', component: FeedbackListComponent },
            { path: 'feedbacks/new', component: FeedbackFormComponent },
            { path: 'feedbacks/:id/edit', component: FeedbackFormComponent },

            // AI tools (CODE3)
            { path: 'ai/generator', component: QuizGeneratorComponent },
            { path: 'ai/feedback/:attemptId', component: AiFeedbackComponent },

            // User/Admin management
            { path: 'admins/create', component: AddAdminComponent },
            { path: 'tutors', component: TutorsListComponent },
            { path: 'tutors/create', component: AddTutorComponent },
            { path: 'users-list', component: UsersListComponent },
            { path: 'users-stats', component: UsersStatsComponent },
            { path: 'profile', component: AdminProfileComponent },

            // Jobs CRUD
            { path: 'jobs', component: AdminJobsListComponent },
            { path: 'jobs/create', component: AdminJobFormComponent },
            { path: 'jobs/edit/:id', component: AdminJobFormComponent },

            // Applications (per job)
            { path: 'applications/job/:jobId', component: AdminApplicationsComponent },

            // Meetings
            { path: 'meetings', component: AdminMeetingsComponent },

            // Ratings
            { path: 'ratings', component: AdminRatingsComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule { }
