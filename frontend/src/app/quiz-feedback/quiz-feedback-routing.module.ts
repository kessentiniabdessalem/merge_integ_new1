import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QuizListComponent } from './components/quiz/quiz-list/quiz-list.component';
import { QuizFormComponent } from './components/quiz/quiz-form/quiz-form.component';
import { QuizDetailComponent } from './components/quiz/quiz-detail/quiz-detail.component';
import { TakeQuizComponent } from './components/quiz-attempt/take-quiz/take-quiz.component';
import { AttemptResultComponent } from './components/quiz-attempt/attempt-result/attempt-result.component';
import { FeedbackListComponent } from './components/feedback/feedback-list/feedback-list.component';
import { FeedbackFormComponent } from './components/feedback/feedback-form/feedback-form.component';

// Routes configurées dynamiquement selon le contexte
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizFeedbackRoutingModule { }

// Routes exportées pour être utilisées par le parent
export const QUIZ_ROUTES: Routes = [
  { path: '', component: QuizListComponent },
  { path: 'new', component: QuizFormComponent },
  { path: ':id', component: QuizDetailComponent },
  { path: ':id/edit', component: QuizFormComponent },
  { path: ':id/take', component: TakeQuizComponent }
];

export const FEEDBACK_ROUTES: Routes = [
  { path: '', component: FeedbackListComponent },
  { path: 'new', component: FeedbackFormComponent }
];

export const ATTEMPT_ROUTES: Routes = [
  { path: ':id/result', component: AttemptResultComponent }
];

