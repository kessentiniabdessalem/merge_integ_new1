import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { QuizFeedbackRoutingModule, FEEDBACK_ROUTES, ATTEMPT_ROUTES } from './quiz-feedback-routing.module';

import { QuizListComponent } from './components/quiz/quiz-list/quiz-list.component';
import { QuizFormComponent } from './components/quiz/quiz-form/quiz-form.component';
import { QuizDetailComponent } from './components/quiz/quiz-detail/quiz-detail.component';
import { TakeQuizComponent } from './components/quiz-attempt/take-quiz/take-quiz.component';
import { AttemptResultComponent } from './components/quiz-attempt/attempt-result/attempt-result.component';
import { FeedbackListComponent } from './components/feedback/feedback-list/feedback-list.component';
import { FeedbackFormComponent } from './components/feedback/feedback-form/feedback-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuizFeedbackRoutingModule,
    QuizListComponent,
    QuizFormComponent,
    QuizDetailComponent,
    TakeQuizComponent,
    AttemptResultComponent,
    FeedbackListComponent,
    FeedbackFormComponent
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class QuizFeedbackModule { }
