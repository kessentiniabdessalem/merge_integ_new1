import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Quiz, QuizStats, Question, QuizAttemptResponse, Feedback } from '../../../models/quiz-feedback.models';
import { QuizService, QuestionService, QuizAttemptService, FeedbackService } from '../../../services/quiz-feedback.services';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- ── LOADING ── -->
    <div *ngIf="loading" class="crud-page">
      <div class="page-header"><h1 class="page-title">Quiz Detail</h1></div>
      <div class="table-container" style="text-align:center;padding:48px 0;">
        <i class="ti ti-loader" style="font-size:2rem;"></i>
        <p style="margin-top:8px;color:#6c757d;">Loading...</p>
      </div>
    </div>

    <!-- ── MAIN ── -->
    <div *ngIf="!loading && quiz" class="crud-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ quiz.title }}</h1>
          <p class="page-subtitle">{{ quiz.description }}</p>
        </div>
        <div class="header-actions" style="gap:8px;">
          <button class="btn-admin secondary" (click)="goBack()">
            <i class="ti ti-arrow-left"></i> Back
          </button>
          <button *ngIf="isAdmin" class="btn-admin primary" (click)="editQuiz()">
            <i class="ti ti-pencil"></i> Edit Quiz
          </button>
          <button *ngIf="quiz.status === 'PUBLISHED'" class="btn-admin" style="background:#0ca678;color:#fff;" (click)="takeQuiz()">
            <i class="ti ti-player-play"></i> Take Quiz
          </button>
        </div>
      </div>

      <!-- Status Badge -->
      <div style="margin-bottom:16px;">
        <span class="badge"
          [style.background]="quiz.status === 'PUBLISHED' ? '#2fb344' : quiz.status === 'ARCHIVED' ? '#f59f00' : '#6c757d'"
          style="color:#fff;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;">
          {{ quiz.status }}
        </span>
      </div>

      <!-- Stats Row -->
      <div *ngIf="stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        <div class="table-container" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#206bc4;">{{ questions.length }}</div>
          <div style="color:#6c757d;font-size:13px;margin-top:4px;">Total Questions</div>
        </div>
        <div class="table-container" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#206bc4;">{{ stats.averageScore | number:'1.1-1' }}</div>
          <div style="color:#6c757d;font-size:13px;margin-top:4px;">Avg Score</div>
        </div>
        <div class="table-container" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#206bc4;">{{ stats.totalAttempts }}</div>
          <div style="color:#6c757d;font-size:13px;margin-top:4px;">Total Attempts</div>
        </div>
        <div class="table-container" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#206bc4;">{{ stats.passRate | number:'1.1-1' }}%</div>
          <div style="color:#6c757d;font-size:13px;margin-top:4px;">Pass Rate</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="table-container" style="padding:0;">
        <div style="display:flex;border-bottom:1px solid #e6e7e9;">
          <button *ngFor="let tab of tabs"
            (click)="activeTab = tab.key"
            style="padding:14px 24px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:500;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;"
            [style.border-bottom-color]="activeTab === tab.key ? '#206bc4' : 'transparent'"
            [style.color]="activeTab === tab.key ? '#206bc4' : '#6c757d'">
            <i [class]="'ti ' + tab.icon" style="margin-right:6px;"></i>{{ tab.label }}
          </button>
        </div>

        <div style="padding:24px;">

          <!-- ── QUESTIONS TAB ── -->
          <div *ngIf="activeTab === 'questions'">
            <div style="display:flex;justify-content:flex-end;margin-bottom:16px;" *ngIf="isAdmin">
              <button class="btn-admin primary" (click)="openQuestionForm()">
                <i class="ti ti-plus"></i> Add Question
              </button>
            </div>

            <!-- Question Form (inline card) -->
            <div *ngIf="showQuestionForm" style="border:1px solid #206bc4;border-radius:8px;margin-bottom:20px;overflow:hidden;">
              <div style="background:#206bc4;color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:600;">{{ editingQuestion ? 'Edit Question' : 'Add Question' }}</span>
                <button (click)="closeQuestionForm()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;">&times;</button>
              </div>
              <div style="padding:20px;">
                <form>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                    <div>
                      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">Question Type *</label>
                      <select class="filter-select" [(ngModel)]="newQuestion.type" name="type" style="width:100%;">
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                      </select>
                    </div>
                    <div>
                      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">Points *</label>
                      <input type="number" [(ngModel)]="newQuestion.points" name="points" min="1"
                        style="width:100%;padding:8px 12px;border:1px solid #e6e7e9;border-radius:6px;font-size:14px;">
                    </div>
                  </div>
                  <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">Question Text *</label>
                    <textarea [(ngModel)]="newQuestion.questionText" name="questionText" rows="3"
                      style="width:100%;padding:8px 12px;border:1px solid #e6e7e9;border-radius:6px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
                  </div>
                  <div *ngIf="newQuestion.type === 'MULTIPLE_CHOICE'" style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">Options *</label>
                    <div *ngFor="let option of newQuestion.options; let i = index"
                      style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                      <input type="text" [(ngModel)]="newQuestion.options![i]" [name]="'option' + i"
                        [placeholder]="'Option ' + (i + 1)"
                        style="flex:1;padding:8px 12px;border:1px solid #e6e7e9;border-radius:6px;font-size:14px;">
                      <button type="button" class="btn-action delete" (click)="removeOption(i)"
                        *ngIf="newQuestion.options!.length > 2">
                        <i class="ti ti-trash"></i>
                      </button>
                    </div>
                    <button type="button" class="btn-admin secondary" style="font-size:13px;padding:6px 12px;" (click)="addOption()">
                      <i class="ti ti-plus"></i> Add Option
                    </button>
                  </div>
                  <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">Correct Answer *</label>
                    <input type="text" [(ngModel)]="newQuestion.correctAnswer" name="correctAnswer"
                      [placeholder]="newQuestion.type === 'TRUE_FALSE' ? 'true or false' : 'Enter correct answer'"
                      style="width:100%;padding:8px 12px;border:1px solid #e6e7e9;border-radius:6px;font-size:14px;box-sizing:border-box;">
                  </div>
                  <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">Explanation (Optional)</label>
                    <textarea [(ngModel)]="newQuestion.explanation" name="explanation" rows="2"
                      style="width:100%;padding:8px 12px;border:1px solid #e6e7e9;border-radius:6px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
                  </div>
                  <div style="display:flex;justify-content:flex-end;gap:10px;">
                    <button type="button" class="btn-admin secondary" (click)="closeQuestionForm()">Cancel</button>
                    <button type="button" class="btn-admin primary" (click)="saveQuestion()">
                      <i class="ti ti-device-floppy"></i> Save Question
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Questions List -->
            <div *ngFor="let question of questions; let i = index"
              style="border:1px solid #e6e7e9;border-radius:8px;padding:16px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;">
                  <div style="font-weight:600;margin-bottom:6px;">
                    Q{{ i + 1 }}: {{ question.questionText }}
                  </div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
                    <span style="background:#e8f4ff;color:#206bc4;padding:2px 8px;border-radius:4px;font-size:12px;">{{ question.type }}</span>
                    <span style="background:#f1f3f5;color:#495057;padding:2px 8px;border-radius:4px;font-size:12px;">{{ question.points }} pts</span>
                  </div>
                  <div *ngIf="question.type === 'MULTIPLE_CHOICE' && question.options"
                    style="font-size:13px;color:#6c757d;margin-bottom:4px;">
                    Options: {{ question.options.join(', ') }}
                  </div>
                  <div style="font-size:13px;color:#2fb344;">
                    <i class="ti ti-circle-check"></i> Correct: {{ question.correctAnswer }}
                  </div>
                </div>
                <div *ngIf="isAdmin" class="action-buttons">
                  <button class="btn-action edit" (click)="openQuestionForm(question)"><i class="ti ti-pencil"></i></button>
                  <button class="btn-action delete" (click)="deleteQuestion(question.id!)"><i class="ti ti-trash"></i></button>
                </div>
              </div>
            </div>
            <div *ngIf="questions.length === 0" style="text-align:center;color:#6c757d;padding:40px 0;">
              <i class="ti ti-help-circle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
              No questions added yet.<span *ngIf="isAdmin"> Click "Add Question" to get started.</span>
            </div>
          </div>

          <!-- ── ATTEMPTS TAB ── -->
          <div *ngIf="activeTab === 'attempts'">
            <table class="data-table" *ngIf="attempts.length > 0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let attempt of attempts">
                  <td>{{ attempt.studentName || 'Student #' + attempt.studentId }}</td>
                  <td>{{ attempt.score }} / {{ attempt.totalPoints }}</td>
                  <td>
                    <span class="badge"
                      [style.background]="attempt.passed ? '#2fb344' : '#d63939'"
                      style="color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;">
                      {{ attempt.passed ? 'PASSED' : 'FAILED' }}
                    </span>
                  </td>
                  <td>{{ attempt.completedAt | date:'short' }}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="attempts.length === 0" style="text-align:center;color:#6c757d;padding:40px 0;">
              <i class="ti ti-clipboard-list" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
              No attempts yet.
            </div>
          </div>

          <!-- ── FEEDBACKS TAB ── -->
          <div *ngIf="activeTab === 'feedbacks'">
            <div *ngFor="let feedback of feedbacks"
              style="border:1px solid #e6e7e9;border-radius:8px;padding:16px;margin-bottom:12px;">
              <div style="font-weight:600;margin-bottom:4px;">
                {{ feedback.studentName || 'Student #' + feedback.studentId }}
              </div>
              <div style="color:#f59f00;margin-bottom:8px;">
                <i *ngFor="let star of getStarArray(feedback.rating)"
                  [class]="'ti ' + (star ? 'ti-star-filled' : 'ti-star')"></i>
              </div>
              <p style="margin:0 0 6px;">{{ feedback.comment }}</p>
              <small style="color:#6c757d;">{{ feedback.createdAt | date:'short' }}</small>
            </div>
            <div *ngIf="feedbacks.length === 0" style="text-align:center;color:#6c757d;padding:40px 0;">
              <i class="ti ti-message-circle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
              No feedback yet.
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- ── NOT FOUND ── -->
    <div *ngIf="!loading && !quiz" class="crud-page">
      <div class="page-header"><h1 class="page-title">Quiz Detail</h1></div>
      <div class="table-container" style="text-align:center;padding:48px 0;color:#6c757d;">
        <i class="ti ti-alert-circle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
        Quiz not found.
        <div style="margin-top:16px;">
          <button class="btn-admin secondary" (click)="goBack()">
            <i class="ti ti-arrow-left"></i> Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  `
})
export class QuizDetailComponent implements OnInit, OnDestroy {
  quiz?: Quiz;
  questions: Question[] = [];
  attempts: QuizAttemptResponse[] = [];
  feedbacks: Feedback[] = [];
  stats?: QuizStats;
  activeTab = 'questions';
  loading = false;
  showQuestionForm = false;
  editingQuestion?: Question;
  isAdmin = false;

  tabs = [
    { key: 'questions', label: 'Questions', icon: 'ti-help-circle' },
    { key: 'attempts',  label: 'Attempts',  icon: 'ti-clipboard-list' },
    { key: 'feedbacks', label: 'Feedbacks', icon: 'ti-message-circle' }
  ];

  newQuestion: Partial<Question> = {
    type: 'MULTIPLE_CHOICE',
    points: 10,
    options: ['', '', '', ''],
    correctAnswer: '',
    questionText: ''
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private questionService: QuestionService,
    private attemptService: QuizAttemptService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.router.url.includes('/admin');
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = +params['id'];
      if (id) this.loadQuizDetails(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate([this.isAdmin ? '/admin/quizzes' : '/quizzes']);
  }

  loadQuizDetails(id: number): void {
    this.loading = true;
    this.quizService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.loadQuestions(id);
        this.loadStats(id);
        this.loadAttempts(id);
        this.loadFeedbacks(id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        this.loading = false;
      }
    });
  }

  loadQuestions(quizId: number): void {
    this.questionService.getByQuiz(quizId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (questions) => this.questions = questions,
      error: (error) => console.error('Error loading questions:', error)
    });
  }

  loadStats(quizId: number): void {
    this.quizService.getStats(quizId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  loadAttempts(quizId: number): void {
    this.attemptService.getByQuiz(quizId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (attempts) => this.attempts = attempts,
      error: (error) => console.error('Error loading attempts:', error)
    });
  }

  loadFeedbacks(quizId: number): void {
    this.feedbackService.getByQuiz(quizId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (feedbacks) => this.feedbacks = feedbacks,
      error: (error) => console.error('Error loading feedbacks:', error)
    });
  }

  takeQuiz(): void {
    if (this.quiz?.id) {
      this.router.navigate([this.isAdmin ? '/admin/quizzes' : '/quizzes', this.quiz.id, 'take']);
    }
  }

  editQuiz(): void {
    if (this.quiz?.id) {
      this.router.navigate(['/admin/quizzes', this.quiz.id, 'edit']);
    }
  }

  deleteQuestion(id: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questionService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { if (this.quiz?.id) this.loadQuestions(this.quiz.id); },
        error: (error) => console.error('Error deleting question:', error)
      });
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  openQuestionForm(question?: Question): void {
    this.showQuestionForm = true;
    if (question) {
      this.editingQuestion = question;
      this.newQuestion = { ...question };
    } else {
      this.editingQuestion = undefined;
      this.newQuestion = {
        quizId: this.quiz?.id,
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: ['', '', '', ''],
        correctAnswer: '',
        questionText: '',
        explanation: ''
      };
    }
  }

  closeQuestionForm(): void {
    this.showQuestionForm = false;
    this.editingQuestion = undefined;
  }

  saveQuestion(): void {
    if (!this.newQuestion.questionText || !this.newQuestion.correctAnswer) {
      alert('Please fill all required fields');
      return;
    }
    if (this.editingQuestion?.id) {
      this.questionService.update(this.editingQuestion.id, this.newQuestion)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => { if (this.quiz?.id) this.loadQuestions(this.quiz.id); this.closeQuestionForm(); },
          error: (error) => console.error('Error updating question:', error)
        });
    } else {
      this.questionService.create(this.newQuestion as Question)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => { if (this.quiz?.id) this.loadQuestions(this.quiz.id); this.closeQuestionForm(); },
          error: (error) => console.error('Error creating question:', error)
        });
    }
  }

  addOption(): void {
    if (!this.newQuestion.options) this.newQuestion.options = [];
    this.newQuestion.options.push('');
  }

  removeOption(index: number): void {
    this.newQuestion.options?.splice(index, 1);
  }
}
