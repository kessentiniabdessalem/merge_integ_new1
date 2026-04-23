import { Routes } from '@angular/router';
import { QuizGeneratorComponent } from './components/quiz-generator/quiz-generator.component';
import { AiFeedbackComponent } from './components/ai-feedback/ai-feedback.component';

export const AI_ROUTES: Routes = [
  { path: '', redirectTo: 'generator', pathMatch: 'full' },
  { path: 'generator', component: QuizGeneratorComponent },
  { path: 'feedback/:attemptId', component: AiFeedbackComponent }
];
