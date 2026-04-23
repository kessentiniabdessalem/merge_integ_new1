import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AiService } from '../../services/ai.service';
import { QuizAttemptService } from '../../../quiz-feedback/services/quiz-feedback.services';
import { PersonalizedFeedback } from '../../models/ai.models';

@Component({
  selector: 'app-ai-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-feedback.component.html',
  styleUrls: ['./ai-feedback.component.scss']
})
export class AiFeedbackComponent implements OnInit {
  feedback: PersonalizedFeedback | null = null;
  loading = false;
  error = '';
  attemptId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private aiService: AiService,
    private attemptService: QuizAttemptService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['attemptId']) {
        this.attemptId = +params['attemptId'];
        this.loadFeedback();
      }
    });
  }

  loadFeedback() {
    if (!this.attemptId) return;

    this.loading = true;
    this.error = '';

    this.attemptService.getById(this.attemptId).subscribe({
      next: (attempt) => {
        const request = {
          attemptId: this.attemptId!,
          quizTitle: 'Quiz',
          score: attempt.score || 0,
          totalPoints: attempt.totalPoints || 100,
          questionResults: []
        };

        this.aiService.analyzeFeedback(request).subscribe({
          next: (feedback) => {
            this.feedback = feedback;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to generate feedback';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load attempt';
        this.loading = false;
      }
    });
  }
}
