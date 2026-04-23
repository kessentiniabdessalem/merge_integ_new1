import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminCoursesComponent } from './courses/admin-courses.component';
import { AdminEventsComponent } from './events/admin-events.component';

// Courses CRUD (standalone)
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CourseFormComponent } from './courses/course-form/course-form.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';

// Clubs CRUD (standalone)
import { ClubsListComponent } from './clubs/clubs-list/clubs-list.component';
import { ClubFormComponent } from './clubs/club-form/club-form.component';
import { ClubDetailsComponent } from './clubs/club-details/club-details.component';

// Event form (CODE2, standalone)
import { EventFormComponent } from './events/event-form/event-form.component';

// Payments (CODE2, not standalone)
import { PaymentListComponent } from './payments/payment-list/payment-list.component';
import { PaymentFormComponent } from './payments/payment-form/payment-form.component';

// Certificates (CODE2, not standalone)
import { CertificateListComponent } from './certificates/certificate-list/certificate-list.component';
import { CertificateFormComponent } from './certificates/certificate-form/certificate-form.component';

// Quiz-Feedback + AI modules (CODE3)
import { QuizFeedbackModule } from '../quiz-feedback/quiz-feedback.module';
import { AiModule } from '../ai/ai.module';

// Auth/User management — non-standalone (declared)
import { AddAdminComponent } from './admins/add-admin.component';
import { AddTutorComponent } from './tutors/add-tutor.component';
import { TutorsListComponent } from './tutors/tutors-list.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersStatsComponent } from './users-stats/users-stats.component';

// Auth/User management — standalone (imported)
import { AdminProfileComponent } from './profile/admin-profile.component';

// Jobs / Applications / Meetings / Ratings (NEW — standalone)
import { AdminJobsListComponent } from './jobs/jobs-list/admin-jobs-list.component';
import { AdminJobFormComponent } from './jobs/job-form/admin-job-form.component';
import { AdminApplicationsComponent } from './applications/admin-applications.component';
import { AdminMeetingsComponent } from './meetings/admin-meetings.component';
import { AdminRatingsComponent } from './ratings/admin-ratings.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminCoursesComponent,
    AdminEventsComponent,
    PaymentListComponent,
    PaymentFormComponent,
    CertificateListComponent,
    CertificateFormComponent,
    // Non-standalone new components
    AddAdminComponent,
    AddTutorComponent,
    UsersListComponent,
    UsersStatsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
    QuizFeedbackModule,
    AiModule,
    // Standalone components
    CoursesListComponent,
    CourseFormComponent,
    CourseDetailsComponent,
    ClubsListComponent,
    ClubFormComponent,
    ClubDetailsComponent,
    EventFormComponent,
    // Standalone — admin profile
    AdminProfileComponent,
    // Standalone — tutors list
    TutorsListComponent,
    // Standalone — jobs/applications/meetings/ratings
    AdminJobsListComponent,
    AdminJobFormComponent,
    AdminApplicationsComponent,
    AdminMeetingsComponent,
    AdminRatingsComponent,
  ],
})
export class AdminModule { }
